import GenericModal from "@components/ui/GenericModal/GenericModal";
import { Input } from "@components/ui/input.tsx";
import { Label } from "@radix-ui/react-label";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeleteGameServerAlertDialogProps {
  serverName: string;
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGameServerAlertDialog({
  serverName,
  onConfirm,
  open,
  onOpenChange,
}: DeleteGameServerAlertDialogProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const isConfirmButtonDisabled = inputValue !== serverName || loading;

  const handleConfirm = async () => {
    if (isConfirmButtonDisabled) return;

    if (inputValue === serverName) {
      setLoading(true);
      try {
        await onConfirm();
        setInputValue(""); // Clear input after confirmation
        onOpenChange(false); // Close dialog on success
      } catch (_e) {
        // Error is already handled by the hook, no need to toast here
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return; // Prevent closing while loading
    onOpenChange(newOpen);
    if (!newOpen) {
      setInputValue(""); // Clear input when dialog closes
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={handleOpenChange}
      header={t("deleteGameServerDialog.title", { serverName })}
      subheader={t("deleteGameServerDialog.subheader")}
      footerButtons={[
        {
          label: t("deleteGameServerDialog.confirm"),
          onClick: handleConfirm,
          disable: isConfirmButtonDisabled,
        },
      ]}
      closeButton={{}}
    >
      <div>
        <div className="flex flex-col items-start gap-4">
          {t("deleteGameServerDialog.description")}
          <div>
            <Label htmlFor="serverName">{t("deleteGameServerDialog.inputLabel")}</Label>
          </div>
          <Input
            id="serverName"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={serverName}
            disabled={loading}
          />
        </div>
      </div>
    </GenericModal>
  );
}
