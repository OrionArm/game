import type { PlayerStateResponseDto, DialogEffects } from '../client_player_service';

import type { StepEvent, EventConditions } from './type';

export function applyDialogEffectsToState(
  currentState: PlayerStateResponseDto,
  effects: Partial<DialogEffects>,
): PlayerStateResponseDto {
  const newState = { ...currentState };

  if (effects.gold !== undefined) {
    newState.gold = Math.max(0, newState.gold + effects.gold);
  }
  if (effects.health !== undefined) {
    newState.health = Math.max(0, Math.min(100, newState.health + effects.health));
  }
  if (effects.energy !== undefined) {
    newState.energy = Math.max(0, Math.min(200, newState.energy + effects.energy));
  }
  if (effects.cristal !== undefined) {
    newState.cristal = Math.max(0, newState.cristal + effects.cristal);
  }

  if (effects.itemsGain && effects.itemsGain.length > 0) {
    const newItems = effects.itemsGain.map((itemName) => ({
      id: `item_${Date.now()}_${Math.random()}`,
      name: itemName,
      description: `Предмет: ${itemName}`,
      image: `/icons/${itemName.toLowerCase().replace(/\s+/g, '_')}.png`,
    }));
    newState.items = [...newState.items, ...newItems];
  }
  if (effects.itemsLose && effects.itemsLose.length > 0) {
    newState.items = newState.items.filter((item) => !effects.itemsLose!.includes(item.name));
  }

  if (effects.flagsSet && effects.flagsSet.length > 0) {
    effects.flagsSet.forEach((flag) => {
      console.log('🚀 ~ applyDialogEffectsToState ~ flag:', flag);
      newState.flags[flag] = true;
    });
  }
  if (effects.flagsUnset && effects.flagsUnset.length > 0) {
    effects.flagsUnset.forEach((flag) => {
      newState.flags[flag] = false;
    });
  }

  return newState;
}

export function selectWeightedEvent(events: StepEvent[]): StepEvent | null {
  if (events.length === 0) return null;

  const totalWeight = events.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of events) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return events[0];
}

export function checkEventConditions(
  conditions: EventConditions | undefined,
  playerState: PlayerStateResponseDto,
  completedEventIds: string[],
): boolean {
  if (!conditions) return true;

  if (conditions.requiresFlags) {
    for (const flag of conditions.requiresFlags) {
      if (!playerState.flags[flag]) {
        return false;
      }
    }
  }

  if (conditions.requiresItems) {
    for (const itemName of conditions.requiresItems) {
      if (!playerState.items.some((item) => item.name === itemName)) {
        return false;
      }
    }
  }

  if (conditions.minGold !== undefined && playerState.gold < conditions.minGold) {
    return false;
  }
  if (conditions.maxGold !== undefined && playerState.gold > conditions.maxGold) {
    return false;
  }

  if (conditions.minHealth !== undefined && playerState.health < conditions.minHealth) {
    return false;
  }
  if (conditions.maxHealth !== undefined && playerState.health > conditions.maxHealth) {
    return false;
  }

  if (conditions.minEnergy !== undefined && playerState.energy < conditions.minEnergy) {
    return false;
  }
  if (conditions.maxEnergy !== undefined && playerState.energy > conditions.maxEnergy) {
    return false;
  }

  if (conditions.minCristal !== undefined && playerState.cristal < conditions.minCristal) {
    return false;
  }
  if (conditions.maxCristal !== undefined && playerState.cristal > conditions.maxCristal) {
    return false;
  }

  if (conditions.position) {
    if (conditions.position.min !== undefined && playerState.position < conditions.position.min) {
      return false;
    }
    if (conditions.position.max !== undefined && playerState.position > conditions.position.max) {
      return false;
    }
  }

  if (conditions.afterEvents) {
    for (const eventId of conditions.afterEvents) {
      if (!completedEventIds.includes(eventId)) {
        return false;
      }
    }
  }

  return true;
}

export const formatRewardsMessage = (rewards: Partial<DialogEffects> | undefined): string => {
  if (!rewards) return '';

  const parts: string[] = [];

  if (rewards.gold && rewards.gold !== 0) {
    const goldText = rewards.gold > 0 ? `+${rewards.gold} золота` : `${rewards.gold} золота`;
    parts.push(goldText);
  }

  if (rewards.health && rewards.health !== 0) {
    const healthText =
      rewards.health > 0 ? `+${rewards.health} здоровья` : `${rewards.health} здоровья`;
    parts.push(healthText);
  }

  if (rewards.energy && rewards.energy !== 0) {
    const energyText =
      rewards.energy > 0 ? `+${rewards.energy} энергии` : `${rewards.energy} энергии`;
    parts.push(energyText);
  }

  if (rewards.cristal && rewards.cristal !== 0) {
    const cristalText =
      rewards.cristal > 0 ? `+${rewards.cristal} кристаллов` : `${rewards.cristal} кристаллов`;
    parts.push(cristalText);
  }

  if (rewards.itemsGain && rewards.itemsGain.length > 0) {
    const itemsText = `+${rewards.itemsGain.length} предметов`;
    parts.push(itemsText);
  }

  if (rewards.itemsLose && rewards.itemsLose.length > 0) {
    const itemsText = `-${rewards.itemsLose.length} предметов`;
    parts.push(itemsText);
  }

  if (rewards.flagsSet && rewards.flagsSet.length > 0) {
    const flagsText = `+${rewards.flagsSet.length} флагов`;
    parts.push(flagsText);
  }

  if (rewards.note) {
    parts.push(`Заметка: ${rewards.note}`);
  }

  if (parts.length === 0) {
    return '';
  }

  return `Изменение состояния: ${parts.join(', ')}`;
};
