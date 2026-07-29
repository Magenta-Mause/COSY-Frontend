import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface ConfirmCreateDialogProps {
  open: boolean;
  isCreating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmCreateDialog = ({
  open,
  isCreating,
  onConfirm,
  onCancel,
}: ConfirmCreateDialogProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.confirmCreateDialog");

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={isCreating}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            data-testid="create-confirm-btn"
            onClick={onConfirm}
            disabled={isCreating}
          >
            {isCreating ? t("creating") : t("confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmCreateDialog;
