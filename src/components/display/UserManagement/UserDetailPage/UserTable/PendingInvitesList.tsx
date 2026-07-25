import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton.tsx";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/Icon.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserInviteDto } from "@/api/generated/model";
import trashIcon from "@/assets/icons/trash.webp";

interface UserListProps {
  onRevoke: (uuid: string) => void;
  invite: UserInviteDto;
}

const PendingInvitesList = ({ onRevoke, invite }: UserListProps) => {
  const { t } = useTranslation();
  const [revokeConfirmationDialogOpen, setRevokeConfirmationDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="flex gap-7 items-center my-3 justify-between z-10">
          <div className="flex flex-col gap-1">
            <div className="font-semibold truncate leading-5">
              {invite.username || t("userModal.unclaimedInvite")}
            </div>
            {invite.created_at && (
              <div className="text-sm text-muted-foreground truncate leading-4">
                {t("userModal.created", {
                  date: new Date(invite.created_at).toLocaleString(),
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {invite.secret_key && (
              <CopyButton
                value={`${window.location.origin}/?inviteToken=${invite.secret_key}`}
                tooltip={t("userModal.copyTooltip")}
                copiedTooltip={t("toasts.copyClipboardSuccess")}
              />
            )}
            <TooltipWrapper tooltip={t("userModal.revoke.tooltip")} asChild>
              <Button
                className="h-10 w-10 hover:text-destructive"
                onClick={() => setRevokeConfirmationDialogOpen(true)}
              >
                <Icon src={trashIcon} className="size-5" />
                <span className="sr-only">{t("userModal.revoke.tooltip")}</span>
              </Button>
            </TooltipWrapper>
          </div>
        </CardContent>
      </Card>

      <Dialog open={revokeConfirmationDialogOpen} onOpenChange={setRevokeConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("userModal.revoke.confirmTitle")}</DialogTitle>
            <DialogDescription>{t("userModal.revoke.confirmDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="primary" onClick={() => setRevokeConfirmationDialogOpen(false)}>
              {t("userModal.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (invite.uuid) {
                  onRevoke(invite.uuid);
                }
                setRevokeConfirmationDialogOpen(false);
              }}
            >
              {t("userModal.revoke.confirmAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingInvitesList;
