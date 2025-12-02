import { Label } from "@radix-ui/react-label";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={"font-mono"}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteGameServerDialog.title", { serverName })}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteGameServerDialog.description")}</AlertDialogDescription>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-4">
              <Label htmlFor="serverName">{t("deleteGameServerDialog.inputLabel")}</Label>
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
        </AlertDialogHeader>
        <AlertDialogFooter className={"flex gap-8 justify-end items-center"}>
          <AlertDialogCancel className={"h-[50px]"} disabled={loading}>
            {t("deleteGameServerDialog.cancel")}
          </AlertDialogCancel>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(buttonVariants(), "h-[50px]")}
            disabled={isConfirmButtonDisabled}
          >
            {t("deleteGameServerDialog.confirm")}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
