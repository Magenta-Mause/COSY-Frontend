import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("components.CreateGameServer.confirmCreateDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("components.CreateGameServer.confirmCreateDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={isCreating}>
            {t("components.CreateGameServer.confirmCreateDialog.cancel")}
          </Button>
          <Button
            variant="primary"
            data-testid="create-confirm-btn"
            onClick={onConfirm}
            disabled={isCreating}
          >
            {isCreating
              ? t("components.CreateGameServer.confirmCreateDialog.creating")
              : t("components.CreateGameServer.confirmCreateDialog.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmCreateDialog;
