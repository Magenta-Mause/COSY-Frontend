import { useMemo } from "react";
import { useAppSelector } from "@/stores/hooks.ts";

const useGameServerMetrics = (serverId: string) => {
  const gameServerMetrics = useAppSelector((state) => state.gameServerMetricsSliceReducer.data);
  return useMemo(() => {
    if (!gameServerMetrics || !gameServerMetrics[serverId]) {
      return { state: "failed", metrics: [] };
    }
    return gameServerMetrics[serverId];
  }, [gameServerMetrics, serverId]);
};

export default useGameServerMetrics;
