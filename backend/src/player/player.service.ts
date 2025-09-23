import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { 
  players,
  type Player, 
  type NewPlayer,
} from './player.schema';
import { 
  PlayerStateResponseDto, 
  PlayerInventoryDto, 
  MoveResponseDto,
  GameEventDto,
} from './player.dto';
import { WorldService } from '../world/world.service';
import { eq } from 'drizzle-orm';

@Injectable()
export class PlayerService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly worldService: WorldService,
  ) {}

  async getPlayerState(userId: number): Promise<PlayerStateResponseDto> {
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      // Создаем нового игрока, если его нет
      const newPlayer: NewPlayer = {
        userId,
        name: `Player_${userId}`,
        health: 100,
        maxHealth: 100,
        gold: 100, // Начальное золото
        position: 0,
      };

      const [createdPlayer] = await this.drizzleService.db
        .insert(players)
        .values(newPlayer)
        .returning();

      return this.mapPlayerToResponse(createdPlayer);
    }

    return this.mapPlayerToResponse(player);
  }

  async movePlayer(userId: number): Promise<MoveResponseDto> {
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    const newPosition = player.position + 1;

    // Проверяем, есть ли событие на новой позиции
    const worldEvent = await this.worldService.getEventAtPosition(newPosition);
    const events: GameEventDto[] = [];

    if (worldEvent) {
      // Преобразуем событие мира в GameEventDto
      events.push({
        id: worldEvent.eventId,
        type: worldEvent.type as any,
        title: worldEvent.title,
        description: worldEvent.description,
        imageUrl: worldEvent.imageUrl,
        requiresAction: worldEvent.requiresAction,
        actions: worldEvent.actions as string[],
        rewards: worldEvent.rewards,
      });
    } else {
      // Если нет события на позиции, генерируем случайное событие
      const randomEvents = this.generateEvents(newPosition);
      events.push(...randomEvents);
    }

    // Обновляем позицию игрока
    await this.drizzleService.db
      .update(players)
      .set({
        position: newPosition,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id));

    // Получаем обновленное состояние игрока
    const [updatedPlayer] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.id, player.id))
      .limit(1);

    return {
      newPosition,
      events,
      playerState: this.mapPlayerToResponse(updatedPlayer),
    };
  }

  async getPlayerInventory(userId: number): Promise<PlayerInventoryDto> {
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Возвращаем инвентарь из JSON поля или пустой объект
    return (player.inventory as PlayerInventoryDto) || {
       house: null,
      vehicle: null,
      insurance: [],
      card: [],
      deposit: [],
      loan: [],
    };
  }

  async addItemToInventory(userId: number, category: keyof PlayerInventoryDto, item: any): Promise<void> {
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    const currentInventory = (player.inventory as PlayerInventoryDto) || {};
    
    // Инициализируем категорию если её нет
    if (!currentInventory[category]) {
      currentInventory[category] = [];
    }

    // Добавляем предмет в категорию
    currentInventory[category]!.push(item);

    // Обновляем инвентарь в базе данных
    await this.drizzleService.db
      .update(players)
      .set({
        inventory: currentInventory,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id));
  }

  async removeItemFromInventory(userId: number, category: keyof PlayerInventoryDto, itemId: string): Promise<void> {
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    const currentInventory = (player.inventory as PlayerInventoryDto) || {};
    
    if (currentInventory[category]) {
      // Удаляем предмет по ID
      (currentInventory[category] as any[]) = currentInventory[category]!.filter(item => item.id !== itemId);
    }

    // Обновляем инвентарь в базе данных
    await this.drizzleService.db
      .update(players)
      .set({
        inventory: currentInventory,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id));
  }

  private mapPlayerToResponse(player: Player): PlayerStateResponseDto {
    return {
      id: player.id,
      name: player.name,
      health: player.health,
      maxHealth: player.maxHealth,
      gold: player.gold,
      position: player.position,
      cristal: player.cristal,
      steps: player.steps,
      updatedAt: player.updatedAt.toISOString(),
    };
  }




  private generateEvents(position: number): GameEventDto[] {
    const events: GameEventDto[] = [];
    
    // Вероятность события (30% шанс)
    if (Math.random() < 0.3) {
      const eventType = this.getRandomEventType();
      const event = this.createEvent(eventType, position);
      events.push(event);
    }

    return events;
  }

  private getRandomEventType(): 'npc_encounter' | 'treasure' | 'monster' | 'shop' | 'random_event' {
    const types = ['npc_encounter', 'treasure', 'monster', 'shop', 'random_event'];
    const weights = [0.4, 0.2, 0.2, 0.1, 0.1]; // NPC встреча чаще всего
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return types[i] as any;
      }
    }
    
    return 'npc_encounter';
  }

  private createEvent(type: string, position: number): GameEventDto {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    switch (type) {
      case 'npc_encounter':
        return this.createNpcEncounter(eventId, );
      case 'treasure':
        return this.createTreasureEvent(eventId, );
      case 'monster':
        return this.createMonsterEvent(eventId, );
      case 'shop':
        return this.createShopEvent(eventId, );
      default:
        return this.createRandomEvent(eventId, );
    }
  }

  private createNpcEncounter(id: string): GameEventDto {
    const npcs = [
      {
        title: 'Путник',
        description: 'Незнакомец машет рукой и улыбается',
        imageUrl: '/images/npc_traveler.png',
        actions: ['talk', 'ignore']
      },
      {
        title: 'Торговец',
        description: 'Купец предлагает свои товары',
        imageUrl: '/images/npc_merchant.png',
        actions: ['trade', 'ignore']
      },
      {
        title: 'Мудрец',
        description: 'Старый мудрец сидит у дороги',
        imageUrl: '/images/npc_wizard.png',
        actions: ['ask_advice', 'ignore']
      }
    ];

    const npc = npcs[Math.floor(Math.random() * npcs.length)];
    
    return {
      id,
      type: 'npc_encounter',
      title: npc.title,
      description: npc.description,
      imageUrl: npc.imageUrl,
      requiresAction: true,
      actions: npc.actions,
    };
  }

  private createTreasureEvent(id: string): GameEventDto {
    return {
      id,
      type: 'treasure',
      title: 'Сундук с сокровищами',
      description: 'Вы нашли старый сундук, покрытый пылью',
      imageUrl: '/images/treasure_chest.png',
      requiresAction: true,
      actions: ['open', 'ignore'],
      rewards: {
        gold: Math.floor(Math.random() * 50) + 10,
        experience: Math.floor(Math.random() * 20) + 5,
      },
    };
  }

  private createMonsterEvent(id: string): GameEventDto {
    return {
      id,
      type: 'monster',
      title: 'Дикий зверь',
      description: 'Из кустов выпрыгивает агрессивное существо',
      imageUrl: '/images/monster.png',
      requiresAction: true,
      actions: ['fight', 'run'],
    };
  }

  private createShopEvent(id: string): GameEventDto {
    return {
      id,
      type: 'shop',
      title: 'Бродячий торговец',
      description: 'Торговец разложил свой товар на обочине',
      imageUrl: '/images/shop.png',
      requiresAction: true,
      actions: ['browse', 'ignore'],
    };
  }

  private createRandomEvent(id: string): GameEventDto {
    return {
      id,
      type: 'random_event',
      title: 'Странное происшествие',
      description: 'Что-то необычное происходит вокруг вас',
      imageUrl: '/images/mystery.png',
      requiresAction: true,
      actions: ['investigate', 'ignore'],
    };
  }
}
