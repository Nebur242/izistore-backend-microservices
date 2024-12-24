import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from '../config/env.validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment, // Validate environment variables
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
