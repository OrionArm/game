import { useEffect, useRef } from 'react';
import './App.css';
import { createGame } from '@/game/index';
import { Overlay } from '@/ui/Overlay';

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<ReturnType<typeof createGame> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    gameRef.current = createGame('game-container');
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0e0f12' }}>
      <div ref={containerRef} id="game-container" style={{ width: '100%', height: '100%' }} />
      <Overlay />
    </div>
  );
}

export default App
