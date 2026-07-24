import SettingsActionButtons from "@/components/display/GameServer/GameServerSettings/SettingsActionButtons.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

type Props = {
  loading: boolean;
  isChanged: boolean;
  isConfirmButtonDisabled: boolean;
  handleConfirm: () => void;
  handleRevert: () => void;
  handleDelete: () => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  accessGroupName: string;
};

const ActionButtons = ({
  loading,
  isChanged,
  isConfirmButtonDisabled,
  handleConfirm,
  handleRevert,
  handleDelete,
  deleteDialogOpen,
  setDeleteDialogOpen,
  accessGroupName,
}: Props) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");

  return (
    <SettingsActionButtons
      onRevert={handleRevert}
      onConfirm={handleConfirm}
      revertDisabled={loading || !isChanged}
      confirmDisabled={isConfirmButtonDisabled}
      className="mr-2 -mt-17.5 pb-3"
      positionChildren={"before"}
    >
      {/* Delete Group Button */}
      <div>
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={loading}>
          {t("deleteGroup")}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteGroupTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteGroupDescription", { groupName: accessGroupName })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="h-[50px]" variant="secondary" disabled={loading}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="h-[50px]"
              disabled={loading}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsActionButtons>
  );
};

export default ActionButtons;
