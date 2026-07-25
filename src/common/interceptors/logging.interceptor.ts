import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const startTime = Date.now();
    const requestId = req['request_id'] || 'N/A';

    return next.handle().pipe(
      tap(() => {
        const log = {
          request_id: requestId,
          method: req.method,
          route: req.originalUrl,
          status_code: res.statusCode,
          latency_ms: Date.now() - startTime,
        };

        this.logger.log(JSON.stringify(log));
      }),
    );
  }
}