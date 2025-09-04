import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type BuildingType = 'shop' | 'factory' | 'office';

export interface Building {
  id: string;
  type: BuildingType;
  x: number; // grid x
  y: number; // grid y
  level: number;
}

export interface ResourcesState {
  day: number;
  money: number;
  incomePerDay: number;
  expensesPerDay: number;
}

export interface EventItem {
  id: string;
  day: number;
  text: string;
}

interface GameState {
  resources: ResourcesState;
  buildings: Building[];
  events: EventItem[];
  gridSize: { cols: number; rows: number };
  placeBuilding: (b: Omit<Building, 'id' | 'level'>) => void;
  nextDay: () => void;
  reset: () => void;
}

const BUILDING_COST: Record<BuildingType, number> = {
  shop: 500,
  factory: 1200,
  office: 800,
};

const BUILDING_DAILY: Record<BuildingType, { income: number; expense: number }> = {
  shop: { income: 150, expense: 30 },
  factory: { income: 350, expense: 120 },
  office: { income: 220, expense: 60 },
};

export const useGameStore = create<GameState>()(
  immer((set, get) => ({
    resources: {
      day: 1,
      money: 3000,
      incomePerDay: 0,
      expensesPerDay: 0,
    },
    buildings: [],
    events: [],
    gridSize: { cols: 10, rows: 10 },
    placeBuilding: ({ type, x, y }) => {
      const state = get();
      const cost = BUILDING_COST[type];
      if (state.resources.money < cost) {
        set((draft) => {
          draft.events.unshift({
            id: crypto.randomUUID(),
            day: draft.resources.day,
            text: `Недостаточно денег для строительства: ${type}`,
          });
        });
        return;
      }

      const occupied = state.buildings.some((b) => b.x === x && b.y === y);
      if (occupied) {
        set((draft) => {
          draft.events.unshift({
            id: crypto.randomUUID(),
            day: draft.resources.day,
            text: 'Клетка уже занята',
          });
        });
        return;
      }

      set((draft) => {
        draft.resources.money -= cost;
        draft.buildings.push({ id: crypto.randomUUID(), type, x, y, level: 1 });
        draft.events.unshift({
          id: crypto.randomUUID(),
          day: draft.resources.day,
          text: `Построено здание: ${type} (${x}, ${y}) за ${cost}`,
        });
        const totals = draft.buildings.reduce(
          (acc, b) => {
            acc.income += BUILDING_DAILY[b.type].income;
            acc.expense += BUILDING_DAILY[b.type].expense;
            return acc;
          },
          { income: 0, expense: 0 },
        );
        draft.resources.incomePerDay = totals.income;
        draft.resources.expensesPerDay = totals.expense;
      });
    },
    nextDay: () => {
      set((draft) => {
        draft.resources.day += 1;
        const income = draft.resources.incomePerDay;
        const expense = draft.resources.expensesPerDay;
        const net = income - expense;
        draft.resources.money += net;
        draft.events.unshift({
          id: crypto.randomUUID(),
          day: draft.resources.day,
          text: `День ${draft.resources.day}: доход ${income}, расходы ${expense}, итог ${net}`,
        });
      });
    },
    reset: () => {
      set((draft) => {
        draft.resources = { day: 1, money: 3000, incomePerDay: 0, expensesPerDay: 0 };
        draft.buildings = [];
        draft.events = [];
      });
    },
  })),
);


