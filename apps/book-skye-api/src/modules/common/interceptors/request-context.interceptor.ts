import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { requestContext, RequestContext } from '../../../main.config';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const idTokenClaims = {};
    /*: ICognitoClaims =
      req.headers[DecoratorKeys.COGNITO_CLAIMS];*/

    const store: RequestContext = {
      requestId: randomUUID(),
      email: '',
    };

    // Seed AsyncLocalStorage
    return new Observable((subscriber) => {
      requestContext.run(store, () => {
        // Execute the rest of the request pipeline
        next.handle().subscribe({
          next: (val) => subscriber.next(val),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
