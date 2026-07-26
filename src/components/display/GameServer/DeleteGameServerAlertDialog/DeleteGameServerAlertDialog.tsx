import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@radix-ui/react-label";
import { useNavigate } from "@tanstack/react-router";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

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
  const navigate = useNavigate();
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
        navigate({ to: "/", search: { deleted: true } });
      } catch (_e) {
        // Error is already handled by the hook
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { serverName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <DialogMain>
          <div className="flex text-base flex-col items-start gap-4">
            {t("explanation")}
            <div>
              <Label htmlFor="serverName">{t("inputLabel")}</Label>
              <br />
              <span className={"text-sm text-muted-foreground"}>
                (<span className={"select-all"}>{serverName}</span>)
              </span>
            </div>
            <Input
              id="serverName"
              data-testid="delete-confirm-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={serverName}
              disabled={loading}
            />
          </div>
        </DialogMain>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="h-12.5" variant="secondary" disabled={loading}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={"destructive"}
            data-testid="delete-confirm-btn"
            onClick={handleConfirm}
            className={"h-12.5"}
            disabled={isConfirmButtonDisabled}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
