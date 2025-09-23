import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../db/drizzle.service';
import { 
  shopItems, 
  purchases,
  type NewPurchase
} from './shop.schema';
import { players } from '../player/player.schema';
import { PurchaseItemDto, ShopResponseDto, PurchaseResponseDto } from './shop.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ShopService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getShopItems(): Promise<ShopResponseDto> {
    const shopItemsList = await this.drizzleService.db
      .select()
      .from(shopItems)
      .where(eq(shopItems.isAvailable, true));

    return {
      items: shopItemsList.map(shopItem => ({
        id: shopItem.id,
        itemId: shopItem.itemId,
        price: shopItem.price,
        stock: shopItem.stock,
        isAvailable: shopItem.isAvailable,
        discount: shopItem.discount,
        item: {
          id: shopItem.itemId,
          name: `Item ${shopItem.itemId}`,
          description: 'Описание предмета',
          type: 'consumable',
          rarity: 'common',
          stats: {},
          value: 0,
          stackable: true,
        },
      })),
      totalItems: shopItemsList.length,
    };
  }

  async purchaseItem(userId: number, purchaseDto: PurchaseItemDto): Promise<PurchaseResponseDto> {
    const { itemId, quantity } = purchaseDto;

    // Получаем игрока
    const [player] = await this.drizzleService.db
      .select()
      .from(players)
      .where(eq(players.userId, userId))
      .limit(1);

    if (!player) {
      throw new NotFoundException('Игрок не найден');
    }

    // Получаем товар в магазине
    const [shopItem] = await this.drizzleService.db
      .select()
      .from(shopItems)
      .where(
        and(
          eq(shopItems.itemId, itemId),
          eq(shopItems.isAvailable, true)
        )
      )
      .limit(1);

    if (!shopItem) {
      throw new NotFoundException('Товар не найден в магазине');
    }

    // Проверяем наличие товара
    if (shopItem.stock !== -1 && shopItem.stock < quantity) {
      throw new BadRequestException('Недостаточно товара в наличии');
    }

    // Рассчитываем стоимость
    const basePrice = parseFloat(shopItem.price);
    const discount = parseFloat(shopItem.discount);
    const finalPrice = basePrice * (1 - discount / 100);
    const totalCost = finalPrice * quantity;

    // Проверяем, хватает ли золота
    if (player.gold < totalCost) {
      throw new BadRequestException('Недостаточно золота для покупки');
    }

    // Выполняем покупку
    await this.drizzleService.db.transaction(async (tx) => {
      // Создаем запись о покупке
      const newPurchase: NewPurchase = {
        playerId: player.id,
        itemId,
        quantity,
        price: shopItem.price,
        totalCost: totalCost.toString(),
      };

      const [purchase] = await tx.insert(purchases).values(newPurchase).returning();

      // Обновляем золото игрока
      await tx
        .update(players)
        .set({ gold: player.gold - totalCost })
        .where(eq(players.id, player.id));

      // Обновляем запас товара
      if (shopItem.stock !== -1) {
        await tx
          .update(shopItems)
          .set({ stock: shopItem.stock - quantity })
          .where(eq(shopItems.id, shopItem.id));
      }

      // Добавляем предмет в инвентарь (упрощенная версия)
      // TODO: Реализовать добавление в JSON инвентарь
      console.log(`Добавляем предмет ${itemId} в количестве ${quantity} в инвентарь игрока ${player.id}`);
    });

    return {
      success: true,
      purchaseId: 1, // TODO: Получить реальный ID покупки
      totalCost: totalCost.toString(),
      remainingGold: player.gold - totalCost,
      message: 'Покупка успешно совершена!',
    };
  }
}
