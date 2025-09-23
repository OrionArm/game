import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { encounters, worldState, encounterResolutions, worldEvents, type NewWorldEvent} from './world.schema';
import { ResolveEncounterDto, WorldStateResponseDto, EncounterResponseDto, EncounterResolutionResponseDto } from './world.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class WorldService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getWorldState(): Promise<WorldStateResponseDto> {
    const [state] = await this.drizzleService.db
      .select()
      .from(worldState)
      .limit(1);

    if (!state) {
      // Создаем начальное состояние мира, если его нет
      const [newState] = await this.drizzleService.db
        .insert(worldState)
        .values({
          currentDay: 1,
          activeEncounters: [],
          worldEvents: [],
        })
        .returning();

      // Генерируем начальные события мира
      const eventsResult = await this.generateInitialWorldEvents();
      console.log(`🌍 События мира ${eventsResult.created ? 'созданы' : 'уже существуют'}: ${eventsResult.count} событий`);

      return {
        currentDay: newState.currentDay,
        activeEncounters: newState.activeEncounters as any[],
        worldEvents: newState.worldEvents as any[],
        lastUpdated: newState.lastUpdated.toISOString(),
      };
    }

    return {
      currentDay: state.currentDay,
      activeEncounters: state.activeEncounters as any[],
      worldEvents: state.worldEvents as any[],
      lastUpdated: state.lastUpdated.toISOString(),
    };
  }

  async getEncounter(id: number): Promise<EncounterResponseDto> {
    const [encounter] = await this.drizzleService.db
      .select()
      .from(encounters)
      .where(eq(encounters.id, id))
      .limit(1);

    if (!encounter) {
      throw new NotFoundException('Энкаунтер не найден');
    }

    return {
      id: encounter.id,
      name: encounter.name,
      description: encounter.description || '',
      type: encounter.type,
      difficulty: encounter.difficulty,
      rewards: encounter.rewards,
      requirements: encounter.requirements,
    };
  }

  async resolveEncounter(
    id: number,
    userId: number,
    resolveDto: ResolveEncounterDto,
  ): Promise<EncounterResolutionResponseDto> {
    const encounter = await this.getEncounter(id);

    // Здесь должна быть логика разрешения энкаунтера
    // Пока что простая реализация
    const success = resolveDto.resolution === 'success';
    const rewardsReceived = success ? encounter.rewards : null;

    // Сохраняем результат разрешения
    await this.drizzleService.db.insert(encounterResolutions).values({
      encounterId: id,
      userId,
      resolution: resolveDto.resolution,
      rewardsReceived,
    });

    return {
      success,
      rewardsReceived,
      message: success 
        ? 'Энкаунтер успешно разрешен!' 
        : 'Энкаунтер не удалось разрешить.',
    };
  }

  async generateInitialWorldEvents(): Promise<{ created: boolean; count: number }> {
    // Проверяем, есть ли уже события в мире
    const existingEvents = await this.drizzleService.db
      .select()
      .from(worldEvents)
      .limit(1);

    if (existingEvents.length > 0) {
      // Подсчитываем общее количество существующих событий
      const allEvents = await this.drizzleService.db
        .select()
        .from(worldEvents);
      return { created: false, count: allEvents.length };
    }

    const STEP_PX = 64;
    const WORLD_LENGTH_PX = 64 * 200;
    const types: ('npc' | 'monster' | 'chest')[] = ['npc', 'monster', 'chest'];
    const used: number[] = [];
    const count = 18;
    const generated: NewWorldEvent[] = [];

    for (let i = 0; i < count; i++) {
      let x = Math.round(this.randomBetween(8, (WORLD_LENGTH_PX - 8) / STEP_PX)) * STEP_PX;
      let attempts = 0;
      
      // Проверяем, что события не слишком близко друг к другу
      while (used.some((u) => Math.abs(u - x) < STEP_PX * 4) && attempts < 20) {
        x = Math.round(this.randomBetween(8, (WORLD_LENGTH_PX - 8) / STEP_PX)) * STEP_PX;
        attempts++;
      }
      
      used.push(x);
      const type = types[Math.floor(Math.random() * types.length)];
      const eventData = this.createEventData(type, x, i);
      
      generated.push({
        eventId: `${type}-${x}-${i}`,
        position: x,
        type,
        title: eventData.title,
        description: eventData.description,
        imageUrl: eventData.imageUrl,
        requiresAction: true,
        actions: eventData.actions,
        rewards: eventData.rewards,
        isResolved: false,
      });
    }

    // Сортируем по позиции
    generated.sort((a, b) => a.position - b.position);

    // Сохраняем в базу данных
    await this.drizzleService.db.insert(worldEvents).values(generated);

    return { created: true, count: generated.length };
  }

  async getEventAtPosition(position: number): Promise<any | null> {
    const [event] = await this.drizzleService.db
      .select()
      .from(worldEvents)
      .where(and(
        eq(worldEvents.position, position),
        eq(worldEvents.isResolved, false)
      ))
      .limit(1);

    return event || null;
  }

  async resolveEvent(eventId: string, userId: number): Promise<void> {
    await this.drizzleService.db
      .update(worldEvents)
      .set({
        isResolved: true,
        resolvedBy: userId,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(worldEvents.eventId, eventId));
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private createEventData(type: string, position: number, index: number) {
    switch (type) {
      case 'npc':
        return {
          title: 'Путник',
          description: 'Незнакомец машет рукой',
          imageUrl: '/images/npc_traveler.png',
          actions: ['talk', 'ignore'],
          rewards: null,
        };
      case 'monster':
        return {
          title: 'Монстр',
          description: 'Враг преграждает путь',
          imageUrl: '/images/monster.png',
          actions: ['fight', 'run'],
          rewards: {
            gold: Math.floor(Math.random() * 30) + 10,
            experience: Math.floor(Math.random() * 15) + 5,
          },
        };
      case 'chest':
        return {
          title: 'Сундук',
          description: 'Старый сундук покрытый пылью',
          imageUrl: '/images/treasure_chest.png',
          actions: ['open', 'ignore'],
          rewards: {
            gold: Math.floor(Math.random() * 50) + 20,
            experience: Math.floor(Math.random() * 25) + 10,
          },
        };
      default:
        return {
          title: 'Странное место',
          description: 'Что-то необычное происходит здесь',
          imageUrl: '/images/mystery.png',
          actions: ['investigate', 'ignore'],
          rewards: null,
        };
    }
  }
}
