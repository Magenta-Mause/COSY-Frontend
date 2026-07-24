import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetUserInvite, useUseInvite } from "@/api/generated/backend-api.ts";
import spinner from "@/assets/gifs/spinner.gif";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil.ts";
import { notificationModal } from "@/lib/notificationModal";
import type { InvalidRequestError } from "@/types/errors.ts";

interface InviteRedemptionModalProps {
  inviteToken: string;
  onClose: () => void;
}

export function InviteRedemptionModal({ inviteToken, onClose }: InviteRedemptionModalProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [usernameError, setUsernameError] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch invite details to validate and see if username is pre-filled
  const {
    data: inviteData,
    isLoading: isLoadingInvite,
    isError: isInviteError,
  } = useGetUserInvite(inviteToken, {
    query: {
      retry: false,
      enabled: !!inviteToken,
    },
  });

  // Mutation to register the user
  const { mutate: registerUser, isPending: isRegistering } = useUseInvite();

  const hasPasswordError = password.length > 0 && password.length < 8;
  const hasConfirmPasswordError = confirmPassword.length > 0 && password !== confirmPassword;
  const hasUsernameTooShortError =
    !inviteData?.username && username.length > 0 && username.length < 3;
  const hasUsernameTooLongError = !inviteData?.username && username.length > 50;
  const isFormValid =
    (!!inviteData?.username || (username.length >= 3 && username.length <= 50)) &&
    password.length >= 8 &&
    password === confirmPassword;

  useEffect(() => {
    if (inviteData?.username) {
      setUsername(inviteData.username);
    }
  }, [inviteData]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");
    setFormError("");

    if (!username) {
      setUsernameError(t("toasts.usernameRequired"));
      return;
    }

    registerUser(
      {
        secretKey: inviteToken,
        data: { username, password },
      },
      {
        onSuccess: () => {
          notificationModal.success({ message: t("toasts.accountCreatedSuccess") });
          handleClose();
        },
        onError: (e) => {
          const typedError = e as InvalidRequestError;
          let error: string | undefined;
          if (typedError.status === 400) {
            const totalError = Object.entries(typedError.response?.data.data ?? {})[0];
            error = totalError ? totalError[1] : undefined;
          } else if (typedError.status === 409) {
            error = typedError.response?.data.data as string;
          }
          setFormError(t("toasts.accountCreateError", { error: error ? error : "Unknown error" }));
        },
      },
    );
  };

  // If explicitly closed or token is missing
  if (!inviteToken) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={"overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle>{t("inviteRedemption.title")}</DialogTitle>
          <DialogDescription>{t("inviteRedemption.description")}</DialogDescription>
        </DialogHeader>
        {isLoadingInvite ? (
          <DialogMain className="flex justify-center">
            <img src={spinner} alt="spinner" />
          </DialogMain>
        ) : isInviteError ? (
          <DialogMain className="flex justify-center">
            <div className="py-4 text-center space-y-4">
              <p className="text-sm text-destructive">{t("inviteRedemption.invalidLink")}</p>
              <Button variant="secondary" onClick={handleClose}>
                {t("inviteRedemption.close")}
              </Button>
            </div>
          </DialogMain>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogMain className="justify-center">
              {inviteData?.invite_by_username && (
                <p className="text-base text-muted-foreground text-center">
                  {t("inviteRedemption.invitedBy", { username: inviteData.invite_by_username })}
                </p>
              )}
              <div className="space-y-7">
                {inviteData?.docker_hardware_limits && (
                  <div className="flex flex-col gap-2 mb-4 justify-center items-center">
                    {inviteData.docker_hardware_limits.docker_max_cpu_cores && (
                      <Badge className="px-3 text-sm bg-accent">
                        {t("inviteRedemption.cpuLimit", {
                          cpu: inviteData.docker_hardware_limits.docker_max_cpu_cores,
                        })}
                      </Badge>
                    )}
                    {inviteData.docker_hardware_limits.docker_memory_limit && (
                      <Badge className="px-3 text-sm bg-accent">
                        {t("inviteRedemption.memoryLimit", {
                          memory: formatMemoryLimit(
                            inviteData.docker_hardware_limits.docker_memory_limit,
                          ),
                        })}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  header={t("inviteRedemption.usernameLabel")}
                  description={
                    inviteData?.username ? t("inviteRedemption.usernameSetByInviter") : ""
                  }
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("inviteRedemption.usernamePlaceholder")}
                  disabled={!!inviteData?.username || isRegistering}
                  required={!inviteData?.username}
                  error={
                    hasUsernameTooShortError
                      ? t("userModal.usernameErrors.tooShort")
                      : hasUsernameTooLongError
                        ? t("userModal.usernameErrors.tooLong")
                        : usernameError
                  }
                />

                <Input
                  header={t("inviteRedemption.passwordLabel")}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("inviteRedemption.passwordPlaceholder")}
                  required
                  disabled={isRegistering}
                  error={hasPasswordError ? t("inviteRedemption.passwordTooShort") : undefined}
                />

                <Input
                  header={t("inviteRedemption.confirmPasswordLabel")}
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("inviteRedemption.confirmPasswordPlaceholder")}
                  required
                  disabled={isRegistering}
                  error={
                    hasConfirmPasswordError ? t("inviteRedemption.passwordsDoNotMatch") : undefined
                  }
                />
              </div>

              {formError && <div className="text-destructive text-sm mt-2">{formError}</div>}
            </DialogMain>
            <DialogFooter className="mt-6 flex gap-5">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isRegistering}
              >
                {t("inviteRedemption.cancel")}
              </Button>
              <Button type="submit" disabled={!isFormValid || isRegistering}>
                {isRegistering ? (
                  <>
                    <img src={spinner} alt="spinner" className="mr-2 h-4 w-4" />
                    {t("inviteRedemption.creating")}
                  </>
                ) : (
                  t("inviteRedemption.createAccount")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
