import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

interface DeleteGameServerSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteGameServerSuccessDialog({
  open,
  onClose,
}: DeleteGameServerSuccessModalProps) {
  const { t } = useTranslationPrefix("deleteGameServerSuccessDialog");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="h-12.5" onClick={onClose}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
