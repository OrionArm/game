import { createContext } from 'react';
import { useGame } from './use_game';

// Используем тип возвращаемого значения из useGame
type GameContextType = ReturnType<typeof useGame>;

// Создаем контекст
export const GameContext = createContext<GameContextType | undefined>(undefined);
