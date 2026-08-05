import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request['requestId'] || 'N/A';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const errorResponse = exception.getResponse();

      code = HttpStatus[status];

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message;
      }
    }

    // ✅ Always log errors
    this.logger.error({
      request_id: requestId,
      method: request.method,
      path: request.url,
      status,
      code,
      message,
      stack:
        exception instanceof Error
          ? exception.stack
          : String(exception),
    });

    response.status(status).json({
      error: {
        code,
        message,
        request_id: requestId,
      },
    });
  }
}