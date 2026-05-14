import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/response.interface';

/**
 * HTTP Exception Filter
 * Catches all HTTP exceptions and formats them consistently
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    const errorResponse: ErrorResponse = {
      success: false,
      message: this.extractMessage(exceptionResponse),
      code: this.extractCode(status),
      errors: this.extractErrors(exceptionResponse),
    };

    response.status(status).json(errorResponse);
  }

  private extractMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (exceptionResponse.message) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message[0];
      }
      return exceptionResponse.message;
    }

    return 'An error occurred';
  }

  private extractCode(status: number): string {
    const codeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
    };

    return codeMap[status] || 'UNKNOWN_ERROR';
  }

  private extractErrors(exceptionResponse: any): any[] | undefined {
    if (
      typeof exceptionResponse === 'object' &&
      Array.isArray(exceptionResponse.message)
    ) {
      return exceptionResponse.message;
    }
    return undefined;
  }
}
