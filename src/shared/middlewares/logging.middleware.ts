import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import log from 'shared/utils/log';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const startTime = Date.now();

        res.on('finish', () => {
            console.group(method);
            log('url:', originalUrl);
            log('code:', res.statusCode);
            log('time:', Date.now() - startTime, 'ms');
            console.groupEnd();
        });

        next();
    }
}
