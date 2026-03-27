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
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as Sentry from '@sentry/nestjs';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import {
  IMAGE_WIDTHS,
  toListingImageDto,
} from '../../common/utils/listing-image-url.util';
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

const MAX_IMAGES_PER_LISTING = 20;

@Injectable()
export class ListingImageService {
  private readonly logger = new Logger(ListingImageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnDomain: string;

  constructor(
    @InjectRepository(ListingImage)
    private readonly listingImageRepo: Repository<ListingImage>,
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly queueMessageService: AwsQueueSendMessageService,
  ) {
    this.s3Client = new S3Client({
      region: 'eu-west-1',
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    const env = this.configService.getAll();
    this.bucketName = env.awsS3ImagesBucket;
    this.cdnDomain = env.awsCloudfrontImagesDomain;
  }

  async requestUpload(
    listingId: number,
    hostId: number,
  ): Promise<RequestListingImageUploadResponseDto> {
    await this.verifyListingOwnership(listingId, hostId);

    const imageId = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.getRepository(ListingImage).find({
        where: { listingId },
        select: ['id'],
        lock: { mode: 'pessimistic_write' },
      });
      const existingCount = existing.length;

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
    });

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

    const imageIds = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.getRepository(ListingImage).find({
        where: { listingId },
        select: ['id'],
        lock: { mode: 'pessimistic_write' },
      });
      const existingCount = existing.length;

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
    });

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
    const image = await this.listingImageRepo.findOne({
      where: { id: imageId },
    });

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
    const images = await this.listingImageRepo.findByIds(imageIds);

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
    const images = await this.listingImageRepo.find({
      where: { listingId },
      order: { position: 'ASC' },
    });

    return {
      images: images.map((image) => this.toImageDto(image)),
    };
  }

  async deleteImage(imageId: string, hostId: number): Promise<void> {
    const image = await this.listingImageRepo.findOne({
      where: { id: imageId },
    });

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

    const { listingId } = image;

    await this.listingImageRepo.remove(image);

    // Reorder remaining images to close the gap
    const remainingImages = await this.listingImageRepo.find({
      where: { listingId },
      order: { position: 'ASC' },
    });

    for (let i = 0; i < remainingImages.length; i++) {
      if (remainingImages[i].position !== i) {
        remainingImages[i].position = i;
        await this.listingImageRepo.save(remainingImages[i]);
      }
    }

    this.logger.debug(`Deleted image ${imageId} from listing ${listingId}`);
  }

  async reorderImages(
    listingId: number,
    imageIds: string[],
    hostId: number,
  ): Promise<void> {
    await this.verifyListingOwnership(listingId, hostId);

    const images = await this.listingImageRepo.find({
      where: { listingId },
    });

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
        await this.listingImageRepo.save(image);
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
      ContentType: 'image/jpeg',
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 300 });
  }

  private toImageDto(image: ListingImage) {
    return toListingImageDto(this.cdnDomain, image);
  }

  private async verifyListingOwnership(
    listingId: number,
    hostId: number,
  ): Promise<Listing> {
    const listing = await this.listingRepo.findOne({
      where: { id: listingId },
    });

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
      this.logger.error(`Failed to delete S3 object ${key}: ${message}`);
      Sentry.captureException(error);
    }
  }
}
