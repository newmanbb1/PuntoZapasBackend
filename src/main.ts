import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/middlewares/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplicamos el filtro global
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
