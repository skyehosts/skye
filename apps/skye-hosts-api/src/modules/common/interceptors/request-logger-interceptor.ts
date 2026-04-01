import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '../../config/providers/config.service';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);
  private readonly logRequests: boolean;

  constructor(private configService: ConfigService) {
    this.logRequests = this.configService.getAll().logRequests;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.logRequests) {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest();
    this.logger.debug(`Request (${req.url})`, '', req.body);
    return next.handle();
  }
}
