import { useMemo } from "react";
import { useAppSelector } from "@/stores/hooks.ts";

const useGameServer = (serverUuid: string) => {
  const gameServers = useAppSelector((state) => state.gameServerSliceReducer.data);
  const gameServersInitialized = useAppSelector(
    (state) => state.gameServerSliceReducer.initialized,
  );

  return useMemo(() => {
    if (gameServersInitialized === false) {
      return { server: undefined, initialized: false };
    }

    const gameServer = gameServers.find((server) => server.uuid === serverUuid);

    return {
      gameServer,
      initialized: true,
    };
  }, [gameServersInitialized, gameServers, serverUuid]);
};

export default useGameServer;
