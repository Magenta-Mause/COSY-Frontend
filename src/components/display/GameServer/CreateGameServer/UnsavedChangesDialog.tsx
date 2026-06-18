import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog.tsx";
import { Button } from "@components/ui/button.tsx";
import { useTranslation } from "react-i18next";

interface UnsavedChangesDialogProps {
  open: boolean;
  onDiscard: () => void;
  onCancel: () => void;
}

const UnsavedChangesDialog = ({ open, onDiscard, onCancel }: UnsavedChangesDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("components.CreateGameServer.unsavedChangesDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("components.CreateGameServer.unsavedChangesDialog.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            {t("components.CreateGameServer.unsavedChangesDialog.keepEditing")}
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            {t("components.CreateGameServer.unsavedChangesDialog.discard")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesDialog;
