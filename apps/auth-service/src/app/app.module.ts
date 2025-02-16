import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from '../modules/tenants/tenants.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { FirebaseModule } from '@izistore/firebase';
import { TestHelpersModule } from '../modules/test-helpers/test-helpers.module';

@Module({
  imports: [
    TenantModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log({
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT') || '5432'),
          database: configService.get('DB_NAME'),
          logging: configService.get('DB_LOGGING') === 'true',
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          synchronize: configService.get('DB_SYNC') === 'true',
          type: 'postgres',
          cache: true,
          autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        });

        return {
          host: configService.get('DB_HOST'),
          port: parseInt(configService.get('DB_PORT') || '5432'),
          database: configService.get('DB_NAME'),
          logging: configService.get('DB_LOGGING') === 'true',
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          synchronize: configService.get('DB_SYNC') === 'true',
          type: 'postgres',
          cache: true,
          autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        } as TypeOrmModuleOptions;
      },
    }),
    FirebaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        FIREBASE_PROJECT_ID: configService.get('FIREBASE_PROJECT_ID', ''),
        FIREBASE_PRIVATE_KEY: configService.get('FIREBASE_PRIVATE_KEY', ''),
        FIREBASE_CLIENT_EMAIL: configService.get('FIREBASE_CLIENT_EMAIL', ''),
      }),
    }),
    TestHelpersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
