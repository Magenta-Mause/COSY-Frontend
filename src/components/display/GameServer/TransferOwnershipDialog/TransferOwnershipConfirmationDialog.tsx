import { Dialog } from "@radix-ui/react-dialog";
import { useState } from "react";
import type { GameServerDto, TransferOwnershipDto } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const TransferOwnershipConfirmationDialog = (props: {
  gameServer: GameServerDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newOwnerName: string;
  onSuccess: () => void;
}) => {
  const { t } = useTranslationPrefix(
    "components.editGameServer.uncosyZone.transferOwnership.confirmationDialog",
  );
  const { transferOwnership } = useDataInteractions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const dto: TransferOwnershipDto = {
        new_owner_name: props.newOwnerName,
      };
      await transferOwnership(props.gameServer.uuid, dto);
      props.onSuccess();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t("transferError");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return;
    props.onOpenChange(newOpen);
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <DialogMain>
          <p className="text-base leading-6">{t("description")}</p>
          <p className="text-base">{t("newOwner")}</p>
          <p className="font-bold text-base">{props.newOwnerName}</p>
        </DialogMain>
        <DialogFooter>
          {error && <p className="text-base text-alarm">{error}</p>}

          <DialogClose asChild>
            <Button className="" variant="secondary" disabled={loading}>
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button type="button" variant={"destructive"} onClick={handleConfirm} disabled={loading}>
            {loading ? t("transferring") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferOwnershipConfirmationDialog;
