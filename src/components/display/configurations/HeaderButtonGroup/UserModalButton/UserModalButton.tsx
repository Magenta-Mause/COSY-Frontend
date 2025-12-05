import { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog.tsx";
import { Button } from "@components/ui/button.tsx";
import { Users, UserCircle, UserPlus, Copy, ArrowLeft, Trash2 } from "lucide-react";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import { Separator } from "@components/ui/separator.tsx";
import { cn } from "@/lib/utils.ts";
import { Input } from "@components/ui/input.tsx";
import { toast } from "sonner";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip.tsx";

type ViewState = "list" | "invite" | "result";

const UserModalButton = (props: { className?: string }) => {
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
      toast.success("Invite link copied to clipboard");
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
          aria-label={"Users"}
        >
          <Users className="!h-[1.5vw] p-0 !w-auto aspect-square" />
        </Button>
      </DialogTrigger>
      <DialogContent className={"font-['VT323']"}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {view === "list" && "Users"}
            {view === "invite" && "Invite User"}
            {view === "result" && "Invite Created"}
            {view === "list" && (
              <Button size="sm" variant="outline" onClick={() => setView("invite")}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
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
                  Pending Invites
                </h4>
                {invites.map((invite, index) => (
                  <Fragment key={invite.uuid}>
                    <div className="flex items-center gap-4 opacity-70">
                      <div className="h-8 w-8 rounded-full bg-muted border border-dashed border-foreground/20 flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {invite.username || "Unclaimed Invite"}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono truncate">
                          Invite Key: ••••••••
                        </p>
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
                              toast.success("Invite link copied to clipboard");
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy invite link</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            invite.uuid && revokeInvite(invite.uuid)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Revoke invite</span>
                        </Button>
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
                Username (Optional)
              </label>
              <Input
                id="invite-username"
                placeholder="Enter username..."
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to allow the user to choose their own username.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setView("list")}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleCreateInvite} disabled={isCreating}>
                {isCreating ? "Creating..." : "Generate Invite"}
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
                  <p>Click to copy link</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Share this link with the person you want to invite.
              They can use it to create their account.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Link
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={resetView}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserModalButton;

