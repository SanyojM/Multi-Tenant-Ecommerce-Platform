import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const whitelist = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:3008',
    'http://localhost:3009',
    'http://localhost:3010'
  ]

  app.enableCors({
    origin:whitelist,
    method: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // if using cookies/auth headers
  })

  await app.listen(process.env.PORT ?? 4004);
}
bootstrap();
