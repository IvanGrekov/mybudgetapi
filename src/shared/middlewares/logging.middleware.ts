import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const startTime = Date.now();

        res.on('finish', () => {
            console.log('------------');
            console.group(new Date().toISOString(), `- ${method}`);
            console.log('url:', originalUrl);
            console.log('code:', res.statusCode);
            console.log('time:', Date.now() - startTime, 'ms');
            console.groupEnd();
        });

        next();
    }
}
