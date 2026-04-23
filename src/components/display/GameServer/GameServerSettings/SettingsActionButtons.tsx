import { Button } from "@components/ui/button.tsx";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { Dialog } from "@radix-ui/react-dialog";
import { useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";

interface SettingsActionButtonsProps {
  onRevert: () => void;
  onConfirm: () => void;
  revertDisabled: boolean;
  confirmDisabled: boolean;
  loading?: boolean;
  errorMessage?: string | null;
  confirmTooltip?: string | false;
  className?: string;
  children?: React.ReactNode;
  requireConfirmationLabel?: string;
  positionChildren?: "before" | "after";
}

const SettingsActionButtons = ({
  onRevert,
  onConfirm,
  revertDisabled,
  confirmDisabled,
  loading,
  errorMessage,
  confirmTooltip,
  className,
  children,
  requireConfirmationLabel,
  positionChildren = "after",
}: SettingsActionButtonsProps) => {
  const { t } = useTranslationPrefix("components.settingsActionButtons");
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const handleConfirm = () => {
    setConfirmationModalOpen(false);
    onConfirm();
  };

  const handleCancel = () => {
    setConfirmationModalOpen(false);
  };

  return (
    <>
      {positionChildren === "before" && children}
      <div
        className={cn(
          "sticky bottom-4 w-fit ml-auto flex items-center gap-4 mr-5 mt-auto",
          className,
        )}
      >
        {errorMessage && <p className="text-base text-destructive">{errorMessage}</p>}

        <Button className="h-12.5" variant="secondary" disabled={revertDisabled} onClick={onRevert}>
          {t("revert")}
        </Button>

        <TooltipWrapper tooltip={confirmTooltip}>
          <Button
            className="h-12.5"
            disabled={confirmDisabled}
            data-loading={loading || undefined}
            onClick={requireConfirmationLabel ? () => setConfirmationModalOpen(true) : onConfirm}
          >
            {loading ? t("saving") : t("confirm")}
          </Button>
        </TooltipWrapper>
      </div>

      {positionChildren !== "before" && children}

      <Dialog open={isConfirmationModalOpen} onOpenChange={setConfirmationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("warning")}</DialogTitle>
          </DialogHeader>
          <DialogMain>
            <div className={"text-base leading-8 text-destructive"}>
              {requireConfirmationLabel ?? t("confirm")}
            </div>
          </DialogMain>

          <DialogFooter>
            <Button variant="secondary" onClick={handleCancel}>
              {t("cancel")}
            </Button>

            <Button disabled={confirmDisabled} onClick={handleConfirm}>
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsActionButtons;
