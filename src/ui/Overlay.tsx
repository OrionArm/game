import { memo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/state/store';

export const Overlay = memo(() => {
  const { resources, events } = useGameStore((s) => ({ resources: s.resources, events: s.events }));
  const nextDay = useGameStore((s) => s.nextDay);
  const reset = useGameStore((s) => s.reset);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        color: '#fff',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(20, 24, 28, 0.85)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '12px 16px',
          pointerEvents: 'auto',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <Badge label={`День ${resources.day}`} />
          <Badge label={`Деньги: ${resources.money.toLocaleString('ru-RU')} ₽`} />
          <Badge label={`Доход/день: +${resources.incomePerDay}`} />
          <Badge label={`Расход/день: -${resources.expensesPerDay}`} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={nextDay} color="#4CAF50">Следующий день</Button>
          <Button onClick={reset} color="#607D8B">Сброс</Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          right: 16,
          top: 84,
          width: 340,
          bottom: 16,
          background: 'rgba(20, 24, 28, 0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: 12,
          pointerEvents: 'auto',
          overflow: 'auto',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Лента событий</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map((e) => (
            <div key={e.id} style={{
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ opacity: 0.7, fontSize: 12 }}>День {e.day}</div>
              <div style={{ fontSize: 14 }}>{e.text}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          left: 16,
          top: 84,
          width: 300,
          background: 'rgba(20, 24, 28, 0.7)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: 12,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Быстрые действия</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <BuildButton type="shop" />
          <BuildButton type="factory" />
          <BuildButton type="office" />
        </div>
      </motion.div>
    </div>
  );
});

function Badge({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.06)',
        fontSize: 13,
      }}
    >
      {label}
    </div>
  );
}

function Button({ onClick, children, color }: { onClick: () => void; children: any; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: color ?? '#1E88E5',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function BuildButton({ type }: { type: 'shop' | 'factory' | 'office' }) {
  const placeBuilding = useGameStore((s) => s.placeBuilding);
  return (
    <button
      type="button"
      onClick={() => placeBuilding({ type, x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) })}
      style={{
        background: 'rgba(255,255,255,0.06)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      Построить {type === 'shop' ? 'магазин' : type === 'factory' ? 'завод' : 'офис'}
    </button>
  );
}

Overlay.displayName = 'Overlay';


