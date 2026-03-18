import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  IListingImageDto,
  IListingImageUrlDto,
} from '@repo/skye-hosts-api-client';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../../common/providers';
import { ConfigService } from '../../config/providers/config.service';
import { Listing } from '../../listing/entities';
import { AwsQueueSendMessageService } from '../../queue/providers';
import { AwsQueueNames } from '../../queue/types';
import {
  GetListingImagesResponseDto,
  RequestListingImageUploadItemDto,
  RequestListingImageUploadResponseDto,
  RequestListingImageUploadsResponseDto,
} from '../dto';
import { ListingImage } from '../entities';

const IMAGE_WIDTHS = [320, 640, 960, 1280, 1920];
const MAX_IMAGES_PER_LISTING = 20;

@Injectable()
export class ListingImageService {
  private readonly logger = new Logger(ListingImageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnDomain: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly queueMessageService: AwsQueueSendMessageService,
  ) {
    this.s3Client = new S3Client({ region: 'eu-west-1' });
    this.bucketName = this.configService.get<string>(
      'AWS_S3_LISTING_IMAGES_BUCKET',
    );
    this.cdnDomain = this.configService.get<string>(
      'AWS_CLOUDFRONT_LISTING_IMAGES_DOMAIN',
    );
  }

  async requestUpload(
    listingId: number,
    hostId: number,
  ): Promise<RequestListingImageUploadResponseDto> {
    await this.verifyListingOwnership(listingId, hostId);

    const imageId = await this.databaseService.runInTransaction(
      async (manager) => {
        const existingCount = await manager
          .getRepository(ListingImage)
          .count({ where: { listingId }, lock: { mode: 'pessimistic_write' } });

        if (existingCount >= MAX_IMAGES_PER_LISTING) {
          throw new BadRequestException(
            `A listing cannot have more than ${MAX_IMAGES_PER_LISTING} images`,
          );
        }

        const id = randomUUID();

        await manager.getRepository(ListingImage).save({
          id,
          listingId,
          position: existingCount,
          originalKey: `listings/${listingId}/original/${id}`,
        } as ListingImage);

        return id;
      },
    );

    const uploadUrl = await this.generatePresignedUrl(imageId, listingId);

    this.logger.debug(
      `Created image record ${imageId} for listing ${listingId}`,
    );

    return { imageId, uploadUrl };
  }

  async requestUploads(
    listingId: number,
    count: number,
    hostId: number,
  ): Promise<RequestListingImageUploadsResponseDto> {
    await this.verifyListingOwnership(listingId, hostId);

    const imageIds = await this.databaseService.runInTransaction(
      async (manager) => {
        const existingCount = await manager
          .getRepository(ListingImage)
          .count({ where: { listingId }, lock: { mode: 'pessimistic_write' } });

        if (existingCount + count > MAX_IMAGES_PER_LISTING) {
          throw new BadRequestException(
            `This would exceed the ${MAX_IMAGES_PER_LISTING} image limit. Listing currently has ${existingCount} image(s).`,
          );
        }

        const records: ListingImage[] = [];
        for (let i = 0; i < count; i++) {
          const id = randomUUID();
          records.push(
            manager.getRepository(ListingImage).create({
              id,
              listingId,
              position: existingCount + i,
              originalKey: `listings/${listingId}/original/${id}`,
            }),
          );
        }

        await manager.getRepository(ListingImage).save(records);

        return records.map((r) => r.id);
      },
    );

    const uploads: RequestListingImageUploadItemDto[] = await Promise.all(
      imageIds.map(async (imageId) => ({
        imageId,
        uploadUrl: await this.generatePresignedUrl(imageId, listingId),
      })),
    );

    this.logger.debug(
      `Created ${count} image records for listing ${listingId}`,
    );

    return { uploads };
  }

  async confirmUpload(imageId: string, hostId: number): Promise<void> {
    const image = await this.databaseService
      .getRepository(ListingImage)
      .findOne({ where: { id: imageId } });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.verifyListingOwnership(image.listingId, hostId);

    await this.queueMessageService.sendMessage(
      AwsQueueNames.LISTING_IMAGE_PROCESSING,
      {
        imageId: image.id,
        listingId: image.listingId,
        originalKey: image.originalKey,
      },
    );

    this.logger.debug(`Sent image processing message for image ${imageId}`);
  }

  async confirmUploads(imageIds: string[], hostId: number): Promise<void> {
    const images = await this.databaseService
      .getRepository(ListingImage)
      .findByIds(imageIds);

    if (images.length !== imageIds.length) {
      throw new NotFoundException('One or more images not found');
    }

    // Verify all images belong to listings owned by this host.
    // Group by listingId to avoid redundant ownership checks.
    const listingIds = [...new Set(images.map((img) => img.listingId))];
    await Promise.all(
      listingIds.map((listingId) =>
        this.verifyListingOwnership(listingId, hostId),
      ),
    );

    await Promise.all(
      images.map((image) =>
        this.queueMessageService.sendMessage(
          AwsQueueNames.LISTING_IMAGE_PROCESSING,
          {
            imageId: image.id,
            listingId: image.listingId,
            originalKey: image.originalKey,
          },
        ),
      ),
    );

    this.logger.debug(`Sent ${imageIds.length} image processing messages`);
  }

  async getListingImages(
    listingId: number,
  ): Promise<GetListingImagesResponseDto> {
    const images = await this.databaseService.getRepository(ListingImage).find({
      where: { listingId },
      order: { position: 'ASC' },
    });

    return {
      images: images.map((image) => this.toImageDto(image)),
    };
  }

  async deleteImage(imageId: string, hostId: number): Promise<void> {
    const image = await this.databaseService
      .getRepository(ListingImage)
      .findOne({ where: { id: imageId } });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.verifyListingOwnership(image.listingId, hostId);

    // Delete original from S3
    await this.deleteS3Object(image.originalKey);

    // Delete all derived variants from S3
    for (const width of IMAGE_WIDTHS) {
      const derivedKey = `listings/${image.listingId}/derived/${width}w/${image.id}.webp`;
      await this.deleteS3Object(derivedKey);
    }

    const deletedPosition = image.position;
    const { listingId } = image;

    await this.databaseService.getRepository(ListingImage).remove(image);

    // Reorder remaining images to close the gap
    const remainingImages = await this.databaseService
      .getRepository(ListingImage)
      .find({
        where: { listingId },
        order: { position: 'ASC' },
      });

    for (let i = 0; i < remainingImages.length; i++) {
      if (remainingImages[i].position !== i) {
        remainingImages[i].position = i;
        await this.databaseService
          .getRepository(ListingImage)
          .save(remainingImages[i]);
      }
    }

    this.logger.debug(
      `Deleted image ${imageId} at position ${deletedPosition} from listing ${listingId}`,
    );
  }

  async reorderImages(
    listingId: number,
    imageIds: string[],
    hostId: number,
  ): Promise<void> {
    await this.verifyListingOwnership(listingId, hostId);

    const images = await this.databaseService
      .getRepository(ListingImage)
      .find({ where: { listingId } });

    const imageMap = new Map(images.map((img) => [img.id, img]));

    for (const id of imageIds) {
      if (!imageMap.has(id)) {
        throw new BadRequestException(
          `Image ${id} does not belong to listing ${listingId}`,
        );
      }
    }

    for (let i = 0; i < imageIds.length; i++) {
      const image = imageMap.get(imageIds[i]);
      if (image.position !== i) {
        image.position = i;
        await this.databaseService.getRepository(ListingImage).save(image);
      }
    }

    this.logger.debug(
      `Reordered ${imageIds.length} images for listing ${listingId}`,
    );
  }

  private async generatePresignedUrl(
    imageId: string,
    listingId: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `listings/${listingId}/original/${imageId}`,
      ContentType: 'image/*',
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 300 });
  }

  private toImageDto(image: ListingImage): IListingImageDto {
    const urls: IListingImageUrlDto[] = IMAGE_WIDTHS.map((width) => ({
      width,
      url: `https://${this.cdnDomain}/listings/${image.listingId}/derived/${width}w/${image.id}.webp`,
    }));

    return {
      id: image.id,
      listingId: String(image.listingId),
      position: image.position,
      urls,
    };
  }

  private async verifyListingOwnership(
    listingId: number,
    hostId: number,
  ): Promise<Listing> {
    const listing = await this.databaseService
      .getRepository(Listing)
      .findOne({ where: { id: listingId } });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.hostId !== hostId) {
      throw new ForbiddenException(
        'You do not have permission to manage images for this listing',
      );
    }

    return listing;
  }

  private async deleteS3Object(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.debug(`Failed to delete S3 object ${key}: ${message}`);
    }
  }
}
