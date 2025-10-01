import { EventService } from './events/event_service';
import { encounterDialogs } from './events/mock/dialogs_data';
import type { Item, ItemId } from './events/mock/item_data';
import { type DialogNode, type EncounterInfo } from './events/type';

type PlayerFlags = Record<FlagName, boolean>;

export type PlayerStateResponseDto = Points & {
  id: number;
  name: string;
  maxHealth: number;
  position: number;
  updatedAt: string;
  items: Item[];
  flags: PlayerFlags;
};

export type FlagName = 'friendContact' | 'friendScamSpotted' | 'friendFact' | 'friendLegitHint';

export type Points = {
  cristal: number;
  gold: number;
  health: number;
  energy: number;
};

export type DialogEffects = Points & {
  note: string;
  prize: object;
  itemsGain: ItemId[];
  itemsLose: ItemId[];
  flagsSet: FlagName[];
  flagsUnset: FlagName[];
};

export interface MoveResponseDto {
  dialog: DialogNode;
  playerState: PlayerStateResponseDto;
  encounter?: EncounterInfo;
}

const MAX_POSITION = 50;
const ENERGY_COST_PER_STEP = 10;
const ENERGY_REGENERATION_RATE = 10;
const ENERGY_MAX = 200;

export class ClientPlayerService {
  private sessionId: string;
  private eventService: EventService;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.eventService = new EventService(this);
  }

  private calculateEnergyRegeneration(playerState: PlayerStateResponseDto): PlayerStateResponseDto {
    const lastUpdate = new Date(playerState.updatedAt);
    const now = new Date();
    const timeDiffMs = now.getTime() - lastUpdate.getTime();
    const timeDiffHours = Math.floor(timeDiffMs / (1000 * 60 * 60));

    if (timeDiffHours > 0) {
      const energyToAdd = Math.min(timeDiffHours * ENERGY_REGENERATION_RATE, ENERGY_MAX);
      return {
        ...playerState,
        energy: Math.min(playerState.energy + energyToAdd, ENERGY_MAX),
        updatedAt: now.toISOString(),
      };
    }

    return playerState;
  }

  async getPlayerState(): Promise<PlayerStateResponseDto> {
    const storedData = localStorage.getItem(`player_${this.sessionId}`);

    if (storedData) {
      const playerState = JSON.parse(storedData);
      const updatedState = this.calculateEnergyRegeneration(playerState);

      if (updatedState !== playerState) {
        this.savePlayerState(updatedState);
      }

      return updatedState;
    }

    const newPlayer: PlayerStateResponseDto = {
      id: Date.now(),
      name: `Player_${this.sessionId.slice(0, 8)}`,
      health: 100,
      maxHealth: 100,
      position: 0,
      gold: 100,
      cristal: 0,
      energy: 100,
      updatedAt: new Date().toISOString(),
      items: [],
      flags: {
        friendContact: false,
        friendScamSpotted: false,
        friendFact: false,
        friendLegitHint: false,
      },
    };

    this.savePlayerState(newPlayer);
    return newPlayer;
  }

  async getCurrentPosition(): Promise<number> {
    const playerState = await this.getPlayerState();
    return playerState.position;
  }

  async movePlayer(): Promise<MoveResponseDto> {
    const currentState = await this.getPlayerState();

    // Ограничитель: не позволяем двигаться дальше позиции 50
    if (currentState.position >= MAX_POSITION) {
      throw new Error(
        `Достигнута максимальная позиция (${MAX_POSITION}). Дальше двигаться нельзя.`,
      );
    }

    const newPosition = currentState.position + 1;
    const encounterAtPosition = await this.eventService.getEncounterEvent(newPosition);
    const updatedState: PlayerStateResponseDto = {
      ...currentState,
      position: newPosition,
      energy: Math.max(0, currentState.energy - ENERGY_COST_PER_STEP),
      updatedAt: new Date().toISOString(),
    };
    this.savePlayerState(updatedState);

    let dialog: DialogNode | null = null;
    if (encounterAtPosition) {
      console.log('🎯 Встреча на позиции', newPosition, ':', encounterAtPosition);
      const dialogId = encounterAtPosition.dialogId;
      dialog = encounterDialogs[dialogId];

      return {
        dialog: dialog!,
        playerState: updatedState,
        encounter: {
          type: encounterAtPosition.type,
          title: encounterAtPosition.title,
          description: encounterAtPosition.description,
        },
      };
    } else {
      const event = this.eventService.getStepEvent(currentState);
      dialog = event?.dialog?.[0] || null;

      return {
        dialog: dialog!,
        playerState: updatedState,
      };
    }
  }

  savePlayerState(state: PlayerStateResponseDto): PlayerStateResponseDto {
    localStorage.setItem(`player_${this.sessionId}`, JSON.stringify(state));
    return state;
  }

  async getEncounterState() {
    return this.eventService.getEncounterState();
  }

  async processEncounterDialogChoice(dialogId: string, optionId: string) {
    return this.eventService.processEncounterDialogChoice(dialogId, optionId);
  }

  async processStepDialogChoice(dialogId: string, optionId: string) {
    return this.eventService.processStepDialogChoice(dialogId, optionId);
  }
}
