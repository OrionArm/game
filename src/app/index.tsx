import styles from './app.module.css';
import LogPanel from '@/features/log_panel';
import DialogModal from '@/features/dialog_modal';
import HUDStat from '@/features/HUD_stat';
import World from '@/features/world';
import Button from '@/shared/ui/button';
import { useGame } from '@/app/use_game';

export default function App() {
  const {
    worldRef,
    viewportRef,
    playerX,
    currentDialog,
    log,
    loading,
    playerState,
    worldStyle,
    worldLengthPx,
    encounters,
    dialog,
    showDialog,
    handleDialogOption,
    handleCloseDialog,
    stepForward,
    currentEncounter,
    resolveEncounter,
  } = useGame();

  return (
    <div className={styles.app}>
      <div className={styles['ui-overlay']}>
        <div className={styles['hud-stats']}>
          <HUDStat icon="🦶" label="Ходы" value={playerState?.position || 0} align="left" />
          <HUDStat
            icon="❤️"
            label="Здоровье"
            value={`${playerState?.health || 0}/${playerState?.maxHealth || 100}`}
            align="left"
          />
          <HUDStat icon="⚡" label="Энергия" value={playerState?.energy || 0} align="left" />
          <HUDStat icon="💰" label="Золото" value={playerState?.gold || 0} align="left" />
          <HUDStat icon="💎" label="Кристаллы" value={playerState?.cristal || 0} align="left" />
        </div>
        <LogPanel lines={log} />
      </div>

      <World
        viewportRef={viewportRef}
        worldRef={worldRef}
        worldStyle={worldStyle}
        encounters={encounters}
        playerX={playerX}
        worldLengthPx={worldLengthPx}
      />

      <Button
        onClick={stepForward}
        disabled={!!currentDialog || loading}
        ready={!currentDialog && !loading && (playerState?.energy || 0) >= 10}
      >
        {(playerState?.energy || 0) < 10 ? 'Мало энергии' : 'Ход'}
      </Button>

      <DialogModal
        dialog={dialog}
        showDialog={showDialog}
        onSelectOption={handleDialogOption}
        onClose={handleCloseDialog}
        onSelect={resolveEncounter}
        currentEncounter={currentEncounter}
      />
    </div>
  );
}
