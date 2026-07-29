import { useState } from "react";
import { useDeleteUserEntity } from "@/api/generated/backend-api";
import type { UserEntityDto } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { useAppDispatch } from "@/stores/hooks.ts";
import { userSliceActions } from "@/stores/slices/userSlice";

const DeleteUserConfirmationModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t } = useTranslationPrefix("components.userManagement.deleteUserDialog");

  const { mutate: deleteUser } = useDeleteUserEntity({
    mutation: {
      onSuccess: () => {
        if (!props.user.uuid) return;
        dispatch(userSliceActions.removeUser(props.user.uuid));
        handleClose();
      },
      onError: () => {
        setSubmitError(t("submitError"));
      },
    },
  });

  const handleDeletion = () => {
    if (!props.user.uuid) return;
    deleteUser({ uuid: props.user.uuid });
  };

  const handleClose = () => {
    setSubmitError(null);
    props.onClose();
  };

  return (
    <Dialog open={props.open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <DialogMain>
          <p className="text-base">{t("message")}</p>
        </DialogMain>
        <DialogFooter>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button variant="secondary" onClick={handleClose}>
            {t("cancelButton")}
          </Button>
          <Button variant="destructive" onClick={handleDeletion}>
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserConfirmationModal;
