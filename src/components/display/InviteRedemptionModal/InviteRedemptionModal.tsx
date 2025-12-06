import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { Input } from "@components/ui/input.tsx";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
          handleClose(); // Close modal and clear URL param immediately
        },
        onError: (e) => {
          const typedError = e as InvalidRequestError;
          const error = Object.entries(typedError.response?.data.data)[0];
          toast.error(
            t("toasts.accountCreateError", { error: error ? error[1] : "Unknown error" }),
          );
        },
      },
    );
  };

  // If explicitly closed or token is missing
  if (!inviteToken) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="font-mono sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("inviteRedemption.title")}</DialogTitle>
          <DialogDescription>{t("inviteRedemption.description")}</DialogDescription>
        </DialogHeader>

        {isLoadingInvite ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isInviteError ? (
          <div className="py-4 text-center space-y-4">
            <p className="text-destructive font-medium">{t("inviteRedemption.invalidLink")}</p>
            <Button variant="outline" onClick={handleClose}>
              {t("inviteRedemption.close")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {inviteData?.invited_by && (
              <p className="text-sm text-muted-foreground text-center mb-4">
                {t("inviteRedemption.invitedBy", { username: inviteData.invite_by_username })}
              </p>
            )}

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("inviteRedemption.usernameLabel")}
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("inviteRedemption.usernamePlaceholder")}
                disabled={!!inviteData?.username || isRegistering} // Disable if pre-set by invite
              />
              {inviteData?.username && (
                <p className="text-[0.8em] text-muted-foreground">
                  {t("inviteRedemption.usernameSetByInviter")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
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

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
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

            <DialogFooter className="mt-6 flex gap-5">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isRegistering}
                className={"h-15"}
              >
                {t("inviteRedemption.cancel")}
              </Button>
              <Button type="submit" disabled={isRegistering} className={"h-15"}>
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
