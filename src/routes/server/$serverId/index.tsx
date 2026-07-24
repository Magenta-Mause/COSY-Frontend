import DashboardRenderer from "@/components/display/Dashboard/DashboardRenderer";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDtoStatus,
} from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";
import { DashboardElementTypes } from "@/types/dashboardTypes";

interface DashboardSearch {
  view?: "private" | "public";
}

export const Route = createFileRoute("/server/$serverId/")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    view: search.view === "public" || search.view === "private" ? search.view : undefined,
  }),
  component: GameServerDetailPageDashboardPage,
});

function GameServerDetailPageDashboardPage() {
  const { serverId } = Route.useParams();
  const { view } = Route.useSearch();
  const { logs } = useGameServerLogs(serverId ?? "");
  const { metrics } = useGameServerMetrics(serverId ?? "");
  const { gameServer } = useGameServer(serverId ?? "");
  const { hasPermission } = useGameServerPermissions(serverId ?? "");
  const canSeePrivateDashboard = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.READ_SERVER_PRIVATE_DASHBOARD,
  );

  const currentlyVisibleDashboard = useMemo(
    () => (canSeePrivateDashboard && view !== "public" ? "private" : "public"),
    [canSeePrivateDashboard, view],
  );

  const dashboardLayout = useMemo(() => {
    if (!gameServer) return [];
    return currentlyVisibleDashboard === "private"
      ? gameServer.private_dashboard_layouts
      : gameServer.public_dashboard.layouts;
  }, [gameServer, currentlyVisibleDashboard]);

  const { canSeeMetric, canSeeLogs } = useMemo(() => {
    let metric = false;
    let logs = false;

    dashboardLayout?.forEach((dashboard) => {
      if ("public_dashboard_types" in dashboard && gameServer?.public_dashboard.enabled) {
        if (dashboard.public_dashboard_types === DashboardElementTypes.METRIC) {
          metric = true;
        }
        if (dashboard.public_dashboard_types === DashboardElementTypes.LOGS) {
          logs = true;
        }
      }
    });

    return { canSeeMetric: metric, canSeeLogs: logs };
  }, [dashboardLayout, gameServer?.public_dashboard.enabled]);

  if (!gameServer) {
    return null;
  }

  const isServerRunning = gameServer.status === GameServerDtoStatus.RUNNING;
  const canReadMetrics =
    hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS) || canSeeMetric;
  const canReadLogs =
    hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS) || canSeeLogs;
  const canSendCommands = hasPermission(GameServerAccessGroupDtoPermissionsItem.SEND_COMMANDS);

  return (
    <DashboardRenderer
      dashboardLayout={dashboardLayout ?? []}
      metrics={metrics}
      logs={logs}
      serverId={serverId}
      isServerRunning={isServerRunning}
      canReadMetrics={canReadMetrics}
      canReadLogs={canReadLogs}
      canSendCommands={canSendCommands}
      overridePermissionCheck={currentlyVisibleDashboard === "public"}
    />
  );
}
