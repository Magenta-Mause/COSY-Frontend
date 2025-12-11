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
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
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
  const { t } = useTranslationPrefix("deleteGameServerDialog");
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
          <DialogTitle>{t("title", { serverName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-4">
              <div>
                <Label htmlFor="serverName">{t("inputLabel")}</Label>
                <br />
                <span className={"text-sm text-muted-foreground"}>
                  (<span className={"select-all"}>{serverName}</span>)
                </span>
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
        </DialogHeader>
        <DialogFooter className={"flex gap-8 justify-end items-center"}>
          <DialogClose asChild>
            <button type={"button"} className={cn(buttonVariants(), "h-[50px]")} disabled={loading}>
              {t("cancel")}
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(buttonVariants(), "h-[50px]")}
            disabled={isConfirmButtonDisabled}
          >
            {t("confirm")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
