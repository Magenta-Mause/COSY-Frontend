import GenericModal from "@components/ui/GenericModal/GenericModal";
import { Input } from "@components/ui/input.tsx";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useGetUserInvite, useUseInvite } from "@/api/generated/backend-api";
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

  // Form ref for manual submission
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch invite details
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

  // Mutation to register user
  const { mutate: registerUser, isPending: isRegistering } = useUseInvite();

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

    if (password !== confirmPassword) {
      toast.error(t("toasts.passwordsDoNotMatch"));
      return;
    }

    if (!username) {
      toast.error(t("toasts.usernameRequired"));
      return;
    }

    registerUser(
      {
        secretKey: inviteToken,
        data: { username, password },
      },
      {
        onSuccess: () => {
          toast.success(t("toasts.accountCreatedSuccess"));
          handleClose();
        },
        onError: (e) => {
          const typedError = e as InvalidRequestError;
          const error = Object.entries(typedError.response?.data.data ?? {})[0];
          toast.error(
            t("toasts.accountCreateError", {
              error: error ? error[1] : "Unknown error",
            }),
          );
        },
      },
    );
  };

  if (!inviteToken) return null;

  return (
    <GenericModal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      header={t("inviteRedemption.title")}
      subheader={t("inviteRedemption.description")}
      modalClassName="sm:max-w-md font-mono"
      footerButtons={
        isInviteError
          ? [
              {
                label: t("inviteRedemption.close"),
                variant: "outline",
                onClick: handleClose,
              },
            ]
          : [
              {
                label: t("inviteRedemption.cancel"),
                variant: "ghost",
                onClick: handleClose,
                disable: isRegistering,
              },
              {
                label: isRegistering
                  ? t("inviteRedemption.creating")
                  : t("inviteRedemption.createAccount"),
                icon: isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null,
                onClick: () => formRef.current?.requestSubmit(),
                disable: isRegistering,
              },
            ]
      }
    >
      {isLoadingInvite ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isInviteError ? (
        <div className="py-4 text-center space-y-4">
          <p className="text-destructive font-medium">{t("inviteRedemption.invalidLink")}</p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 py-2">
          {inviteData?.invite_by_username && (
            <p className="text-sm text-muted-foreground text-center mb-4">
              {t("inviteRedemption.invitedBy", {
                username: inviteData.invite_by_username,
              })}
            </p>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              {t("inviteRedemption.usernameLabel")}
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("inviteRedemption.usernamePlaceholder")}
              disabled={!!inviteData?.username || isRegistering}
              required={!inviteData?.username}
            />
            {inviteData?.username && (
              <p className="text-[0.8em] text-muted-foreground">
                {t("inviteRedemption.usernameSetByInviter")}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t("inviteRedemption.passwordLabel")}
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("inviteRedemption.passwordPlaceholder")}
              required
              disabled={isRegistering}
            />
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t("inviteRedemption.confirmPasswordLabel")}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("inviteRedemption.confirmPasswordPlaceholder")}
              required
              disabled={isRegistering}
            />
          </div>
        </form>
      )}
    </GenericModal>
  );
}
