import { useState, useCallback } from 'react';
import type { DialogNode } from '@/services';
import type { PlayerStateResponseDto } from '@/services/client_player_service';
import { processEncounterDialogChoice, processStepDialogChoice } from '../../shared/local_api';
import type {
  DialogChoiceResponseDto,
  EncounterAction,
  EncounterInfo,
} from '@/services/events/type';

type Props = {
  currentEncounter: EncounterInfo | null;
  currentDialog: DialogNode | null;
  setCurrentDialog: (dialog: DialogNode | null) => void;
  setCurrentEncounter: (encounter: EncounterInfo | null) => void;
  setLog: React.Dispatch<React.SetStateAction<string[]>>;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerStateResponseDto | null>>;
};

export function useDialog({
  currentEncounter,
  currentDialog,
  setCurrentDialog,
  setCurrentEncounter,
  setLog,
  setPlayerState,
}: Props) {
  const [showDialog, setShowDialog] = useState(false);

  const closeDialog = useCallback(() => {
    setCurrentDialog(null);
    setCurrentEncounter(null);
    setShowDialog(false);
  }, [setCurrentDialog, setCurrentEncounter]);

  const selectDialogOption = useCallback(
    async (optionId: string, onDialogComplete: () => void) => {
      if (!currentDialog) return;

      try {
        let result: DialogChoiceResponseDto | undefined = undefined;

        if (currentEncounter) {
          result = await processEncounterDialogChoice(currentDialog.id, optionId);
        } else {
          result = await processStepDialogChoice(currentDialog.id, optionId);
        }

        if (result) {
          if (result.message) setLog((prev) => [...prev, result.message]);

          if (result.newState) {
            setPlayerState(result.newState);
          }

          if (result.nextDialog) {
            setCurrentDialog(result.nextDialog);
          } else {
            closeDialog();
            onDialogComplete();
          }
        } else {
          closeDialog();
          onDialogComplete();
        }
      } catch (error) {
        const message = `Ошибка обработки диалога: ${error}`;
        setLog((prev) => [...prev, message]);
        closeDialog();
        onDialogComplete();
      }
    },
    [currentDialog, currentEncounter, setLog, setPlayerState, closeDialog, setCurrentDialog],
  );

  const handleDialogOption = useCallback(
    async (optionId: string) => {
      await selectDialogOption(optionId, () => {});
    },
    [selectDialogOption],
  );

  const handleCloseDialog = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const resolveEncounter = useCallback(
    async (action: EncounterAction) => {
      if (action === 'talk') {
        setShowDialog(true);
      } else {
        setCurrentDialog(null);
        setCurrentEncounter(null);
        setShowDialog(false);
      }
    },
    [setCurrentDialog, setCurrentEncounter],
  );

  return {
    currentDialog,
    showDialog,
    handleDialogOption,
    handleCloseDialog,
    resolveEncounter,
  };
}
