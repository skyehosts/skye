import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import type { IGetAccountDetailsResponseDto } from '@repo/skye-hosts-api-client';
import { AuthenticatedUser } from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import { GetAccountDetailsResponseDto } from '../dto';
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
    dto.emailVerified = account.emailVerified;
    dto.name = account.name;
    return dto;
  }
}
