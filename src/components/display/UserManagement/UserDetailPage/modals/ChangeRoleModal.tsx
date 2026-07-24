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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { type UserEntityDto, UserRoleUpdateDtoRole } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const ASSIGNABLE_ROLES = [UserRoleUpdateDtoRole.ADMIN, UserRoleUpdateDtoRole.QUOTA_USER] as const;

const ChangeRoleModal = (props: { user: UserEntityDto; open: boolean; onClose: () => void }) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.changeRoleDialog");
  const { changeRole } = useDataInteractions();

  const [role, setRole] = useState<UserRoleUpdateDtoRole>(
    props.user.role || UserRoleUpdateDtoRole.QUOTA_USER,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (props.open) {
      setRole(props.user.role || UserRoleUpdateDtoRole.QUOTA_USER);
      setSubmitError(null);
    }
  }, [props.open, props.user]);

  const handleClose = () => {
    setSubmitError(null);
    props.onClose();
  };

  const handleSubmit = async () => {
    if (!props.user.uuid) return;
    setSubmitError(null);
    setIsPending(true);
    try {
      await changeRole(props.user.uuid, role);
      handleClose();
    } catch {
      setSubmitError(t("submitError"));
    } finally {
      setIsPending(false);
    }
  };

  const roleLabel = (r: UserRoleUpdateDtoRole) => {
    switch (r) {
      case UserRoleUpdateDtoRole.ADMIN:
        return t("roles.admin");
      case UserRoleUpdateDtoRole.QUOTA_USER:
        return t("roles.quota_user");
      default:
        return r;
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
          <Select value={role} onValueChange={(v) => setRole(v as UserRoleUpdateDtoRole)}>
            <SelectTrigger>
              <SelectValue placeholder={t("rolePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {roleLabel(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogMain>
        <DialogFooter>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button variant="secondary" onClick={handleClose}>
            {t("cancelButton")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleModal;
