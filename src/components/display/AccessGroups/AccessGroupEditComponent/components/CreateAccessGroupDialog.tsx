import InputFieldEditGameServer from "@/components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import Icon from "@/components/ui/Icon.tsx";
import { useState } from "react";
import type { GameServerAccessGroupDto } from "@/api/generated/model";
import plusIcon from "@/assets/icons/plus.webp";
import { toggleVariants } from "@/components/ui/toggle";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";
import { cn } from "@/lib/utils";
import { accessGroupToggleItemClassName } from "./accessGroupToggleStyles";

const CreateAccessGroupDialog = (props: {
  onCreate: (groupName: string) => Promise<void>;
  accessGroups: GameServerAccessGroupDto[];
}) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.accessManagement");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const doesGroupNameAlreadyExist = props.accessGroups.some((acc) => acc.group_name === groupName);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    if (doesGroupNameAlreadyExist) return;

    setLoading(true);
    try {
      await props.onCreate(groupName.trim());
      setDialogOpen(false);
      setTimeout(() => setGroupName(""), 200);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (loading) return;
    setDialogOpen(open);
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          toggleVariants({ variant: "outline" }),
          "w-auto min-w-0 shrink-0 px-3 rounded-md",
          accessGroupToggleItemClassName,
        )}
        onClick={() => setDialogOpen(true)}
      >
        <Icon src={plusIcon} variant="secondary" className="size-5" />
        <span>{t("createNewGroup")}</span>
      </button>
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createNewGroup")}</DialogTitle>
            <DialogDescription>{t("createGroupDescription")}</DialogDescription>
          </DialogHeader>

          <InputFieldEditGameServer
            label={t("groupNameLabel")}
            value={groupName}
            onChange={(v) => setGroupName(v as string)}
            validator={requiredStringValidator}
            isError={doesGroupNameAlreadyExist}
            placeholder={t("groupNamePlaceholder")}
            errorLabel={
              doesGroupNameAlreadyExist ? t("groupNameAlreadyExists") : t("groupNameRequired")
            }
            disabled={loading}
            onEnterPress={groupName.trim() ? handleCreate : undefined}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={loading}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={loading || !groupName.trim() || doesGroupNameAlreadyExist}
            >
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAccessGroupDialog;
