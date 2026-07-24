import RconSettings from "@/components/display/GameServer/GameServerSettings/sections/RconSettingsSection/RconSettings.tsx";
import { useTranslation } from "react-i18next";
import type { RCONConfiguration } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer.tsx";
import { notificationModal } from "@/lib/notificationModal";

const RconSettingsSection = () => {
  const { t } = useTranslation();
  const { updateRconConfiguration } = useDataInteractions();
  const { gameServer } = useSelectedGameServer();

  const handleUpdateGameServer = async (updatedState: RCONConfiguration) => {
    if (!gameServer.uuid) {
      notificationModal.error({ message: t("toasts.missingUuid") });
      return;
    }
    await updateRconConfiguration(gameServer.uuid, updatedState);
  };

  return <RconSettings gameServer={gameServer} onConfirm={handleUpdateGameServer} />;
};

export default RconSettingsSection;
