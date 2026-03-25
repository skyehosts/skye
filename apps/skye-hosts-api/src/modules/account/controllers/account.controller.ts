import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  IGetAccountDetailsResponseDto,
  IRequestProfilePhotoUploadResponseDto,
  IUpdateAccountPrivacyResponseDto,
} from '@repo/skye-hosts-api-client';
import { AuthenticatedUser, AuthoriseRole } from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  ConfirmProfilePhotoUploadRequestDto,
  GetAccountDetailsResponseDto,
  RequestProfilePhotoUploadResponseDto,
  UpdateAccountPrivacyRequestDto,
  UpdateAccountPrivacyResponseDto,
} from '../dto';
import { AccountService } from '../providers';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('details')
  async onGetDetails(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IGetAccountDetailsResponseDto> {
    const account = await this.accountService.findById(authenticatedUser.sub);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }
    const dto = new GetAccountDetailsResponseDto();
    dto.email = account.email;
    dto.name = account.name;
    dto.phoneNumber = account.phoneNumber;
    dto.profilePhotoUrl = this.accountService.buildProfilePhotoUrl(
      account.profilePhotoKey,
    );
    dto.searchEngineIndexingEnabled = account.searchEngineIndexingEnabled;
    return dto;
  }

  @Post('profile-photo/request-upload')
  @AuthoriseRole('host')
  async onRequestProfilePhotoUpload(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IRequestProfilePhotoUploadResponseDto> {
    const result = await this.accountService.requestProfilePhotoUpload(
      authenticatedUser.sub,
    );
    const dto = new RequestProfilePhotoUploadResponseDto();
    dto.uploadUrl = result.uploadUrl;
    dto.photoKey = result.photoKey;
    return dto;
  }

  @Post('profile-photo/confirm-upload')
  @AuthoriseRole('host')
  @HttpCode(200)
  async onConfirmProfilePhotoUpload(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() body: ConfirmProfilePhotoUploadRequestDto,
  ): Promise<void> {
    await this.accountService.confirmProfilePhotoUpload(
      authenticatedUser.sub,
      body.photoKey,
    );
  }

  @Delete('profile-photo')
  @AuthoriseRole('host')
  @HttpCode(200)
  async onDeleteProfilePhoto(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.accountService.deleteProfilePhoto(authenticatedUser.sub);
  }

  @Patch('privacy')
  async onUpdatePrivacy(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
    @Body() body: UpdateAccountPrivacyRequestDto,
  ): Promise<IUpdateAccountPrivacyResponseDto> {
    const account = await this.accountService.findById(authenticatedUser.sub);
    if (!account) {
      throw new UnauthorizedException('Account not found');
    }
    account.searchEngineIndexingEnabled = body.searchEngineIndexingEnabled;
    await this.accountService.save(account);

    const dto = new UpdateAccountPrivacyResponseDto();
    dto.searchEngineIndexingEnabled = account.searchEngineIndexingEnabled;
    return dto;
  }
}
