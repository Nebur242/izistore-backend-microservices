import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  REDIS_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  REDIS_PORT: string;

  @IsNotEmpty()
  @IsString()
  REDIS_URL: string;

  @IsNotEmpty()
  @IsString()
  REDIS_USER: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  AUTH_SERVICE_PORT: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  AUTH_SERVICE_HOST: string;
}
