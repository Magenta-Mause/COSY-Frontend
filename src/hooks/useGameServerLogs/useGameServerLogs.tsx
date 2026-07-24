import { useMemo } from "react";
import { useAppSelector } from "@/stores/hooks.ts";

const useGameServerLogs = (serverId: string) => {
  const gameServerLogs = useAppSelector((state) => state.gameServerLogSliceReducer.data);
  return useMemo(() => {
    if (!gameServerLogs || !gameServerLogs[serverId]) {
      return { state: "failed", logs: [] };
    }
    return gameServerLogs[serverId];
  }, [gameServerLogs, serverId]);
};

export default useGameServerLogs;
