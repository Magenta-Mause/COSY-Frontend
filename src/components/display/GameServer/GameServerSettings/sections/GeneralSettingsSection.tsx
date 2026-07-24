import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import type { GameServerUpdateDto } from "@/api/generated/model/gameServerUpdateDto";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer";
import { notificationModal } from "@/lib/notificationModal";
import EditGameServerPage from "../../EditGameServer/EditGameServerPage";
import UncosyZone from "../../EditGameServer/UncosyZone";

const GeneralSettingsSection = () => {
  const { t } = useTranslationPrefix("toasts");
  const { updateGameServer } = useDataInteractions();
  const { gameServer } = useSelectedGameServer();

  const handleUpdateGameServer = async (updatedState: GameServerUpdateDto) => {
    if (!gameServer.uuid) {
      notificationModal.error({ message: t("missingUuid") });
      return;
    }
    await updateGameServer(gameServer.uuid, updatedState);
  };

  return (
    <div className="flex flex-col gap-5">
      <EditGameServerPage
        serverName={gameServer.server_name ?? ""}
        gameServer={gameServer}
        onConfirm={handleUpdateGameServer}
      />
      <UncosyZone gameServer={gameServer} />
    </div>
  );
};

export default GeneralSettingsSection;
