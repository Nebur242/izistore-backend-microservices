import { DynamicModule, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_OPTIONS } from './redis.constants';
import { RedisModuleOptions } from './redis.interfaces';

@Module({})
export class RedisModule {
  static forRootAsync(asyncOptions: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<RedisModuleOptions> | RedisModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisModule,
      imports: asyncOptions.imports || [],
      providers: [
        {
          provide: REDIS_OPTIONS,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject || [],
        },
        RedisService,
      ],
      exports: [RedisService],
      global: true,
    };
  }
}
