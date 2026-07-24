import { LatestServerMetricsContext } from "@components/technical/Providers/LatestServerMetricsProvider/LatestServerMetricsProvider";
import { useContext, useEffect, useMemo } from "react";
import { GameServerDtoStatus } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer";

interface UserResourceUsage {
  cpuUsage: string;
  memoryUsage: string;
}

const convertBytesToReadable = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

export const useUserResourceUsage = (userUuid: string | null | undefined): UserResourceUsage => {
  const gameServers = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const { latestMetrics, acquire } = useContext(LatestServerMetricsContext);

  // Keeps the live metric feed running only while a usage display is mounted.
  useEffect(() => acquire(), [acquire]);

  return useMemo(() => {
    // Return zeros if no userUuid provided
    if (!userUuid) {
      return {
        cpuUsage: "0.00",
        memoryUsage: "0 Bytes",
      };
    }

    // Filter running gameservers owned by this user
    const userRunningServers = gameServers.filter(
      (server) => server.owner.uuid === userUuid && server.status === GameServerDtoStatus.RUNNING,
    );

    // Calculate total CPU and memory usage
    let totalCpuUsage = 0;
    let totalMemoryUsage = 0;

    userRunningServers.forEach((server) => {
      const metricValues = latestMetrics[server.uuid]?.metric_values;

      if (metricValues) {
        // cpu_percent is reported as a percentage value (0-100); accumulate the raw percentage here
        // and convert to an approximate core count by dividing by 100 when formatting cpuUsage below.
        totalCpuUsage += metricValues.cpu_percent ?? 0;
        totalMemoryUsage += metricValues.memory_usage ?? 0;
      }
    });

    return {
      cpuUsage: (totalCpuUsage / 100).toFixed(2),
      memoryUsage: convertBytesToReadable(totalMemoryUsage),
    };
  }, [userUuid, gameServers, latestMetrics]);
};
