import type { DialogChoiceResponseDto, WorldStateResponseDto } from '@/services/events/type';
import { clientGameService } from '../services/client_game_service';
import type { MoveResponseDto, PlayerStateResponseDto } from '@/services/client_player_service';

// GET player/state
export async function fetchPlayerState(): Promise<PlayerStateResponseDto> {
  try {
    return await clientGameService.getPlayerState();
  } catch (error) {
    console.error('Ошибка получения состояния игрока:', error);
    throw new Error('Не удалось получить состояние игрока');
  }
}
// GET player/move
export async function movePlayer(): Promise<MoveResponseDto> {
  try {
    return await clientGameService.movePlayer();
  } catch (error) {
    console.error('Ошибка перемещения игрока:', error);
    throw new Error('Не удалось переместить игрока');
  }
}
// GET world/state
export async function fetchWorldState(): Promise<WorldStateResponseDto> {
  try {
    return await clientGameService.getWorldState();
  } catch (error) {
    console.error('Ошибка получения состояния мира:', error);
    throw new Error('Не удалось получить состояние мира');
  }
}

// POST event/dialog/encounter
export async function processEncounterDialogChoice(
  dialogId: string,
  optionId: string,
): Promise<DialogChoiceResponseDto> {
  try {
    return await clientGameService.processEncounterDialogChoice(dialogId, optionId);
  } catch (error) {
    console.error('Ошибка обработки диалога encounter:', error);
    throw new Error('Не удалось обработать выбор в диалоге encounter');
  }
}

// POST event/dialog/step
export async function processStepDialogChoice(
  dialogId: string,
  optionId: string,
): Promise<DialogChoiceResponseDto> {
  try {
    return await clientGameService.processStepDialogChoice(dialogId, optionId);
  } catch (error) {
    console.error('Ошибка обработки диалога step:', error);
    throw new Error('Не удалось обработать выбор в диалоге step');
  }
}
