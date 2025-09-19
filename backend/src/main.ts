import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerConfig } from './common/logger';
dotenv.config({ path: '../.env' });

async function bootstrap() {
  const logger = WinstonModule.createLogger(WinstonLoggerConfig);
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.enableCors({
    origin: `http://localhost:${process.env.VITE_PORT}`,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
console.log('Server is running on port ', process.env.PORT);

void bootstrap();
