import { useEffect, useMemo, useRef, useState } from 'react';
import './game.css';

type EncounterType = 'npc' | 'monster' | 'chest';

type Encounter = {
  id: string;
  x: number; // world position in px
  type: EncounterType;
  resolved: boolean;
  title: string;
  description: string;
};

const STEP_PX = 64; // distance per step
const CAMERA_SMOOTHNESS = 0.18; // 0..1 higher is snappier
const WORLD_LENGTH_PX = 64 * 200; // 200 tiles
const START_TILES = 6; // start this many tiles from the left edge
const START_X = STEP_PX * START_TILES;
const SAFE_MARGIN_PX = STEP_PX * 3; // keep at least this much off the left edge

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateEncounters(count: number): Encounter[] {
  const types: EncounterType[] = ['npc', 'monster', 'chest'];
  const encounters: Encounter[] = [];
  const used: number[] = [];
  for (let i = 0; i < count; i++) {
    // ensure they are at least some steps apart
    let x = Math.round(randomBetween(8, (WORLD_LENGTH_PX - 8) / STEP_PX)) * STEP_PX;
    let attempts = 0;
    while (used.some((u) => Math.abs(u - x) < STEP_PX * 4) && attempts < 20) {
      x = Math.round(randomBetween(8, (WORLD_LENGTH_PX - 8) / STEP_PX)) * STEP_PX;
      attempts++;
    }
    used.push(x);
    const type = types[Math.floor(Math.random() * types.length)];
    const title = type === 'npc' ? 'Путник' : type === 'monster' ? 'Монстр' : 'Сундук';
    const description =
      type === 'npc'
        ? 'Незнакомец машет рукой.'
        : type === 'monster'
          ? 'Враг преграждает путь.'
          : 'Старый сундук покрыт пылью.';
    encounters.push({ id: `${type}-${x}-${i}`, x, type, resolved: false, title, description });
  }
  // sort by x
  encounters.sort((a, b) => a.x - b.x);
  return encounters;
}

export default function Game() {
  const worldRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [playerX, setPlayerX] = useState(START_X);
  const [cameraX, setCameraX] = useState(() => {
    const viewHalf = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    return Math.max(START_X, viewHalf + SAFE_MARGIN_PX);
  });
  const [log, setLog] = useState<string[]>(['Добро пожаловать в приключение!']);
  const encounters = useMemo(() => generateEncounters(18), []);
  const [encounterState, setEncounterState] = useState<{
    active: boolean;
    encounter: Encounter | null;
  }>({ active: false, encounter: null });

  // Smooth camera follow
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

  // Update parallax variables on camera change
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const far = -cameraX * 0.2; // distant layer moves slower
    const near = -cameraX * 0.5; // nearer layer moves faster
    vp.style.setProperty('--para-far', `${far}px`);
    vp.style.setProperty('--para-near', `${near}px`);
  }, [cameraX]);

  // Check encounter when player moves
  useEffect(() => {
    const nearest = encounters.find((e) => !e.resolved && Math.abs(e.x - playerX) <= STEP_PX / 2);
    if (nearest && !encounterState.active) {
      setEncounterState({ active: true, encounter: nearest });
    }
  }, [playerX, encounters, encounterState.active]);

  function stepForward() {
    if (encounterState.active) return; // block movement during modal
    setPlayerX((x) => Math.min(x + STEP_PX, WORLD_LENGTH_PX));
  }

  function resolveEncounter(action: 'talk' | 'fight' | 'open' | 'ignore') {
    if (!encounterState.encounter) return;
    const e = encounterState.encounter;
    let outcome = '';
    switch (e.type) {
      case 'npc':
        outcome = action === 'talk' ? 'Вы поговорили и получили подсказку.' : 'Вы прошли мимо.';
        break;
      case 'monster':
        outcome = action === 'fight' ? 'Вы победили и получили опыт.' : 'Вы избежали боя.';
        break;
      case 'chest':
        outcome = action === 'open' ? 'Вы нашли немного золота.' : 'Сундук остался закрытым.';
        break;
    }
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
    e.resolved = true;
    setEncounterState({ active: false, encounter: null });
  }

  const worldStyle = {
    transform: `translateX(${-cameraX + window.innerWidth / 2}px)`,
  } as const;

  return (
    <div className="game-root">
      <div ref={viewportRef} className="world-viewport">
        <div ref={worldRef} className="world" style={worldStyle}>
          {/* Background layers */}
          <div className="sky" />
          <div className="mountains" />
          <div className="ground" style={{ width: WORLD_LENGTH_PX }} />

          {/* Encounters */}
          {encounters.map((e) => (
            <div
              key={e.id}
              className={`encounter encounter-${e.type} ${e.resolved ? 'resolved' : ''}`}
              style={{ left: e.x }}
              aria-hidden
            />
          ))}

          {/* Player */}
          <div className="player" style={{ left: playerX }} />
        </div>
      </div>

      {/* Log */}
      <div className="log">
        {log.map((line, i) => (
          <div className="log-line" key={i}>
            {line}
          </div>
        ))}
      </div>

      {/* HUD */}
      <div className="hud">
        <button className="step-btn" onClick={stepForward} disabled={encounterState.active}>
          Ход
        </button>
      </div>

      {/* Modal */}
      {encounterState.active && encounterState.encounter && (
        <div className="modal-overlay" role="dialog" aria-modal>
          <div className="modal">
            <div className="modal-title">{encounterState.encounter.title}</div>
            <div className="modal-desc">{encounterState.encounter.description}</div>
            <div className="modal-actions">
              {encounterState.encounter.type === 'npc' && (
                <>
                  <button onClick={() => resolveEncounter('talk')}>Поговорить</button>
                  <button onClick={() => resolveEncounter('ignore')}>Игнорировать</button>
                </>
              )}
              {encounterState.encounter.type === 'monster' && (
                <>
                  <button onClick={() => resolveEncounter('fight')}>Сразиться</button>
                  <button onClick={() => resolveEncounter('ignore')}>Отойти</button>
                </>
              )}
              {encounterState.encounter.type === 'chest' && (
                <>
                  <button onClick={() => resolveEncounter('open')}>Открыть</button>
                  <button onClick={() => resolveEncounter('ignore')}>Оставить</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
