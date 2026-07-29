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

interface ReapplyDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReapplyDialog = ({ open, onConfirm, onCancel }: ReapplyDialogProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.reapplyDialog");

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {t("confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReapplyDialog;
