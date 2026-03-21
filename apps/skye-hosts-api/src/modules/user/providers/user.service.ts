import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IAccountAuthenticatedRequestDto,
  IUserEditDetailsRequestDto,
  IUserSummaryVm,
} from '@repo/skye-hosts-api-client';
import { AccountService } from '../../account/providers';
import {
  GetEmailSubscriptionsResponseDto,
  SaveEmailSubscriptionsRequestDto,
} from '../dto';

@Injectable()
export class UserService {
  constructor(private accountService: AccountService) {}

  async delete(id: number): Promise<void> {
    await this.accountService.delete(id);
  }

  async editDetails(
    id: number,
    dto: IUserEditDetailsRequestDto,
  ): Promise<void> {
    const account = await this.accountService.findById(id);
    account.name = dto.name;
    await this.accountService.save(account);
  }

  async editEmail(id: number, email: string): Promise<void> {
    if (!email) {
      throw new BadRequestException();
    }
    const account = await this.accountService.findById(id);
    account.email = email;
    await this.accountService.save(account);
  }

  async hasSignedUp(id: number, email?: string): Promise<boolean> {
    let account = null;
    if (id) {
      account = await this.accountService.findById(id);
    } else {
      account = await this.accountService.findByEmail(email);
    }
    return !!account;
  }

  async onAuthenticated(
    id: number,
    dto: IAccountAuthenticatedRequestDto,
  ): Promise<IUserSummaryVm> {
    const account = await this.accountService.findById(id);
    if (!account) {
      throw new NotFoundException();
    }
    if (dto.cookieUsageEnabled && !account.cookieUsageEnabled) {
      // User accepted cookie disclaimer prior to being authenticated, so update now
      account.cookieUsageEnabled = true;
      await this.accountService.save(account);
    }
    return {
      cookieUsageEnabled: account.cookieUsageEnabled,
      dateJoined: account.dateJoined,
      name: account.name,
    };
  }

  async toggleCookieUsage(id: number, enable: boolean): Promise<void> {
    const account = await this.accountService.findById(id);
    account.cookieUsageEnabled = enable;
    await this.accountService.save(account);
  }

  async getEmailSubscriptions(
    id: number,
  ): Promise<GetEmailSubscriptionsResponseDto> {
    const account = await this.accountService.findById(id);
    return {
      subscribedToNewsViaEmail: account.subscribedToNewsViaEmail,
    };
  }

  async saveEmailSubscriptions(
    dto: SaveEmailSubscriptionsRequestDto,
    id: number,
  ) {
    const account = await this.accountService.findById(id);
    if (!account) {
      throw new NotFoundException();
    }
    account.subscribedToNewsViaEmail = dto.subscribedToNewsViaEmail;
    await this.accountService.save(account);
  }
}
