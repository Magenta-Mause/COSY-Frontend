import { useContext } from "react";
import { GameServerDetailContext } from "@/components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout";

const useSelectedGameServer = () => {
  const { gameServer } = useContext(GameServerDetailContext);

  return { gameServer };
};

export default useSelectedGameServer;
