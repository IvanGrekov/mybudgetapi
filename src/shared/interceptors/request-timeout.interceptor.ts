import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable()
export class RequestTimeoutInterceptor implements NestInterceptor {
    protected readonly timeout = 10000;

    intercept<T>(context: ExecutionContext, next: CallHandler): Observable<T> {
        return next.handle().pipe(
            timeout(this.timeout),
            catchError((error) => {
                if (error instanceof TimeoutError) {
                    throw new RequestTimeoutException();
                }

                return throwError(() => error);
            }),
        );
    }
}
