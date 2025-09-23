import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WorldService } from './world/world.service';

async function seed() {
  console.log('🌱 Начинаем заполнение базы данных...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const worldService = app.get(WorldService);

  try {
    // Генерируем начальные события мира
    console.log('🎲 Генерируем события мира...');
    const result = await worldService.generateInitialWorldEvents();
    
    if (result.created) {
      console.log(`✅ События мира успешно созданы: ${result.count} событий`);
      console.log('📊 События размещены на случайных позициях');
      console.log('🎯 Типы событий: NPC, Монстры, Сундуки');
    } else {
      console.log(`ℹ️ События мира уже существуют: ${result.count} событий`);
    }

    console.log('🎉 Заполнение базы данных завершено!');
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seed();
