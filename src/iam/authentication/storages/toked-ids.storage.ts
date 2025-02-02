import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';

import { User } from 'shared/entities/user.entity';
import log from 'shared/utils/log';

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
        expiresIn = 2_592_000, // 30 days
    }: {
        userId: User['id'];
        tokenId: string;
        keyPrefix?: string;
        expiresIn?: number;
    }): Promise<void> {
        const key = this.getKey(userId, keyPrefix);

        log(new Date().toISOString(), '- insert key:', key);

        await this.redisClient.set(key, tokenId, 'EX', expiresIn);
    }

    async get(userId: User['id'], keyPrefix?: string): Promise<string> {
        const key = this.getKey(userId, keyPrefix);

        return this.redisClient.get(key) ?? '';
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
        const isTokenValid = tokenId === storedTokenId;

        log(new Date().toISOString(), '- validate key:', key, `| isTokenValid: ${isTokenValid}`);

        if (!isTokenValid) {
            throw new InvalidatedToken();
        }

        return true;
    }

    async invalidateUserKeys(userId: User['id']): Promise<void> {
        const pattern = `*${this.getKey(userId)}*`;
        const keys = await this.redisClient.keys(pattern);

        log(new Date().toISOString(), '- remove keys:', keys);

        await this.redisClient.del(keys);
    }

    private getKey(userId: User['id'], prefix = ''): string {
        return `${prefix}_user-${userId}`;
    }
}
