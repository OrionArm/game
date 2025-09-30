import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchPlayerState, fetchWorldState, movePlayer } from '@/shared/local_api';
import type { PlayerStateResponseDto } from '@/services/client_player_service';
import type { DialogNode, Encounter, EncounterInfo } from '@/services/events/type';
import { useResourceLoader, type ResourceConfig } from './use_resource_loader';
import { useParallax } from './use_parallax';
import { useDialog } from './use_dialog';

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

const RESOURCES_TO_PRELOAD: ResourceConfig[] = [
  { src: '/player.svg', priority: 'high', type: 'character' },
  { src: '/npc.svg', priority: 'high', type: 'npc' },
  { src: '/far.svg', priority: 'high', type: 'background' },
  { src: '/near.svg', priority: 'high', type: 'background' },
  { src: '/near2.svg', priority: 'high', type: 'background' },

  { src: '/monster.svg', priority: 'low', type: 'npc' },
  { src: '/monster2.svg', priority: 'low', type: 'npc' },
  { src: '/chest.svg', priority: 'low', type: 'interactive' },
  { src: '/open-box.svg', priority: 'low', type: 'interactive' },
  { src: '/gold-dollar-coin.svg', priority: 'low', type: 'currency' },
];

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация...');
  const [currentDialog, setCurrentDialog] = useState<DialogNode | null>(null);
  const [currentEncounter, setCurrentEncounter] = useState<EncounterInfo | null>(null);
  const [playerState, setPlayerState] = useState<PlayerStateResponseDto | null>(null);
  const [worldLength, setWorldLength] = useState<number>(200);
  const [encounters, setEncounters] = useState<Encounter[]>([]);

  const { loading: resourcesLoading, isComplete: resourcesComplete } = useResourceLoader({
    resources: RESOURCES_TO_PRELOAD,
    onProgress: (progress, text) => {
      setLoadingProgress(progress);
      setLoadingText(text);
    },
    onComplete: () => {
      setLoadingProgress(50);
      setLoadingText('Ресурсы загружены');
    },
  });

  const isOverallLoading = loading || resourcesLoading;

  const { viewportRef: parallaxViewportRef, worldLengthPx } = useParallax({
    playerX,
    worldLength,
    cameraX,
    setCameraX,
    currentDialog,
    loading,
  });

  useEffect(() => {
    async function loadInitialData() {
      if (!resourcesComplete) return;

      try {
        setLoading(true);
        setLoadingProgress(60);
        setLoadingText('Загрузка данных игры...');

        const [playerData, worldData] = await Promise.all([fetchPlayerState(), fetchWorldState()]);

        setLoadingProgress(80);
        setLoadingText('Настройка мира...');

        setPlayerState(playerData);
        setWorldLength(worldData.worldLength);
        setEncounters(transformEncountersToPixels(worldData.encounters));
        setPlayerX(playerData.position * STEP_PX + START_X);

        setLoadingProgress(100);
        setLoadingText('Готово!');

        setLog((prev) => [...prev, 'Состояние игрока и мира загружено!']);

        // задержка для показа финального состояния
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        setLog((prev) => [...prev, 'Ошибка загрузки данных!']);
        console.error('Failed to fetch initial data:', error);
        setLoading(false);
      }
    }
    loadInitialData();
  }, [resourcesComplete]);

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
    loading: isOverallLoading,
    loadingProgress,
    loadingText,
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
