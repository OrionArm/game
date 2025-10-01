import {
  ClientPlayerService,
  type MoveResponseDto,
  type PlayerStateResponseDto,
} from './client_player_service';
import { ClientSessionService } from './client_session_service';
import type { WorldStateResponseDto, DialogChoiceResponseDto } from './events/type';

export class ClientGameService {
  private playerService: ClientPlayerService;
  private sessionService: ClientSessionService;

  constructor() {
    this.sessionService = new ClientSessionService();
    const sessionId = this.sessionService.getCurrentSessionId();
    this.playerService = new ClientPlayerService(sessionId);
  }

  async getWorldState(): Promise<WorldStateResponseDto> {
    return this.playerService.getEncounterState();
  }

  async getPlayerState(): Promise<PlayerStateResponseDto> {
    return this.playerService.getPlayerState();
  }

  async movePlayer(): Promise<MoveResponseDto> {
    return this.playerService.movePlayer();
  }

  async processEncounterDialogChoice(
    dialogId: string,
    optionId: string,
  ): Promise<DialogChoiceResponseDto> {
    return this.playerService.processEncounterDialogChoice(dialogId, optionId);
  }

  async processStepDialogChoice(
    dialogId: string,
    optionId: string,
  ): Promise<DialogChoiceResponseDto> {
    return this.playerService.processStepDialogChoice(dialogId, optionId);
  }

  async addLogMessage(message: string): Promise<void> {
    return this.playerService.addLogMessage(message);
  }

  async getLogs(limit?: number): Promise<Array<{ message: string; timestamp: string }>> {
    return this.playerService.getLogs(limit);
  }

  async clearLogs(): Promise<void> {
    return this.playerService.clearLogs();
  }
}

export const clientGameService = new ClientGameService();
