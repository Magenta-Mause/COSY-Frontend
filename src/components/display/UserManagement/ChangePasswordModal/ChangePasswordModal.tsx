import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import * as React from "react";
import { useEffect, useState } from "react";
import { useChangePassword } from "@/api/generated/backend-api";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { notificationModal } from "@/lib/notificationModal";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uuid: string | null;
}

export function ChangePasswordModal({ open, onOpenChange, uuid }: ChangePasswordModalProps) {
  const { t } = useTranslationPrefix("changePasswordModal");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { mutate: changePassword, isPending } = useChangePassword();

  const hasPasswordError = newPassword.length > 0 && newPassword.length < 8;
  const hasConfirmPasswordError = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isFormValid =
    oldPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const oldPasswordRef = React.useRef<HTMLInputElement>(null);
  const newPasswordRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!uuid) {
      notificationModal.error({ message: t("missingUuid") });
      return;
    }

    changePassword(
      { uuid, data: { old_password: oldPassword, new_password: newPassword } },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          onOpenChange(false);
        },
        onError: (err) => {
          notificationModal.error({ message: t("passwordChangeError"), cause: err });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md ml-auto mr-0 mb-0 mt-auto h-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <DialogMain>
          <form
            id="change-password-form"
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4"
          >
            <Input
              ref={oldPasswordRef}
              type="password"
              header={t("oldPassword")}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && !e.shiftKey) {
                  e.preventDefault();
                  newPasswordRef.current?.focus();
                }
              }}
              placeholder={t("oldPasswordPlaceholder")}
              disabled={isPending}
              className="w-full"
            />
            <Input
              ref={newPasswordRef}
              type="password"
              header={t("newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  if (e.shiftKey) {
                    oldPasswordRef.current?.focus();
                  } else {
                    confirmPasswordRef.current?.focus();
                  }
                }
              }}
              placeholder={t("newPasswordPlaceholder")}
              disabled={isPending}
              className="w-full"
              error={hasPasswordError ? t("passwordTooShort") : undefined}
            />
            <Input
              ref={confirmPasswordRef}
              type="password"
              header={t("confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && e.shiftKey) {
                  e.preventDefault();
                  newPasswordRef.current?.focus();
                }
              }}
              placeholder={t("confirmPasswordPlaceholder")}
              disabled={isPending}
              className="w-full"
              error={hasConfirmPasswordError ? t("passwordsDoNotMatch") : undefined}
            />
          </form>
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="change-password-form"
            disabled={!isFormValid || isPending || hasPasswordError}
          >
            {t("changePassword")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
