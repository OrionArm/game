import type { DialogEffects, FlagName, PlayerStateResponseDto } from '../client_player_service';
import type { ItemId } from './mock/item_data';

export type EncounterAction = 'talk' | 'fight' | 'flee' | 'loot' | 'trade' | 'ignore';

export interface DialogOption {
  id: string;
  nextDialogId?: string;
  text: string;
  requires?: string;
  effects?: Partial<DialogEffects>;
}

export interface DialogNode {
  id: string;
  speaker: string;
  text: string;
  options: DialogOption[];
}

export interface DialogChoiceResponseDto {
  nextDialog?: DialogNode;
  newState?: PlayerStateResponseDto;
  isDialogComplete: boolean;
  message: string;
}

export type Encounter = EncounterCoordinates & EncounterInfo;

type EncounterCoordinates = {
  id: string;
  x: number;
  resolved: boolean;
  imageUrl: string;
};
export type EncounterInfo = {
  type: EncounterEventType;
  title: string;
  description: string;
};

export type EventTopic =
  | 'Антифрод/осознанность'
  | 'Антифрод/социнжиниринг'
  | 'Антифрод/фишинг'
  | 'Бюджет/антифрод'
  | 'Бюджет/расходы'
  | 'Долгосрочные цели'
  | 'Знания/советы'
  | 'Инвестиции'
  | 'Карты/лимиты'
  | 'Партнёры/кэшбэк'
  | 'Партнёры/страхование'
  | 'Партнёры/штрафы/QR'
  | 'Подписки/сервисы'
  | 'Подписки/долгосрочные цели'
  | 'Путешествия/валюта'
  | 'Сбережения/вклад'
  | 'Страхование жизни/НСЖ'
  | 'Платежи/валюта/страховка';

export interface BaseEvent {
  eventId: string;
  title: string;
  description: string;
  imageUrl?: string;
  topic: EventTopic;
}
export type EncounterEventType = 'npc_encounter' | 'treasure' | 'shop';
export interface EncounterEvent extends BaseEvent {
  type: EncounterEventType;
  position: number;
  dialogId: string;
  imageUrl: string;
}

export type WorldEventType = 'news' | 'disaster' | 'celebration' | 'mystery' | 'opportunity';
export interface WorldEvent extends BaseEvent {
  type: WorldEventType;
}

export type StepEventType = 'StepEvent';

export interface EventConditions {
  requiresFlags?: FlagName[];
  requiresItems?: ItemId[];
  minGold?: number;
  maxGold?: number;
  minHealth?: number;
  maxHealth?: number;
  minEnergy?: number;
  maxEnergy?: number;
  minCristal?: number;
  maxCristal?: number;
  afterEvents?: string[];
  position?: {
    min?: number;
    max?: number;
  };
}

export interface StepEvent extends BaseEvent {
  type: StepEventType;
  conditions?: EventConditions;
  weight: number;
  dialog?: DialogNode[];
}

export interface WorldStateResponseDto {
  encounters: Encounter[];
  worldLength: number;
}
export type GameEvent = EncounterEvent | WorldEvent | StepEvent;
