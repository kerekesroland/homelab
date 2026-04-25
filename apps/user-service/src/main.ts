import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module.js';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
