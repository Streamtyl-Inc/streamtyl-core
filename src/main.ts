import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { errorHandler } from './middleware/error';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';
import * as csurf from 'csurf';

const localhost = new RegExp('^https?://localhost*(:[0-9]+)?(/.*)?$');
const streamtyl = new RegExp('https?://([a-z0-9]+[.])*streamtyl[.]xyz');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  const logger = new Logger('Koin point core service');
  app.use(morgan('dev'));
  app.use(errorHandler);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    credentials: true,
    origin: [localhost, streamtyl],
    optionsSuccessStatus: 204,
  });

  await app.listen(5002);

  app.use(helmet());
  app.use(helmet.xssFilter());
  app.use(csurf());

  logger.debug(`streamtyl-core running on: ${await app.getUrl()}`);
}
bootstrap();
