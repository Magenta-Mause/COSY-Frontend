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

interface UnsavedChangesDialogProps {
  open: boolean;
  onDiscard: () => void;
  onCancel: () => void;
}

const UnsavedChangesDialog = ({ open, onDiscard, onCancel }: UnsavedChangesDialogProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.unsavedChangesDialog");

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            {t("keepEditing")}
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            {t("discard")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesDialog;
