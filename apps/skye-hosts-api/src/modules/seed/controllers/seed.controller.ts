import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { Environments } from '@repo/common';
import {
  //CognitoAdminGroup,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import { SecretAuthenticationGuard } from '../../common/guards';
import { E2eSeedService, SeedService } from '../providers';

@Controller('seed')
export class SeedController {
  constructor(
    private service: SeedService,
    private e2eSeedService: E2eSeedService,
  ) {}

  @Post()
  @IgnoreBearerAuthentication([Environments.PRODUCTION])
  //@CognitoAdminGroup()
  async onCreate(): Promise<void> {
    await this.service.createData();
  }

  @Post('e2e-reset')
  @IgnoreBearerAuthentication([Environments.PRODUCTION, Environments.QA])
  async onE2eReset(): Promise<{ ok: boolean }> {
    await this.e2eSeedService.resetAndSeed();
    return { ok: true };
  }

  @Delete()
  @IgnoreBearerAuthentication()
  @UseGuards(SecretAuthenticationGuard)
  async onTruncate(): Promise<void> {
    await this.service.truncateData();
  }
}
