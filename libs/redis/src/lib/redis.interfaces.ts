export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface RedisModuleOptions {
  config: RedisConfig;
}
