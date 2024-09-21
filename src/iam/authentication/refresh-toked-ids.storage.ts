import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';

import { User } from '../../shared/entities/user.entity';

import redisConfig from '../../config/redis.config';

import InvalidatedRefreshToken from './exceptions/invalidated-refresh-token.exception';

@Injectable()
export class RefreshTokedIdsStorage implements OnApplicationBootstrap, OnApplicationShutdown {
    constructor(
        @Inject(redisConfig.KEY)
        private readonly redisConfiguration: ConfigType<typeof redisConfig>,
    ) {}

    private redisClient: Redis;

    onApplicationBootstrap(): void {
        // TODO: Ideally, we should move this to the dedicated "RedisModule"
        this.redisClient = new Redis({
            host: this.redisConfiguration.host,
            port: this.redisConfiguration.port,
        });
    }

    onApplicationShutdown(): Promise<'OK'> {
        return this.redisClient.quit();
    }

    async insert(userId: User['id'], tokenId: string): Promise<void> {
        await this.redisClient.set(this.getKey(userId), tokenId);
    }

    async validate(userId: User['id'], tokenId: string): Promise<boolean> {
        const storedTokenId = await this.redisClient.get(this.getKey(userId));

        if (tokenId !== storedTokenId) {
            throw new InvalidatedRefreshToken();
        }

        return true;
    }

    async invalidate(userId: User['id']): Promise<void> {
        await this.redisClient.del(this.getKey(userId));
    }

    private getKey(userId: User['id']): string {
        return `user-${userId}`;
    }
}
