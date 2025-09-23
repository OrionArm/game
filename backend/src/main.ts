import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerConfig } from './common/logger';
import { WorldService } from './world/world.service';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function bootstrap() {
  const logger = WinstonModule.createLogger(WinstonLoggerConfig);
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.enableCors({
    origin: `http://localhost:${process.env.VITE_PORT}`,
    credentials: true,
  });

  // Инициализируем состояние мира при запуске
  try {
    const worldService = app.get(WorldService);
    await worldService.getWorldState();
    logger.log('🌍 Состояние мира инициализировано');
  } catch (error) {
    logger.warn('⚠️ Не удалось инициализировать состояние мира:', error.message);
  }

  await app.listen(process.env.PORT ?? 3000);
}
console.log('Server is running on port ', process.env.PORT);

void bootstrap();
