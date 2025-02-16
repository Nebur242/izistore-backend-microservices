import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule, RedisModuleOptions } from '@izistore/redis';
import { validateEnvironment } from '../config/env.validator';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProxyModule } from '../modules/proxy/proxy.module';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '@izistore/firebase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment, // Validate environment variables
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: configService.get('AUTH_SERVICE_HOST'),
              port: configService.get('AUTH_SERVICE_PORT'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): RedisModuleOptions => {
        console.log('REDIS_HOST', configService.get('REDIS_HOST', 'localhost'));
        return {
          config: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(configService.get('REDIS_PORT', '6379')),
            password: configService.get('REDIS_PASSWORD'),
            db: parseInt(configService.get('REDIS_DB', '0')),
          },
        };
      },
      inject: [ConfigService],
    }),
    FirebaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        FIREBASE_PROJECT_ID: configService.get('FIREBASE_PROJECT_ID', ''),
        FIREBASE_PRIVATE_KEY: configService.get('FIREBASE_PRIVATE_KEY', ''),
        FIREBASE_CLIENT_EMAIL: configService.get('FIREBASE_CLIENT_EMAIL', ''),
        FIREBASE_REST_API_KEY: configService.get('FIREBASE_REST_API_KEY', ''),
      }),
    }),
    ProxyModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
