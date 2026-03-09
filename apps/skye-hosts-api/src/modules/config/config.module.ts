import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Environments } from '@repo/common';
import { constants } from '../../constants';
import { databaseConfig } from '../../database/config';
import { ConfigService } from './providers/config.service';

@Global()
@Module({
  exports: [ConfigService],
  imports: [
    NestConfigModule.forRoot({
      envFilePath:
        process.env.SKYE_ENVIRONMENT === Environments.LOCAL
          ? constants.envPath
          : undefined,
      isGlobal: true,
      load: [databaseConfig],
    }),
  ],
  providers: [ConfigService],
})
export class ConfigModule {}
