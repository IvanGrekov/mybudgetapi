import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return `Hello World! It's "My Budget" App's API!`;
    }
}
