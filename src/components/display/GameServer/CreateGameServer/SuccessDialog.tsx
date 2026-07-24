import HouseBuildingProcess from "@components/display/GameServer/CreateGameServer/HouseBuildingProcess.tsx";
import { Button } from "@components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog.tsx";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { GameServerDto } from "@/api/generated/model";

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  successInfo: {
    server: GameServerDto;
  } | null;
}

const SuccessDialog = ({ open, onClose, successInfo }: SuccessDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const openDashboard = () => navigate({ to: `/server/${successInfo?.server.uuid}` });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-6 p-8">
        <DialogHeader className="items-center">
          <DialogTitle>{t("components.CreateGameServer.successDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("components.CreateGameServer.successDialog.description", {
              name: successInfo?.server.server_name,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogMain className={"overflow-x-clip"}>
          {successInfo && (
            <HouseBuildingProcess
              houseType={successInfo.server.design}
              currentStep={2}
              serverName={successInfo.server.server_name}
              stepLabel={t("components.CreateGameServer.successDialog.completedStepLabel")}
              allStepsFinished
              asChild
            />
          )}
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t("components.CreateGameServer.successDialog.doneButton")}
          </Button>
          <Button
            variant={"primary"}
            data-testid="create-success-open-dashboard-btn"
            onClick={openDashboard}
          >
            {t("components.CreateGameServer.successDialog.openDashboard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
