import { useTypedSelector } from "@/stores/rootReducer.ts";
import { Fragment } from "react";
import { UserCircle, UserPlus, Copy, Trash2 } from "lucide-react";
import { Button } from "@components/ui/button.tsx";
import { Separator } from "@components/ui/separator.tsx";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";
import { useTranslation } from "react-i18next";

interface UserListProps {
  onRevoke: (uuid: string) => void;
}

export const UserList = ({ onRevoke }: UserListProps) => {
  const { t } = useTranslation();
  const users = useTypedSelector((state) => state.userSliceReducer.data);
  const invites = useTypedSelector((state) => state.userInviteSliceReducer.data);

  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1">
      {users.map((user, index) => (
        <Fragment key={user.uuid}>
          <div className="flex items-center gap-4">
            <UserCircle className="h-8 w-8 text-gray-400" />
            <div className="flex-1">
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>
          {index < users.length - 1 && <Separator />}
        </Fragment>
      ))}

      {users.length > 0 && invites.length > 0 && <Separator />}

      {invites.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("userModal.pendingInvites")}
          </h4>
          {invites.map((invite, index) => (
            <Fragment key={invite.uuid}>
              <div className="flex items-center gap-4 opacity-70">
                <div className="h-8 w-8 rounded-full bg-muted border border-dashed border-foreground/20 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {invite.username || t("userModal.unclaimedInvite")}
                  </p>
                  {invite.created_at && (
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {t("userModal.created", { date: new Date(invite.created_at).toLocaleString() })}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          if (invite.secret_key) {
                            const link = `${window.location.origin}/?inviteToken=${invite.secret_key}`;
                            navigator.clipboard.writeText(link);
                            toast.success(t("toasts.copyClipboardSuccess"));
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">{t("userModal.copyLink")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("userModal.copyTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => invite.uuid && onRevoke(invite.uuid)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("userModal.revokeTooltip")}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("userModal.revokeTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {index < invites.length - 1 && <Separator />}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
