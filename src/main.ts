import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { nestwinstonLog, HttpPortLog } from './config/winstonLog';
import { ValidateInputPipe } from './middleware/validate';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as i18n from 'i18n';

import 'dotenv/config';
import { CustomLogger } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          // clientId: 'kafka_client',
          brokers: [process.env.KAFKA_BROKERS],
        },
        consumer: {
          groupId: process.env.KAFKA_GROUP_ID,
          allowAutoTopicCreation: true,
        },
      },
      logger: nestwinstonLog,
    },
  );


  app.useLogger(app.get(CustomLogger));
  // expressBind(app, { locales: ['en'] });

  // app.use(localize);


  app.useGlobalPipes(new ValidateInputPipe());
  //use globally to check auth module from request header
  // app.useGlobalGuards(new AuthModuleGuard());
  await app.listen();
}
bootstrap();
