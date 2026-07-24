import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WebhookDto } from "@/api/generated/model";

type WebhookDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: WebhookDto | null;
  isDeleting: boolean;
  t: (key: string, vars?: Record<string, unknown>) => string;
  onConfirm: () => void | Promise<void>;
};

const WebhookDeleteDialog = ({
  open,
  onOpenChange,
  webhook,
  isDeleting,
  t,
  onConfirm,
}: WebhookDeleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
          <DialogDescription>{t("deleteDialog.description")}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting || !webhook?.uuid}>
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookDeleteDialog;
