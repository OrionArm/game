import type {
  ClientPlayerService,
  PlayerStateResponseDto,
  DialogEffects,
} from '../client_player_service';

import type {
  DialogChoiceResponseDto,
  DialogNode,
  DialogOption,
  Encounter,
  EncounterEvent,
  StepEvent,
  WorldStateResponseDto,
} from './type';
import { stepEventData } from './mock/steps_data';
import { encounterDialogs } from './mock/dialogs_data';
import {
  applyDialogEffectsToState,
  checkEventConditions,
  formatRewardsMessage,
  selectWeightedEvent,
} from './utils';
import { encounterData } from './mock/encounters_data';

export class EventService {
  private encounterEvents: EncounterEvent[] = [];
  private completedEncounterEvents: EncounterEvent[] = [];
  private readonly WORLD_LENGTH = 200;
  private playerService: ClientPlayerService;
  private availableStepEvents: StepEvent[] = [...stepEventData];
  private completedStepEvents: StepEvent[] = [];

  constructor(playerService: ClientPlayerService) {
    this.playerService = playerService;
    this.encounterEvents = [...encounterData];
  }

  private async applyDialogEffects(
    effects: Partial<DialogEffects>,
    playerState: PlayerStateResponseDto,
  ): Promise<PlayerStateResponseDto> {
    try {
      const state = applyDialogEffectsToState(playerState, effects);
      const newState = await this.playerService.savePlayerState(state);
      console.log('Эффекты диалога применены:', effects);
      return newState;
    } catch (error) {
      console.error('Ошибка применения эффектов диалога:', error);
      return playerState;
    }
  }

  private async processDialogChoice(
    dialogId: string,
    optionId: string,
    eventType: 'encounter' | 'step',
  ): Promise<DialogChoiceResponseDto> {
    const playerState = await this.playerService.getPlayerState();
    let event: EncounterEvent | StepEvent | undefined;
    if (eventType === 'encounter') {
      event = this.completedEncounterEvents.find((e) => e.position === playerState.position);
    } else {
      event = this.completedStepEvents.find((e) => e.eventId === dialogId);
    }

    if (eventType === 'encounter') {
      const dialog = encounterDialogs[dialogId];
      if (!dialog) {
        return { isDialogComplete: true, message: '' };
      }

      const option = dialog.options.find((o: DialogOption) => o.id === optionId);
      if (!option) {
        return { isDialogComplete: true, message: '' };
      }

      let newState: PlayerStateResponseDto | undefined;
      if (option.effects) {
        newState = await this.applyDialogEffects(option.effects, playerState);
      }

      if (option.nextDialogId) {
        const nextDialog = encounterDialogs[option.nextDialogId];
        if (nextDialog) {
          return {
            nextDialog,
            newState,
            isDialogComplete: false,
            message: formatRewardsMessage(option.effects),
          };
        }
      }

      return {
        newState,
        isDialogComplete: true,
        message: formatRewardsMessage(option.effects),
      };
    }

    const stepEvent = event as StepEvent;
    if (!stepEvent?.dialog) {
      return { isDialogComplete: true, message: '' };
    }

    const dialog = stepEvent.dialog.find((d: DialogNode) => d.id === dialogId);
    if (!dialog) {
      return { isDialogComplete: true, message: '' };
    }

    const option = dialog.options.find((o: DialogOption) => o.id === optionId);
    if (!option) {
      return { isDialogComplete: true, message: '' };
    }

    let newState: PlayerStateResponseDto | undefined;
    if (option.effects) {
      newState = await this.applyDialogEffects(option.effects, playerState);
    }

    if (option.nextDialogId) {
      const nextDialog = stepEvent.dialog.find((d: DialogNode) => d.id === option.nextDialogId);
      if (nextDialog) {
        return {
          nextDialog,
          newState,
          isDialogComplete: false,
          message: formatRewardsMessage(option.effects),
        };
      }
    }

    return {
      newState,
      isDialogComplete: true,
      message: formatRewardsMessage(option.effects),
    };
  }

  async processEncounterDialogChoice(
    dialogId: string,
    optionId: string,
  ): Promise<DialogChoiceResponseDto> {
    return this.processDialogChoice(dialogId, optionId, 'encounter');
  }

  async processStepDialogChoice(
    dialogId: string,
    optionId: string,
  ): Promise<DialogChoiceResponseDto> {
    return this.processDialogChoice(dialogId, optionId, 'step');
  }

  async getEncounterEvent(position: number): Promise<EncounterEvent | null> {
    const encounterEvent = this.encounterEvents.find((event) => event.position === position);
    if (!encounterEvent) return null;

    this.moveEncounterEventToCompleted(encounterEvent);

    return encounterEvent;
  }

  async getEncounterState(): Promise<WorldStateResponseDto> {
    const encounters: Encounter[] = this.encounterEvents.map((event) => ({
      id: event.eventId,
      x: event.position,
      type: event.type,
      resolved: false,
      title: event.title,
      description: event.description,
    }));

    return {
      encounters,
      worldLength: this.WORLD_LENGTH,
      weight: 1,
    };
  }

  getStepEvent(playerState: PlayerStateResponseDto): StepEvent | null {
    const eligibleEvents = this.availableStepEvents.filter((event) =>
      checkEventConditions(
        event.conditions,
        playerState,
        this.completedStepEvents.map((e) => e.eventId),
      ),
    );

    if (eligibleEvents.length === 0) return null;

    const selectedEvent = selectWeightedEvent(eligibleEvents);

    if (!selectedEvent) return null;

    this.moveStepEventToCompleted(selectedEvent);

    return selectedEvent;
  }

  private moveStepEventToCompleted(event: StepEvent): void {
    const availableIndex = this.availableStepEvents.findIndex((e) => e.eventId === event.eventId);
    if (availableIndex !== -1) {
      this.availableStepEvents.splice(availableIndex, 1);
    }

    this.completedStepEvents.push(event);
  }

  private moveEncounterEventToCompleted(event: EncounterEvent): void {
    const availableIndex = this.encounterEvents.findIndex((e) => e.eventId === event.eventId);
    if (availableIndex !== -1) {
      this.encounterEvents.splice(availableIndex, 1);
    }

    this.completedEncounterEvents.push(event);
  }
}
