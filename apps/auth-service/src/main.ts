/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const port = parseInt(process.env.PORT || '3002');
  const host = process.env.HOST;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host, // Permet d'accepter les connexions de tous les conteneurs
        port,
      },
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  await app.listen();
  Logger.log(
    `🚀 Application is running on: http://${process.env.HOST}:${port}}`
  );
}

bootstrap();
