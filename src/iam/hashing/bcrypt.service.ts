import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { HashingService } from 'iam/hashing/hashing.service';

@Injectable()
export class BcryptService implements HashingService {
    async hash(data: string | Buffer): Promise<string> {
        const salt = await bcrypt.genSalt();

        return bcrypt.hash(data, salt);
    }

    async compare(data: string | Buffer, hash: string): Promise<boolean> {
        return bcrypt.compare(data, hash);
    }
}
