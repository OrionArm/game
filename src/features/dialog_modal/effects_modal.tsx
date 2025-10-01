import Modal from '@/shared/ui/modal';
import styles from './dialog_modal.module.css';
import type { HappenedEffects } from '@/services/events/type';

type Props = {
  isOpen: boolean;
  effectsResult: HappenedEffects | undefined;
  onClose: () => void;
};

export default function EffectsModal({ isOpen, effectsResult, onClose }: Props) {
  if (!isOpen || !effectsResult) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <div className={styles.dialog}>
        <div className={styles.speaker}>Результат</div>
        <div className={styles.text}>{effectsResult.note}</div>

        {/* Детали эффектов */}
        <div className={styles.effectsDetails}>
          {/* Изменения здоровья, золота, кристаллов */}
          {(effectsResult.health !== 0 ||
            effectsResult.gold !== 0 ||
            effectsResult.cristal !== 0) && (
            <div className={styles.statsChanges}>
              {effectsResult.health !== 0 && (
                <div className={styles.statChange}>
                  <span className={styles.statIcon}>❤️</span>
                  <span
                    className={`${styles.statValue} ${effectsResult.health > 0 ? styles.positive : styles.negative}`}
                  >
                    {effectsResult.health > 0 ? '+' : ''}
                    {effectsResult.health}
                  </span>
                </div>
              )}
              {effectsResult.gold !== 0 && (
                <div className={styles.statChange}>
                  <span className={styles.statIcon}>💰</span>
                  <span
                    className={`${styles.statValue} ${effectsResult.gold > 0 ? styles.positive : styles.negative}`}
                  >
                    {effectsResult.gold > 0 ? '+' : ''}
                    {effectsResult.gold}
                  </span>
                </div>
              )}
              {effectsResult.cristal !== 0 && (
                <div className={styles.statChange}>
                  <span className={styles.statIcon}>💎</span>
                  <span
                    className={`${styles.statValue} ${effectsResult.cristal > 0 ? styles.positive : styles.negative}`}
                  >
                    {effectsResult.cristal > 0 ? '+' : ''}
                    {effectsResult.cristal}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Полученные предметы */}
          {effectsResult.itemsGain.length > 0 && (
            <div className={styles.itemsSection}>
              <div className={styles.sectionTitle}>Получены предметы:</div>
              <div className={styles.itemsList}>
                {effectsResult.itemsGain.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <span className={styles.itemName}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Потерянные предметы */}
          {effectsResult.itemsLose.length > 0 && (
            <div className={styles.itemsSection}>
              <div className={styles.sectionTitle}>Потеряны предметы:</div>
              <div className={styles.itemsList}>
                {effectsResult.itemsLose.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <span className={styles.itemName}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.options}>
          <button className={`${styles.option} ${styles.okButton}`} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}
