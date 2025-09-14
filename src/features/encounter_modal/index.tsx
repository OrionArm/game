import type { EncounterType } from '@/shared/use_game';
import Modal from '@/shared/ui/modal';
import styles from './encounter_modal.module.css';
import { ChestModal } from '../chest_modal';

type Encounter = {
  title: string;
  description: string;
  type: EncounterType;
};

type Props = {
  encounter: Encounter | null;
  onSelect: (action: 'talk' | 'fight' | 'open' | 'ignore') => void;
};

export default function EncounterModal({ encounter, onSelect }: Props) {
  if (!encounter) return null;

  const handleSelect = (action: 'talk' | 'fight' | 'open' | 'ignore') => () =>  onSelect(action);

  const handleIgnore = () => onSelect('ignore');

  if (encounter.type === 'chest') return <ChestModal onClose={handleIgnore} isOpen description={encounter.description}/>

  return (
    <Modal isOpen>
      <div className={styles.title}>{encounter.title}</div>
      <div className={styles.desc}>{encounter.description}</div>
      <div className={styles.actions}>
        {encounter.type === 'npc' && (
          <>
            <button onClick={handleSelect('talk')}>Поговорить</button>
            <button onClick={handleIgnore}>Игнорировать</button>
          </>
        )}
        {encounter.type === 'monster' && (
          <>
            <button onClick={handleSelect('fight')}>Сразиться</button>
            <button onClick={handleIgnore}>Отойти</button>
          </>
        )}
      </div>
    </Modal>
  );
}
