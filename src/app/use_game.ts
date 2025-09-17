import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { fetchPlayerState, fetchWorldState, movePlayer } from './local_api';
import { useParallax } from './use_parallax';
import type { PlayerStateResponseDto } from '@/services/client_player_service';
import { useDialog } from './use_dialog';
import type { DialogNode, Encounter, EncounterInfo } from '@/services/events/type';

const STEP_PX = 64; // distance per step
const START_TILES = 6; // start this many tiles from the left edge
const START_X = STEP_PX * START_TILES;
const ENERGY_COST_PER_STEP = 10; // затраты энергии на ход

const transformEncountersToPixels = (encounters: Encounter[]): Encounter[] => {
  return encounters.map((encounter) => ({
    ...encounter,
    x: encounter.x * STEP_PX + START_X,
  }));
};

export function useGame() {
  const worldRef = useRef<HTMLDivElement>(null!);
  const [playerX, setPlayerX] = useState(START_X);
  const [cameraX, setCameraX] = useState(() => {
    const viewHalf = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    const safeMargin = STEP_PX * 3;
    return Math.max(START_X, viewHalf + safeMargin);
  });
  const [log, setLog] = useState<string[]>(['Добро пожаловать в приключение!']);
  const [loading, setLoading] = useState(true);
  const [currentDialog, setCurrentDialog] = useState<DialogNode | null>(null);
  const [currentEncounter, setCurrentEncounter] = useState<EncounterInfo | null>(null);
  const [playerState, setPlayerState] = useState<PlayerStateResponseDto | null>(null);
  const [worldLength, setWorldLength] = useState<number>(200);
  const [encounters, setEncounters] = useState<Encounter[]>([]);

  const { viewportRef: parallaxViewportRef, worldLengthPx } = useParallax({
    playerX,
    worldLength,
    cameraX,
    setCameraX,
    currentDialog,
    loading,
  });

  useEffect(() => {
    preload('/open-box.svg', {
      as: 'image',
      fetchPriority: 'low',
    });
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [playerData, worldData] = await Promise.all([fetchPlayerState(), fetchWorldState()]);
        setPlayerState(playerData);
        setWorldLength(worldData.worldLength);
        setEncounters(transformEncountersToPixels(worldData.encounters));
        setPlayerX(playerData.position * STEP_PX + START_X);

        setLog((prev) => [...prev, 'Состояние игрока и мира загружено!']);
      } catch (error) {
        setLog((prev) => [...prev, 'Ошибка загрузки данных!']);
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const stepForward = useCallback(() => {
    if (currentDialog || loading) return;

    if (!playerState || playerState.energy < ENERGY_COST_PER_STEP) {
      setLog((prev) => [...prev, 'Мало энергии!']);
      return;
    }

    setLoading(true);
    movePlayer()
      .then(({ playerState, dialog, encounter }) => {
        setPlayerState(playerState);
        setPlayerX(playerState.position * STEP_PX + START_X);
        setCurrentDialog(dialog);
        setCurrentEncounter(encounter || null);
      })
      .catch((error) => {
        setLog((prev) => [...prev, 'Ошибка перемещения!']);
        console.error('Failed to move player:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentDialog, loading, playerState, setLog, setPlayerState, setPlayerX, setCurrentDialog]);

  const {
    currentDialog: dialog,
    showDialog,
    handleDialogOption,
    handleCloseDialog,
    resolveEncounter,
  } = useDialog({
    currentEncounter,
    currentDialog,
    setCurrentDialog,
    setCurrentEncounter,
    setLog,
    setPlayerState,
  });

  const worldStyle = useMemo(
    () =>
      ({
        transform: `translateX(${-cameraX + window.innerWidth / 2}px)`,
      }) as const,
    [cameraX],
  );

  return {
    worldRef,
    viewportRef: parallaxViewportRef,
    playerX,
    cameraX,
    log,
    currentDialog,
    loading,
    playerState,
    worldLength,
    encounters,
    worldStyle,
    worldLengthPx,
    dialog,
    showDialog,
    currentEncounter,
    resolveEncounter,
    handleDialogOption,
    handleCloseDialog,
    stepForward,
    setCurrentDialog,
  } as const;
}
