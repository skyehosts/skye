import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/providers/config.service';
import { BearerAuthenticationGuard } from './guards/bearer-authentication.guard';
import {
  RequestContextInterceptor,
  RequestLoggerInterceptor,
  ResponseInterceptor,
} from './interceptors';
import { ValidationResponseFormatterPipe } from './pipes';
import { LoggerService, UtilityService } from './providers';

@Global()
@Module({
  providers: [
    LoggerService,
    UtilityService,
    {
      provide: APP_GUARD,
      useFactory: (configService: ConfigService) => {
        // useFactory instead of useClass because otherwise reflector not injected properly
        return new BearerAuthenticationGuard(configService, new Reflector());
      },
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (configService: ConfigService) => {
        return new RequestLoggerInterceptor(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (configService: ConfigService) => {
        // useFactory instead of useClass because otherwise reflector not injected properly
        return new ResponseInterceptor(configService, new Reflector());
      },
      inject: [ConfigService],
    },
    {
      provide: APP_PIPE,
      useClass: ValidationResponseFormatterPipe,
    },
  ],
  imports: [ConfigModule],
  exports: [LoggerService, UtilityService],
})
export class CommonModule {}
