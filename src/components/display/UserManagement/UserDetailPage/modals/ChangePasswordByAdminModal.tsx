import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const ChangePasswordByAdminModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.changePasswordDialog");
  const { changePasswordByAdmin } = useDataInteractions();
  const [newPassword, setNewPassword] = useState("");

  const handleClose = () => {
    setNewPassword("");
    props.onClose();
  };

  const hasPasswordError = newPassword.length > 0 && newPassword.length < 8;

  const handleChangePassword = async () => {
    if (!props.user.uuid) return;
    try {
      await changePasswordByAdmin(props.user.uuid, newPassword);
      handleClose();
    } catch {
      // Error is already handled by the hook
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={handleClose}>
      <DialogContent className="min-w-172">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <Input
            type="password"
            header={t("newPasswordLabel")}
            description={t("newPasswordDescription")}
            placeholder={t("newPasswordPlaceholder")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={hasPasswordError ? t("newPasswordError") : undefined}
          />
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            {t("cancelButton")}
          </Button>
          <Button
            variant="destructive"
            disabled={hasPasswordError || newPassword.length === 0}
            onClick={handleChangePassword}
          >
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordByAdminModal;
