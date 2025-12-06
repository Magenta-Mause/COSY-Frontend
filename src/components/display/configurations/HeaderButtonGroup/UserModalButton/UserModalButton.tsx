import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog.tsx";
import { UserPlus, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { cn } from "@/lib/utils.ts";
import { InviteForm } from "./InviteForm";
import { InviteResult } from "./InviteResult";
import { UserList } from "./UserList";

type ViewState = "list" | "invite" | "result";

const UserModalButton = (props: { className?: string }) => {
  const { t } = useTranslation();
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

  const resetView = useCallback(() => {
    setView("list");
    setInviteUsername("");
    setGeneratedKey(null);
  }, []);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          resetView();
        }
        return !open;
      }}
    >
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

        {view === "list" && <UserList onRevoke={revokeInvite} />}

        {view === "invite" && (
          <InviteForm
            username={inviteUsername}
            onUsernameChange={setInviteUsername}
            onCancel={() => setView("list")}
            onSubmit={handleCreateInvite}
            isCreating={isCreating}
          />
        )}

        {view === "result" && (
          <InviteResult
            generatedKey={generatedKey}
            onCopyLink={handleCopyLink}
            onBack={resetView}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserModalButton;
