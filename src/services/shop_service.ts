import type {
  ClientPlayerService,
  PlayerStateResponseDto,
  DialogEffects,
} from './client_player_service';
import type { ShopItem } from './events/mock/shop_data';
import { shopData } from './events/mock/shop_data';
import { applyDialogEffectsToState } from './events/utils';
import type { HappenedEffects } from './events/type';
import { mockItems, type Item } from './events/mock/item_data';

export class ShopService {
  private playerService: ClientPlayerService;
  private availableItems: ShopItem[] = [...shopData];
  private usedItems: ShopItem[] = [];

  constructor(playerService: ClientPlayerService) {
    this.playerService = playerService;
  }

  private convertItemIdsToItems(itemIds: string[] | undefined): Item[] {
    if (!itemIds) return [];
    return itemIds
      .map((id) => mockItems.find((item) => item.id === id))
      .filter((item): item is Item => item !== undefined);
  }

  private createHappenedEffects(effects: DialogEffects): HappenedEffects {
    return {
      health: effects.health || 0,
      gold: effects.gold || 0,
      cristal: effects.cristal || 0,
      note: effects.note || '',
      itemsGain: this.convertItemIdsToItems(effects.itemsGain),
      itemsLose: this.convertItemIdsToItems(effects.itemsLose),
    };
  }

  getAvailableItems(): ShopItem[] {
    return [...this.availableItems];
  }

  async applyItem(itemId: string): Promise<{
    success: boolean;
    newState?: PlayerStateResponseDto;
    message: string;
    happenedEffects?: HappenedEffects;
  }> {
    const itemIndex = this.availableItems.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Товар не найден или уже использован',
      };
    }

    const item = this.availableItems[itemIndex];
    const playerState = await this.playerService.getPlayerState();

    if (item.cost > playerState.gold) {
      return {
        success: false,
        message: `Недостаточно золота. Нужно: ${item.cost}, есть: ${playerState.gold}`,
      };
    }

    try {
      const effects: DialogEffects = {
        gold: item.effects.gold - item.cost,
        health: item.effects.health,
        cristal: item.effects.cristal,
        energy: item.effects.energy,
        note: item.effects.note,
        prize: item.effects.prize,
        itemsGain: item.effects.itemsGain,
        itemsLose: item.effects.itemsLose,
        flagsSet: item.effects.flagsSet,
        flagsUnset: item.effects.flagsUnset,
      };

      const newState = applyDialogEffectsToState(playerState, effects);
      const savedState = await this.playerService.savePlayerState(newState);

      this.availableItems.splice(itemIndex, 1);
      this.usedItems.push(item);

      const happenedEffects = this.createHappenedEffects(effects);

      return {
        success: true,
        newState: savedState,
        message: `Товар "${item.title}" успешно применён`,
        happenedEffects,
      };
    } catch (error) {
      console.error('Ошибка применения товара:', error);
      return {
        success: false,
        message: 'Ошибка при применении товара',
      };
    }
  }

  resetAvailableItems(): void {
    this.availableItems = [...shopData];
    this.usedItems = [];
  }
}
