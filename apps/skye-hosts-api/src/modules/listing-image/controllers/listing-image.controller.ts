import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  AuthoriseRole,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  ConfirmListingImageUploadRequestDto,
  ConfirmListingImageUploadsRequestDto,
  GetListingImagesResponseDto,
  RequestListingImageUploadRequestDto,
  RequestListingImageUploadResponseDto,
  RequestListingImageUploadsRequestDto,
  RequestListingImageUploadsResponseDto,
  UpdateListingImageOrderRequestDto,
} from '../dto';
import { ListingImageService } from '../providers';

@Controller('listing-image')
export class ListingImageController {
  private readonly logger = new Logger(ListingImageController.name);

  constructor(private readonly listingImageService: ListingImageService) {}

  @Post('request-upload')
  @AuthoriseRole('host')
  async onRequestUpload(
    @Body() body: RequestListingImageUploadRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<RequestListingImageUploadResponseDto> {
    return this.listingImageService.requestUpload(
      Number(body.listingId),
      authenticatedUser.sub,
    );
  }

  @Post('request-uploads')
  @AuthoriseRole('host')
  async onRequestUploads(
    @Body() body: RequestListingImageUploadsRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<RequestListingImageUploadsResponseDto> {
    return this.listingImageService.requestUploads(
      Number(body.listingId),
      body.count,
      authenticatedUser.sub,
    );
  }

  @Post('confirm-upload')
  @AuthoriseRole('host')
  async onConfirmUpload(
    @Body() body: ConfirmListingImageUploadRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.listingImageService.confirmUpload(
      body.imageId,
      authenticatedUser.sub,
    );
  }

  @Post('confirm-uploads')
  @AuthoriseRole('host')
  async onConfirmUploads(
    @Body() body: ConfirmListingImageUploadsRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.listingImageService.confirmUploads(
      body.imageIds,
      authenticatedUser.sub,
    );
  }

  @Get(':listingId')
  @IgnoreBearerAuthentication()
  async onGetListingImages(
    @Param('listingId') listingId: string,
  ): Promise<GetListingImagesResponseDto> {
    return this.listingImageService.getListingImages(Number(listingId));
  }

  @Delete(':id')
  @AuthoriseRole('host')
  async onDeleteImage(
    @Param('id') id: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.listingImageService.deleteImage(id, authenticatedUser.sub);
  }

  @Patch('reorder')
  @AuthoriseRole('host')
  async onReorderImages(
    @Body() body: UpdateListingImageOrderRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.listingImageService.reorderImages(
      Number(body.listingId),
      body.imageIds,
      authenticatedUser.sub,
    );
  }
}
