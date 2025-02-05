/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {
  BadRequestException,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { TransformInterceptor } from '@izistore/api-tools';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

const defaultVersion = 1;
const globalPrefix = 'api';

function setupSwagger(app: INestApplication): INestApplication {
  const config = new DocumentBuilder()
    .setTitle('Izistore Backend - Api Gateway')
    .setDescription('The Izistore Backend API documentation')
    .setVersion('0.0.1')
    .addBearerAuth({ type: 'http' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  return app;
}

function setupGlobalMiddlewares(app: INestApplication) {
  return (
    app
      .useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          exceptionFactory(errors) {
            return new BadRequestException({
              statusCode: 400,
              message: 'Bad Request',
              errors: errors.reduce(
                (acc, e) => [...acc, ...Object.values(e.constraints)],
                []
              ),
            });
          },
        })
      )
      .useGlobalInterceptors(new TransformInterceptor())
      // .useGlobalFilters(new BaseRpcExceptionFilter())
      .setGlobalPrefix(globalPrefix)
      .enableVersioning({
        type: VersioningType.URI,
        defaultVersion: `${defaultVersion}`,
      })
      .enableCors()
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const port = process.env.PORT || 3001;
  setupGlobalMiddlewares(app);
  setupSwagger(app);
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}/v${defaultVersion}`
  );
}

bootstrap();
