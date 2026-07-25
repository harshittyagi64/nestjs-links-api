import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    this.redis.on('error', (err) => {
      this.logger.warn(`Redis client warning: ${err.message}`);
    });
  }

  private getKey(code: string): string {
    return `redirect:${code}`;
  }

  async getRedirectTarget(code: string): Promise<string | null> {
    try {
      return await this.redis.get(this.getKey(code));
    } catch (error) {
      this.logger.warn(
        `Cache GET failed for code "${code}" (${(error as Error).message}). Falling back to storage.`,
      );
      return null;
    }
  }

  async setRedirectTarget(
    code: string,
    url: string,
    ttlSeconds = 3600,
  ): Promise<void> {
    try {
      await this.redis.set(this.getKey(code), url, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(
        `Cache SET failed for code "${code}" (${(error as Error).message}).`,
      );
    }
  }

  async invalidateRedirectTarget(code: string): Promise<void> {
    try {
      await this.redis.del(this.getKey(code));
    } catch (error) {
      this.logger.warn(
        `Cache DEL failed for code "${code}" (${(error as Error).message}).`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch {
      // ignore shutdown errors
    }
  }
}