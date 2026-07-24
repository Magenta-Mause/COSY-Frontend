import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Dialog } from "@radix-ui/react-dialog";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { useGetUUIDByUsername } from "@/api/generated/backend-api";
import type { GameServerDto } from "@/api/generated/model";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import TransferOwnershipConfirmationDialog from "./TransferOwnershipConfirmationDialog";

const TransferOwnershipDialog = (props: {
  gameServer: GameServerDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslationPrefix(
    "components.editGameServer.uncosyZone.transferOwnership.dialog",
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [userCheckError, setUserCheckError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { loadGameServers } = useDataLoading();

  const {
    refetch,
    isFetching,
    error: queryError,
  } = useGetUUIDByUsername(inputValue, {
    query: {
      enabled: false,
      retry: false,
    },
  });

  const isConfirmButtonDisabled = inputValue === "" || isFetching;

  const handleConfirm = async () => {
    setUserCheckError(null);
    const { data } = await refetch();

    if (queryError || !data) {
      setUserCheckError(t("userNotFound"));
    } else {
      setIsConfirmationDialogOpen(true);
    }
  };

  const handleTransferSuccess = () => {
    loadGameServers();
    setIsConfirmationDialogOpen(false);
    setShowSuccess(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isFetching) return;
    props.onOpenChange(newOpen);
    if (!newOpen) {
      setInputValue("");
      setUserCheckError(null);
      setShowSuccess(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isConfirmButtonDisabled) {
      e.preventDefault();
      handleConfirm();
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={props.open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("successTitle")}</DialogTitle>
          </DialogHeader>
          <DialogMain>
            <p className="text-base">{t("successMessage")}</p>
          </DialogMain>
          <DialogFooter>
            <Button onClick={() => handleOpenChange(false)}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={props.open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <DialogMain>
            <Input
              id="userName"
              header={t("inputLabel")}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setUserCheckError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              disabled={isFetching}
            />
            {userCheckError && <p className="text-sm text-destructive mt-1">{userCheckError}</p>}
          </DialogMain>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="" variant="secondary" disabled={isFetching}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={"destructive"}
              onClick={handleConfirm}
              disabled={isConfirmButtonDisabled}
            >
              {isFetching ? t("checking") || "Checking..." : t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TransferOwnershipConfirmationDialog
        gameServer={props.gameServer}
        open={isConfirmationDialogOpen}
        onOpenChange={setIsConfirmationDialogOpen}
        newOwnerName={inputValue}
        onSuccess={handleTransferSuccess}
      />
    </>
  );
};

export default TransferOwnershipDialog;
