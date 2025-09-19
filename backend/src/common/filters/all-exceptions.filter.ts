import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';
export type LogContext = {
  message: unknown;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  stack?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const stack = exception instanceof Error ? exception.stack : undefined;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.url,
      statusCode: status,
      message: getErrorMessage(exceptionResponse),
      stack,
    };

    this.logWithStatus(status, logContext);

    // Пробрасываем стандартный ответ NestJS
    if (exception instanceof HttpException) {
      response.status(status).json(exception.getResponse());
    } else {
      response.status(status).json({
        statusCode: status,
        message: 'Internal server error',
      });
    }
  }

  private logWithStatus(status: number, logContext: LogContext): void {
    if (status >= 500) {
      this.logger.error(logContext);
    } else {
      this.logger.warn(logContext);
    }
  }
}

function getErrorMessage(response: unknown): string {
  if (typeof response === 'string') {
    return response;
  }

  if (isErrorResponse(response)) {
    if (Array.isArray(response.message)) {
      return response.message.join('\n');
    } else return response.message;
  }

  return 'Unknown error';
}

function isErrorResponse(obj: unknown): obj is { message: string | string[] } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    (typeof obj.message === 'string' || Array.isArray(obj.message))
  );
}
