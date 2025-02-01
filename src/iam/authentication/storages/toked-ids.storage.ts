import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';

import { User } from 'shared/entities/user.entity';

import redisConfig from 'config/redis.config';

import InvalidatedToken from 'iam/authentication/exceptions/invalidated-token.exception';

@Injectable()
export class TokedIdsStorage implements OnApplicationBootstrap, OnApplicationShutdown {
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

    async insert({
        userId,
        tokenId,
        keyPrefix,
    }: {
        userId: User['id'];
        tokenId: string;
        keyPrefix?: string;
    }): Promise<void> {
        const key = this.getKey(userId, keyPrefix);

        await this.redisClient.set(key, tokenId);
    }

    async get(userId: User['id'], keyPrefix?: string): Promise<string> {
        const key = this.getKey(userId, keyPrefix);

        return this.redisClient.get(key);
    }

    async validate({
        userId,
        tokenId,
        keyPrefix,
    }: {
        userId: User['id'];
        tokenId: string;
        keyPrefix?: string;
    }): Promise<boolean> {
        const key = this.getKey(userId, keyPrefix);
        const storedTokenId = await this.redisClient.get(key);

        if (tokenId !== storedTokenId) {
            throw new InvalidatedToken();
        }

        return true;
    }

    async invalidate(userId: User['id'], keyPrefix?: string): Promise<void> {
        const key = this.getKey(userId, keyPrefix);

        await this.redisClient.del(key);
    }

    private getKey(userId: User['id'], prefix = ''): string {
        return `${prefix}_user-${userId}`;
    }
}
