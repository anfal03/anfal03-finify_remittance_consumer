import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { nestwinstonLog, HttpPortLog } from './config/winstonLog';
import { ValidateInputPipe } from './middleware/validate';
import * as i18n from 'i18n';

import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: nestwinstonLog,
  });
  i18n.configure({
    locales: ['en', 'ab'],
    defaultLocale: 'en',
    directory: `${__dirname}/locales`,
    objectNotation: true,
  });
  const config = new DocumentBuilder()
    .setTitle('REGISTRATION')
    .setDescription('This Module is ACCOUNT OPENNING')
    .setVersion('1.0')
    .addTag('registration')
    .build();
  i18n.setLocale('ab');
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.setGlobalPrefix('remittance');
 // expressBind(app, { locales: ['en'] });

 // app.use(localize);
  app.enableCors();

  app.useGlobalPipes(new ValidateInputPipe());
  //use globally to check auth module from request header
  // app.useGlobalGuards(new AuthModuleGuard());
  await app.listen(process.env.PORT || 3000, () =>
    HttpPortLog(process.env.PORT || 3000),
  );

 
}
bootstrap();
