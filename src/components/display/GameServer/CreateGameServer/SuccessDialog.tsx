import { useNavigate } from "@tanstack/react-router";
import type { GameServerDto } from "@/api/generated/model";
import HouseBuildingProcess from "@/components/display/GameServer/CreateGameServer/HouseBuildingProcess.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  successInfo: {
    server: GameServerDto;
  } | null;
}

const SuccessDialog = ({ open, onClose, successInfo }: SuccessDialogProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.successDialog");
  const navigate = useNavigate();
  const openDashboard = () => navigate({ to: `/server/${successInfo?.server.uuid}` });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-6 p-8">
        <DialogHeader className="items-center">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", {
              name: successInfo?.server.server_name ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogMain className={"overflow-x-clip"}>
          {successInfo && (
            <HouseBuildingProcess
              houseType={successInfo.server.design}
              currentStep={2}
              serverName={successInfo.server.server_name}
              stepLabel={t("completedStepLabel")}
              allStepsFinished
              asChild
            />
          )}
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("doneButton")}
          </Button>
          <Button
            variant={"primary"}
            data-testid="create-success-open-dashboard-btn"
            onClick={openDashboard}
          >
            {t("openDashboard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
