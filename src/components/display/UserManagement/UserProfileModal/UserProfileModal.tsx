import ResourceUsageBadge from "@components/display/ResourceUsageBadge/ResourceUsageBadge.tsx";
import { ChangePasswordModal } from "@components/display/UserManagement/ChangePasswordModal/ChangePasswordModal.tsx";
import UserRoleBadge from "@components/display/UserRoleBadge/UserRoleBadge.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import pencilWrite from "@/assets/icons/pencilWrite.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { useUserResourceUsage } from "@/hooks/useUserResourceUsage/useUserResourceUsage.tsx";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { t } = useTranslationPrefix("userProfileModal");
  const { t: tCommon } = useTranslation();
  const { username, role, memoryLimit, cpuLimit, uuid } = useContext(AuthContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { cpuUsage, memoryUsage } = useUserResourceUsage(uuid);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const handleChangePasswordClick = () => {
    setShowPasswordModal(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={dialogContentRef}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            dialogContentRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>

          <DialogMain>
            <div className="flex-col">
              <p className="text-sm font-bold">{t("usernameAndRole")}</p>
              <div className="flex items-start gap-2 pb-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-base font-medium">{username}</span>
                  {role && <UserRoleBadge className="h-fit" role={role} />}
                </div>
              </div>

              <div className="flex w-full gap-2 items-end pb-5">
                <div className="flex-1">
                  <Input
                    type="password"
                    header={t("changePasswordButton")}
                    value="••••••••"
                    readOnly
                    disabled
                  />
                </div>

                <TooltipWrapper tooltip={t("changePasswordButton")} asChild>
                  <Button
                    onClick={handleChangePasswordClick}
                    size="icon"
                    className="h-9 w-9"
                    aria-label={t("changePasswordButton")}
                  >
                    <Icon src={pencilWrite} className="size-5" />
                  </Button>
                </TooltipWrapper>
              </div>

              <div>
                <p className="text-sm font-bold">{t("limits")}</p>
                <div className="flex gap-2 mt-2">
                  <ResourceUsageBadge
                    currentValue={cpuUsage}
                    limit={
                      cpuLimit != null
                        ? cpuLimit
                        : tCommon("components.userManagement.userRow.resources.unlimited")
                    }
                    resourceType={tCommon("components.userManagement.userRow.resources.cpus")}
                  />
                  <ResourceUsageBadge
                    currentValue={memoryUsage}
                    limit={
                      memoryLimit != null
                        ? formatMemoryLimit(memoryLimit)
                        : tCommon("components.userManagement.userRow.resources.unlimited")
                    }
                    resourceType={tCommon("components.userManagement.userRow.resources.memory")}
                  />
                </div>
              </div>
            </div>
          </DialogMain>
        </DialogContent>
      </Dialog>

      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        uuid={uuid}
      />
    </>
  );
}
