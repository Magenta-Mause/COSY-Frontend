import type { RCONConfiguration } from "@/api/generated/model";
import RconSettings from "@/components/display/GameServer/GameServerSettings/sections/RconSettingsSection/RconSettings.tsx";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { notificationModal } from "@/lib/notificationModal";

const RconSettingsSection = () => {
  const { t } = useTranslationPrefix("toasts");
  const { updateRconConfiguration } = useDataInteractions();
  const { gameServer } = useSelectedGameServer();

  const handleUpdateGameServer = async (updatedState: RCONConfiguration) => {
    if (!gameServer.uuid) {
      notificationModal.error({ message: t("missingUuid") });
      return;
    }
    await updateRconConfiguration(gameServer.uuid, updatedState);
  };

  return <RconSettings gameServer={gameServer} onConfirm={handleUpdateGameServer} />;
};

export default RconSettingsSection;
