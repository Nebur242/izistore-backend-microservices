import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule, RedisModuleOptions } from '@izistore/redis';
// import { validateEnvironment } from '../config/env.validator';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProxyModule } from '../modules/proxy/proxy.module';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '@izistore/firebase';
import { firebaseConfig } from './firebase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // validate: validateEnvironment, // Validate environment variables
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.TCP,
            options: {
              host: configService.get('AUTH_SERVICE_HOST'),
              port: 3002,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): RedisModuleOptions => ({
        config: {
          host: 'redis-service',
          port: 6379,
          password: 'redis-secret-password',
        },
      }),
      inject: [ConfigService],
    }),
    FirebaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        FIREBASE_PROJECT_ID: firebaseConfig.FIREBASE_PROJECT_ID,
        FIREBASE_PRIVATE_KEY: firebaseConfig.FIREBASE_PRIVATE_KEY,
        FIREBASE_CLIENT_EMAIL: firebaseConfig.FIREBASE_CLIENT_EMAIL,
        FIREBASE_REST_API_KEY: firebaseConfig.FIREBASE_REST_API_KEY,
      }),
    }),
    ProxyModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
