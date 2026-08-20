import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use('/payments/webhook', bodyParser.raw({
    type: 'application/json',
  }));

  app.use(bodyParser.json());

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://10.25.247.145:3001',
    ],
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
}

bootstrap();