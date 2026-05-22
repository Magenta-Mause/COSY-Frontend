import GameServerCreationNextPageButton from "@components/display/GameServer/CreateGameServer/GameServerCreationButton.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import ConfirmCreateDialog from "./ConfirmCreateDialog.tsx";
import Step1 from "./CreationSteps/Step1.tsx";
import Step2 from "./CreationSteps/Step2.tsx";
import Step3 from "./CreationSteps/Step3.tsx";
import { GameServerCreationContext } from "./context.ts";
import ReapplyDialog from "./ReapplyDialog.tsx";
import SuccessDialog from "./SuccessDialog.tsx";
import UnsavedChangesDialog from "./UnsavedChangesDialog.tsx";
import useGameServerCreation from "./useGameServerCreation.ts";

const PAGES = [<Step1 key="step1" />, <Step2 key="step2" />, <Step3 key="step3" />];

interface Props {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}

const CreateGameServerModal = ({ setOpen, isOpen }: Props) => {
  const { t } = useTranslation();
  const {
    creationState,
    isPageValid,
    currentPage,
    showReapplyDialog,
    showConfirmDialog,
    showUnsavedChangesDialog,
    isCreating,
    showSuccessDialog,
    setShowSuccessDialog,
    successInfo,
    isLastPage,
    setGameServerState,
    setUtilState,
    setCurrentPageValid,
    triggerNextPage,
    handleTemplateSelected,
    handleBack,
    handleCloseAttempt,
    handleDiscardChanges,
    handleCancelClose,
    handleConfirmReapply,
    handleCancelReapply,
    handleConfirmCreate,
    handleCancelConfirm,
  } = useGameServerCreation({ setOpen, isOpen });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <GameServerCreationContext.Provider
          value={{
            setGameServerState,
            creationState,
            setCurrentPageValid,
            triggerNextPage,
            handleTemplateSelected,
            setUtilState,
            isLastPage,
            isPageValid,
            currentPage,
          }}
        >
          <DialogPortal>
            <DialogOverlay />

            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <DialogContent
                className="static translate-x-0 translate-y-0 flex w-[80vw] h-[80vh]"
                asChild
              >
                <DialogHeader>
                  <DialogTitle className={"mr-5"}>
                    {t("components.CreateGameServer.steps.title")}
                  </DialogTitle>
                </DialogHeader>

                <DialogMain className="scroller p-6 flex-1 min-h-0">
                  <div className="h-full">{PAGES[currentPage]}</div>
                </DialogMain>
                <DialogFooter className="shrink-0">
                  {currentPage > 0 && (
                    <Button variant="secondary" onClick={handleBack}>
                      {t("components.CreateGameServer.backButton")}
                    </Button>
                  )}
                  <GameServerCreationNextPageButton />
                </DialogFooter>
              </DialogContent>
            </div>
          </DialogPortal>
        </GameServerCreationContext.Provider>

        <ReapplyDialog
          open={showReapplyDialog}
          onConfirm={handleConfirmReapply}
          onCancel={handleCancelReapply}
        />
        <ConfirmCreateDialog
          open={showConfirmDialog}
          isCreating={isCreating}
          onConfirm={handleConfirmCreate}
          onCancel={handleCancelConfirm}
        />
        <UnsavedChangesDialog
          open={showUnsavedChangesDialog}
          onDiscard={handleDiscardChanges}
          onCancel={handleCancelClose}
        />
      </Dialog>

      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        successInfo={successInfo}
      />
    </>
  );
};

export default CreateGameServerModal;
export type { AutoCompleteSelections, GameServerCreationFormState } from "./context.ts";
export {
  GameServerCreationContext,
  GENERIC_GAME_PLACEHOLDER_VALUE,
  GENERIC_SERVER_TEMPLATE,
} from "./context.ts";
