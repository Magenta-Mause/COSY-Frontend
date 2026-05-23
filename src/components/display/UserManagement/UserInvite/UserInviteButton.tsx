import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog.tsx";
import Icon from "@components/ui/Icon.tsx";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserEntityDtoRole } from "@/api/generated/model";
import addUserIcon from "@/assets/icons/userAdd.webp";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { notificationModal } from "@/lib/notificationModal";
import { getCpuLimitError } from "@/lib/validators/cpuLimitValidator.ts";
import { getMemoryLimitError } from "@/lib/validators/memoryLimitValidator.ts";
import { InviteForm } from "./InviteForm/InviteForm.tsx";
import { InviteResult } from "./InviteForm/InviteResult.tsx";

const DEFAULT_ROLE: UserEntityDtoRole = "QUOTA_USER";

type ViewState = "invite" | "result";
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 50;

const UserInviteButton = (props: { className?: string }) => {
  const { t } = useTranslation();
  const { createInvite } = useDataInteractions();

  const [view, setView] = useState<ViewState>("invite");
  const [inviteUsername, setInviteUsername] = useState("");
  const [userRole, setUserRole] = useState<UserEntityDtoRole>(DEFAULT_ROLE);
  const [memoryLimit, setMemoryLimit] = useState<string | null>(null);
  const [cpuLimit, setCpuLimit] = useState<number | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [cpuError, setCpuError] = useState<string | null>(null);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [canCreateGameServers, setCanCreateGameServers] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const isQuotaUser = userRole === "QUOTA_USER";

  const hasChanges =
    view === "invite" &&
    (inviteUsername !== "" ||
      userRole !== DEFAULT_ROLE ||
      memoryLimit !== null ||
      cpuLimit !== null ||
      (isQuotaUser && !canCreateGameServers));

  const requestClose = () => {
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      setIsDialogOpen(false);
    }
  };

  const validateUsername = (username: string): string | null => {
    if (!username) return null;

    if (username.length < MIN_USERNAME_LENGTH) {
      return t("userModal.usernameErrors.tooShort");
    }

    if (username.length > MAX_USERNAME_LENGTH) {
      return t("userModal.usernameErrors.tooLong");
    }

    if (!/^[a-zA-Z0-9_-]*$/.test(username)) {
      return t("userModal.usernameErrors.invalidCharacters");
    }

    return null;
  };

  const handleUsernameChange = (value: string) => {
    setInviteUsername(value);
    const error = validateUsername(value);
    setUsernameError(error);
  };

  const handleCpuChange = (value: number | null) => {
    setCpuLimit(value);
    const error = getCpuLimitError(value);
    setCpuError(error);
  };

  const handleMemoryChange = (value: string | null) => {
    setMemoryLimit(value);
    const error = getMemoryLimitError(value);
    setMemoryError(error);
  };

  const handleCreateInvite = async () => {
    const error = validateUsername(inviteUsername);
    if (error) {
      setUsernameError(error);
      return;
    }

    // Don't submit if there are validation errors
    if (cpuError || memoryError) {
      return;
    }

    setIsCreating(true);

    try {
      const data = await createInvite({
        username: inviteUsername || undefined,
        role: userRole,
        docker_hardware_limits: {
          docker_memory_limit: memoryLimit || undefined,
          docker_max_cpu_cores: cpuLimit || undefined,
        },
        can_create_game_servers: isQuotaUser ? canCreateGameServers : undefined,
      });
      setGeneratedKey(data.secret_key || "");
      setView("result");
    } catch (_e) {
      // Toast is handled in useDataInteractions
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = !usernameError && !cpuError && !memoryError;

  const handleCopyLink = () => {
    if (generatedKey) {
      const link = `${window.location.origin}/?inviteToken=${generatedKey}`;
      navigator.clipboard.writeText(link);
      notificationModal.success({ message: t("toasts.copyClipboardSuccess") });
    }
  };

  const resetView = useCallback(() => {
    setView("invite");
    setInviteUsername("");
    setUserRole(DEFAULT_ROLE);
    setMemoryLimit(null);
    setCpuLimit(null);
    setCanCreateGameServers(true);
    setGeneratedKey(null);
    setUsernameError(null);
    setCpuError(null);
    setMemoryError(null);
  }, []);

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    setIsDialogOpen(false);
    resetView();
  };

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          } else {
            setIsDialogOpen(true);
            resetView();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className={props.className} aria-label={t("userModal.title")}>
            <Icon src={addUserIcon} className="size-5" bold={true} />
            {t("userModal.inviteUserTitle")}
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[40%]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {view === "invite" && t("userModal.inviteUserTitle")}
              {view === "result" && t("userModal.inviteCreatedTitle")}
            </DialogTitle>
          </DialogHeader>
          <DialogMain>
            {view === "invite" && (
              <InviteForm
                username={inviteUsername}
                userRole={userRole}
                memory={memoryLimit}
                cpu={cpuLimit}
                canCreateGameServers={canCreateGameServers}
                onUsernameChange={handleUsernameChange}
                onMemoryChange={handleMemoryChange}
                onCpuChange={handleCpuChange}
                onCanCreateGameServersChange={setCanCreateGameServers}
                onCancel={requestClose}
                onSubmit={handleCreateInvite}
                onUserRoleChange={setUserRole}
                isCreating={isCreating}
                usernameError={usernameError}
                cpuError={cpuError}
                memoryError={memoryError}
              />
            )}

            {view === "result" && (
              <InviteResult
                generatedKey={generatedKey}
                onCopyLink={handleCopyLink}
                onBack={resetView}
              />
            )}
          </DialogMain>
          <DialogFooter>
            {view === "invite" && (
              <>
                <Button onClick={requestClose} variant="secondary">
                  {t("userModal.cancel")}
                </Button>
                <Button onClick={handleCreateInvite} disabled={isCreating || !isFormValid}>
                  {isCreating ? t("userModal.creating") : t("userModal.generateInvite")}
                </Button>
              </>
            )}
            {view === "result" && (
              <Button onClick={resetView} variant="secondary">
                {t("userModal.backToUsers")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCloseConfirm}
        onOpenChange={(open) => {
          if (!open) setShowCloseConfirm(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("userModal.closeConfirm.title")}</DialogTitle>
          </DialogHeader>
          <DialogMain className="text-base">{t("userModal.closeConfirm.message")}</DialogMain>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCloseConfirm(false)}>
              {t("userModal.closeConfirm.stay")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmClose}>
              {t("userModal.closeConfirm.discard")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserInviteButton;
