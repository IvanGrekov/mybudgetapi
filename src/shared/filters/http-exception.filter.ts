import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const { statusCode, body } = this.getErrorDetails(exception);

        response.status(statusCode).json(body);
    }

    private getErrorDetails(exception: T): { statusCode: number; body: object } {
        const isDev = ['development', 'test'].includes(process.env.NODE_ENV);
        const statusCode = exception.getStatus();
        const errorResponse = exception.getResponse();

        const body = {
            statusCode,
        };

        if (isDev) {
            body['cause'] = exception.message;
            body['message'] =
                typeof errorResponse === 'string' ? errorResponse : errorResponse['message'];
            body['timestamp'] = new Date().toISOString();
        } else {
            body['message'] = exception.message;
        }

        return { statusCode, body };
    }
}
