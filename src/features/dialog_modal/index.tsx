import Modal from '@/shared/ui/modal';
import styles from './dialog_modal.module.css';
import type { DialogNode, DialogOption, EncounterAction } from '@/services';
import Chest from '../chest';
import type { EncounterInfo } from '@/services/events/type';

type Props = {
  showDialog: boolean;
  dialog: DialogNode | null;
  currentEncounter: EncounterInfo | null;
  onSelectOption: (optionId: string) => void;
  onSelect: (action: EncounterAction) => void;
  onClose: () => void;
};

export default function DialogModal({
  dialog,
  showDialog,
  currentEncounter,
  onSelectOption,
  onSelect,
  onClose,
}: Props) {
  const isOpen = Boolean(currentEncounter) || Boolean(dialog);
  const handleOptionClick = (option: DialogOption) => () => onSelectOption(option.id);
  const handleSelect = (action: EncounterAction) => () => onSelect(action);
  const handleIgnore = () => onSelect('ignore');

  // Специальная обработка для сокровищ
  if (currentEncounter && currentEncounter.type === 'treasure') {
    return (
      <Modal isOpen onClose={handleIgnore} closeOnOverlayClick={false}>
        <Chest onClose={() => handleIgnore()} description={currentEncounter.description} />
      </Modal>
    );
  }

  const getActionText = (action: EncounterAction): string => {
    const actionTexts: Record<EncounterAction, string> = {
      talk: 'Поговорить',
      fight: 'Сразиться',
      flee: 'Убежать',
      loot: 'Взять',
      trade: 'Торговать',
      ignore: 'Игнорировать',
    };
    return actionTexts[action] || action;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <div className={styles.dialog}>
        {((dialog && showDialog) || (dialog && !currentEncounter)) && (
          <>
            <div className={styles.speaker}>{dialog.speaker}</div>
            <div className={styles.text}>{dialog.text}</div>
            <div className={styles.options}>
              {dialog.options.length > 0 ? (
                dialog.options.map((option) => (
                  <button
                    key={option.id}
                    className={styles.option}
                    onClick={handleOptionClick(option)}
                  >
                    {option.text}
                  </button>
                ))
              ) : (
                <button className={styles.option} onClick={() => onSelectOption('ignore')}>
                  Игнорировать
                </button>
              )}
            </div>
          </>
        )}

        {currentEncounter && !showDialog && (
          <>
            <div className={styles.speaker}>{currentEncounter.title}</div>
            <div className={styles.text}>{currentEncounter.description}</div>
            <div className={styles.actions}>
              {currentEncounter.type === 'npc_encounter' && (
                <>
                  <button onClick={handleSelect('talk')} className={styles.option}>
                    {getActionText('talk')}
                  </button>
                  <button onClick={handleSelect('flee')} className={styles.option}>
                    {getActionText('ignore')}
                  </button>
                </>
              )}
              {currentEncounter.type === 'shop' && (
                <>
                  <button onClick={handleSelect('trade')} className={styles.option}>
                    {getActionText('trade')}
                  </button>
                  <button onClick={handleSelect('flee')} className={styles.option}>
                    {getActionText('ignore')}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
