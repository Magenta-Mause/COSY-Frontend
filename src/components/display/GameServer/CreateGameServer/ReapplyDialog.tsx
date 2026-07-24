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

interface ReapplyDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReapplyDialog = ({ open, onConfirm, onCancel }: ReapplyDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("components.CreateGameServer.reapplyDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("components.CreateGameServer.reapplyDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            {t("components.CreateGameServer.reapplyDialog.cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {t("components.CreateGameServer.reapplyDialog.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReapplyDialog;
