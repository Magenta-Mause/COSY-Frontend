import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog.tsx";
import { Input } from "@components/ui/input.tsx";
import { Separator } from "@components/ui/separator.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";
import { ArrowLeft, Copy, Trash2, UserCircle, UserPlus, Users } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { cn } from "@/lib/utils.ts";
import { useTypedSelector } from "@/stores/rootReducer.ts";

type ViewState = "list" | "invite" | "result";

const UserModalButton = (props: { className?: string }) => {
  const { t } = useTranslation();
  const users = useTypedSelector((state) => state.userSliceReducer.data);
  const invites = useTypedSelector((state) => state.userInviteSliceReducer.data);
  const [view, setView] = useState<ViewState>("list");
  const [inviteUsername, setInviteUsername] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { createInvite, revokeInvite } = useDataInteractions();

  const handleCreateInvite = async () => {
    setIsCreating(true);
    try {
      const data = await createInvite({ username: inviteUsername || undefined });
      setGeneratedKey(data.secret_key || "");
      setView("result");
    } catch (_e) {
      // Toast is handled in useDataInteractions
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedKey) {
      const link = `${window.location.origin}/?inviteToken=${generatedKey}`;
      navigator.clipboard.writeText(link);
      toast.success(t("toasts.copyClipboardSuccess"));
    }
  };

  const resetView = () => {
    setView("list");
    setInviteUsername("");
    setGeneratedKey(null);
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetView()}>
      <DialogTrigger asChild>
        <Button
          className={cn("h-auto p-[.5vw] aspect-square", props.className)}
          aria-label={t("userModal.title")}
        >
          <Users className="!h-[1.5vw] p-0 !w-auto aspect-square" />
        </Button>
      </DialogTrigger>
      <DialogContent className={"font-['VT323']"}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {view === "list" && t("userModal.title")}
            {view === "invite" && t("userModal.inviteUserTitle")}
            {view === "result" && t("userModal.inviteCreatedTitle")}
            {view === "list" && (
              <Button size="sm" variant="outline" onClick={() => setView("invite")}>
                <UserPlus className="w-4 h-4 mr-2" />
                {t("userModal.inviteBtn")}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {view === "list" && (
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
                            {t("userModal.created", {
                              date: new Date(invite.created_at).toLocaleString(),
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => invite.uuid && revokeInvite(invite.uuid)}
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
        )}

        {view === "invite" && (
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="invite-username">
                {t("userModal.usernameLabel")}
              </label>
              <Input
                id="invite-username"
                placeholder={t("userModal.usernamePlaceholder")}
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("userModal.usernameDescription")}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setView("list")}>
                {t("userModal.cancel")}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateInvite}
                disabled={isCreating}
              >
                {isCreating ? t("userModal.creating") : t("userModal.generateInvite")}
              </Button>
            </div>
          </div>
        )}

        {view === "result" && (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="bg-muted p-4 rounded-lg break-all text-center font-mono text-xl font-bold border-2 border-dashed border-primary/20 tracking-widest">
                {generatedKey}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-xs text-center text-muted-foreground break-all font-mono px-2 cursor-pointer hover:text-foreground transition-colors focus:outline-none focus:underline bg-transparent border-none p-0"
                    onClick={handleCopyLink}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCopyLink();
                      }
                    }}
                  >
                    {generatedKey ? `${window.location.origin}/?inviteToken=${generatedKey}` : ""}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("userModal.copyTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {t("userModal.shareInstructions")}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="default" size="sm" className="w-full" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" />
                {t("userModal.copyLink")}
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={resetView}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("userModal.backToUsers")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserModalButton;
