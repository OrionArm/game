import { EventService } from './events/event_service';
import { encounterDialogs } from './events/mock/dialogs_data';
import { type DialogNode, type EncounterInfo } from './events/type';

type PlayerFlags = Record<FlagName, boolean>;
type Item = {
  id: string;
  name: ItemName;
  description: string;
  image: string;
};
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
export type ItemName =
  | 'Защитный PIN-чекер'
  | 'Полис-щит'
  | 'Бонус-карта партнёра'
  | 'Смарт-автоплатёж'
  | 'Антифрод-токен'
  | 'Подушка безопасности'
  | 'Целевой календарь'
  | 'Финсоветник';

export type Points = {
  cristal: number;
  gold: number;
  health: number;
  energy: number;
};

export type DialogEffects = Points & {
  note: string;
  prize: object;
  itemsGain: ItemName[];
  itemsLose: ItemName[];
  flagsSet: FlagName[];
  flagsUnset: FlagName[];
};

export interface MoveResponseDto {
  dialog: DialogNode;
  playerState: PlayerStateResponseDto;
  encounter?: EncounterInfo;
}

export class ClientPlayerService {
  private sessionId: string;
  private eventService: EventService;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.eventService = new EventService(this);
  }

  async getPlayerState(): Promise<PlayerStateResponseDto> {
    const storedData = localStorage.getItem(`player_${this.sessionId}`);

    if (storedData) {
      return JSON.parse(storedData);
    }

    const newPlayer: PlayerStateResponseDto = {
      id: Date.now(),
      name: `Player_${this.sessionId.slice(0, 8)}`,
      health: 100,
      maxHealth: 100,
      position: 0,
      gold: 100,
      cristal: 0,
      energy: 200,
      updatedAt: new Date().toISOString(),
      items: [
        // {
        //   name: 'Защитный PIN-чекер',
        //   id: '1',
        //   description: 'Классный Защитный PIN-чекер',
        //   image: 'https://via.placeholder.com/150',
        // },
        // {
        //   name: 'Полис-щит',
        //   id: '2',
        //   description: 'Классный Полис-щит',
        //   image: 'https://via.placeholder.com/150',
        // },
      ],
      flags: {
        friendContact: false,
        friendScamSpotted: true,
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
    const newPosition = currentState.position + 1;
    const ENERGY_COST_PER_STEP = 10;
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
