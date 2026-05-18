import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const CanCreateGameServersModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslationPrefix(
    "components.userManagement.admin.canCreateGameServersDialog",
  );
  const { setCanCreateGameServers } = useDataInteractions();

  const [allowed, setAllowed] = useState(props.user.can_create_game_servers ?? true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (props.open) {
      setAllowed(props.user.can_create_game_servers ?? true);
      setSubmitError(null);
    }
  }, [props.open, props.user]);

  const handleClose = () => {
    setSubmitError(null);
    props.onClose();
  };

  const handleSubmit = async () => {
    if (!props.user.uuid) return;
    setSubmitError(null);
    setIsPending(true);
    try {
      await setCanCreateGameServers(props.user.uuid, allowed);
      handleClose();
    } catch {
      setSubmitError(t("submitError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={handleClose}>
      <DialogContent className="min-w-172">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <div className="flex items-center gap-3">
            <Checkbox
              id="can-create-game-servers"
              checked={allowed}
              onCheckedChange={(checked) => setAllowed(checked === true)}
            />
            <Label htmlFor="can-create-game-servers" className="text-sm font-medium cursor-pointer">
              {t("label")}
            </Label>
          </div>
        </DialogMain>
        <DialogFooter>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button variant="secondary" onClick={handleClose}>
            {t("cancelButton")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CanCreateGameServersModal;
