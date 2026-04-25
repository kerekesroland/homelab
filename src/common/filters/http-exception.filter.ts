import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    res.status(status).json({
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message: typeof body === 'object' && body !== null && 'message' in body ? (body as Record<string, unknown>).message : body,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
