import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_OPTIONS } from './redis.constants';
import { RedisModuleOptions } from './redis.interfaces';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly clients: Map<string, Redis> = new Map();
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_OPTIONS) private readonly options: RedisModuleOptions
  ) {}

  async onModuleInit() {
    await this.initializeRedisClient();
  }

  private async initializeRedisClient() {
    const client = new Redis({
      host: this.options.config.host,
      port: this.options.config.port,
      password: this.options.config.password,
      db: this.options.config.db || 0,
    });

    client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });

    client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    client.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    client.on('end', () => {
      this.logger.warn('Redis connection ended');
    });

    try {
      await client.ping();
      this.logger.log('Redis ping successful');
      this.clients.set('default', client);
    } catch (error) {
      this.logger.error('Redis ping failed:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  getClient(name = 'default'): Redis {
    if (!this.clients.has(name)) {
      throw new Error(`Redis client ${name} does not exist`);
    }
    const client = this.clients.get(name);
    if (!client) throw new Error(`Redis client ${name} does not exist`);
    return client;
  }

  async publish(channel: string, message: any): Promise<number> {
    const client = this.getClient();
    return client.publish(channel, JSON.stringify(message));
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void
  ): Promise<void> {
    const subscriber = this.getClient().duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (channel, message) => {
      callback(JSON.parse(message));
    });
  }

  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.quit();
    }
  }
}
