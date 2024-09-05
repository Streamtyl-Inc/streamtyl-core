import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { errorHandler } from './middleware/error';
import { NestExpressApplication } from '@nestjs/platform-express';

const localhost = new RegExp('^https?://localhost*(:[0-9]+)?(/.*)?$');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new Logger('Koin point core service');
  app.use(morgan('dev'));
  app.use(errorHandler);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    credentials: true,
    origin: [localhost],
    optionsSuccessStatus: 204,
  });
  await app.listen(5000);
  app.use(helmet());
  app.use(helmet.xssFilter());
  logger.debug(`streamtyl-core running on: ${await app.getUrl()}`);
}
bootstrap();
