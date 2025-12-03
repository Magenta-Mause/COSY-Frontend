import { buttonVariants } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { Input } from "@components/ui/input.tsx";
import { Label } from "@radix-ui/react-label";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={"font-mono"}>
        <DialogHeader>
          <DialogTitle>{t("deleteGameServerDialog.title", { serverName })}</DialogTitle>
          <DialogDescription>{t("deleteGameServerDialog.description")}</DialogDescription>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-4">
              <Label htmlFor="serverName">
                {t("deleteGameServerDialog.inputLabel", { serverName })}
              </Label>
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
        </DialogHeader>
        <DialogFooter className={"flex gap-8 justify-end items-center"}>
          <DialogClose asChild>
            <button type={"button"} className={cn(buttonVariants(), "h-[50px]")} disabled={loading}>
              {t("deleteGameServerDialog.cancel")}
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(buttonVariants(), "h-[50px]")}
            disabled={isConfirmButtonDisabled}
          >
            {t("deleteGameServerDialog.confirm")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
