import { GameServerDetailContext } from "@/components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout";
import { useContext } from "react";

const useSelectedGameServer = () => {
  const { gameServer } = useContext(GameServerDetailContext);

  return { gameServer };
};

export default useSelectedGameServer;
