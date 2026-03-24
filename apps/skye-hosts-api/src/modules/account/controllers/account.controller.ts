import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  IGetAccountDetailsResponseDto,
  IUpdateAccountPrivacyResponseDto,
} from '@repo/skye-hosts-api-client';
import { AuthenticatedUser } from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  GetAccountDetailsResponseDto,
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
    dto.searchEngineIndexingEnabled = account.searchEngineIndexingEnabled;
    return dto;
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
