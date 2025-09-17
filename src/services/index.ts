import { EventService } from './events/event_service';

// Клиентские сервисы
import { clientGameService } from './client_game_service';
import { ClientPlayerService } from './client_player_service';
import { ClientSessionService } from './client_session_service';

// Экспортируем типы из events
export type {
  DialogNode,
  DialogOption,
  GameEvent,
  EncounterAction,
  StepEvent,
  EncounterEvent,
  WorldEvent,
  EventConditions,
} from './events/type';

export { EventService };
export { clientGameService, ClientPlayerService, ClientSessionService };
