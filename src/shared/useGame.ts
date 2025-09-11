import { useEffect, useMemo, useRef, useState } from 'react';
import { tempDb } from '../app/tempDb';

export type EncounterType = 'npc' | 'monster' | 'chest';

export type Encounter = {
  id: string;
  x: number; // world position in px
  type: EncounterType;
  resolved: boolean;
  title: string;
  description: string;
};

export const WORLD_LENGTH_PX = 64 * 200; // 200 tiles
const STEP_PX = 64; // distance per step
const CAMERA_SMOOTHNESS = 0.18; // 0..1 higher is snappier
const START_TILES = 6; // start this many tiles from the left edge
const START_X = STEP_PX * START_TILES;
const SAFE_MARGIN_PX = STEP_PX * 3; // keep at least this much off the left edge

async function fetchEncountersFromServer(): Promise<Encounter[]> {
  return tempDb.fetchEncounters();
}

export function useGame() {
  const worldRef = useRef<HTMLDivElement>(null!);
  const viewportRef = useRef<HTMLDivElement>(null!);

  const [playerX, setPlayerX] = useState(START_X);
  const [cameraX, setCameraX] = useState(() => {
    const viewHalf = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    return Math.max(START_X, viewHalf + SAFE_MARGIN_PX);
  });
  const [log, setLog] = useState<string[]>(['Добро пожаловать в приключение!']);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);
  const [stepsCount, setStepsCount] = useState(0);
  const [goldAmount, setGoldAmount] = useState(0);


  useEffect(() => {
    async function loadEncounters() {
      try {
        setLoading(true);
        const serverEncounters = await fetchEncountersFromServer();
        setEncounters(serverEncounters);
        setLog((prev) => [...prev,'Встречи загружены с сервера!', ]);
      } catch (error) {
        setLog((prev) => [ ...prev, 'Ошибка загрузки встреч!']);
        console.error('Failed to fetch encounters:', error);
      } finally {
        setLoading(false);
      }
    }
    loadEncounters();
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setCameraX((prev) => {
        const viewHalf = window.innerWidth / 2;
        const minTarget = viewHalf + SAFE_MARGIN_PX;
        const target = Math.max(playerX, minTarget);
        const delta = target - prev;
        const next = Math.abs(delta) < 0.5 ? target : prev + delta * CAMERA_SMOOTHNESS;
        return Math.max(0, Math.min(next, WORLD_LENGTH_PX));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playerX]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const far = -cameraX * 0.2;
    const near = -cameraX * 0.5;
    vp.style.setProperty('--para-far', `${far}px`);
    vp.style.setProperty('--para-near', `${near}px`);
  }, [cameraX]);

  useEffect(() => {
    const nearest = encounters.find((e) => !e.resolved && Math.abs(e.x - playerX) <= STEP_PX / 2);
    if (nearest && !activeEncounterId) {
      setActiveEncounterId(nearest.id);
    }
  }, [playerX, encounters, activeEncounterId]);

  function stepForward() {
    if (activeEncounterId || loading) return;
    setPlayerX((x) => Math.min(x + STEP_PX, WORLD_LENGTH_PX));
    setStepsCount((n) => n + 1);
    setLog((prev) => [ ...prev,'Шаг сделан!']);
    setLoading(true);
    fetchEncountersFromServer()
      .then((newEncounters) => {
        setEncounters(newEncounters);
        setLog((prev) => ['Новые встречи загружены!', ...prev]);
      })
      .catch((error) => {
        setLog((prev) => ['Ошибка загрузки новых встреч!', ...prev]);
        console.error('Failed to fetch new encounters:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function resolveEncounter(action: 'talk' | 'fight' | 'open' | 'ignore') {
    if (!activeEncounterId) return;
    const e = encounters.find(enc => enc.id === activeEncounterId);
    if (!e) return;
    let outcome = '';
    switch (e.type) {
      case 'npc':
        outcome = action === 'talk' ? 'Вы поговорили и получили подсказку.' : 'Вы прошли мимо.';
        break;
      case 'monster':
        outcome = action === 'fight' ? 'Вы победили и получили опыт.' : 'Вы избежали боя.';
        break;
      case 'chest': {
        const goldFound = 10;
        setGoldAmount((g) => g + goldFound);
        outcome = `Вы нашли немного золота (+${goldFound}).`;
        break;
      }
      }   
    
    // Update local encounters state to mark as resolved
    setEncounters(prev => prev.map(enc => 
      enc.id === e.id ? { ...enc, resolved: true } : enc
    ));
    // Close modal immediately
    setActiveEncounterId(null);
  
    setLog((l) =>
      [
        `${e.title}: ${e.description}`,
        `Действие: ${
          action === 'talk'
            ? 'Поговорить'
            : action === 'fight'
              ? 'Сразиться'
              : action === 'open'
                ? 'Открыть'
                : 'Игнорировать'
        } → ${outcome}`,
        ...l,
      ].slice(0, 8),
    );
    
  }

  const worldStyle = useMemo(
    () =>
      ({
        transform: `translateX(${-cameraX + window.innerWidth / 2}px)`,
      }) as const,
    [cameraX],
  );

  return {
    // refs
    worldRef,
    viewportRef,
    // state
    playerX,
    cameraX,
    log,
    encounters,
    loading,
    activeEncounterId,
    stepsCount,
    goldAmount,
    // derived
    worldStyle,
    // actions
    stepForward,
    resolveEncounter,
  } as const;
}
