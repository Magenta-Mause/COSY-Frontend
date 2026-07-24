import DashboardRenderer from "@components/display/Dashboard/DashboardRenderer";
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

  // Which widgets the currently shown dashboard actually renders. Anything the
  // layout does not contain is never requested in the first place.
  const { showsMetrics, showsLogs } = useMemo(() => {
    let metrics = false;
    let logs = false;

    dashboardLayout?.forEach((dashboard) => {
      if (dashboard.layout_type === DashboardElementTypes.METRIC) metrics = true;
      if (dashboard.layout_type === DashboardElementTypes.LOGS) logs = true;
    });

    return { showsMetrics: metrics, showsLogs: logs };
  }, [dashboardLayout]);

  // Widgets the public dashboard exposes — those are readable without the
  // corresponding server permission, via the public endpoints.
  const { publiclyExposesMetrics, publiclyExposesLogs } = useMemo(() => {
    let metrics = false;
    let logs = false;

    if (gameServer?.public_dashboard.enabled) {
      gameServer.public_dashboard.layouts?.forEach((layout) => {
        if (layout.layout_type === DashboardElementTypes.METRIC) metrics = true;
        if (layout.layout_type === DashboardElementTypes.LOGS) logs = true;
      });
    }

    return { publiclyExposesMetrics: metrics, publiclyExposesLogs: logs };
  }, [gameServer?.public_dashboard]);

  const hasMetricsPermission = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS,
  );
  const canReadMetrics = hasMetricsPermission || canSeeMetric;
  const canReadLogs =
    hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS) || canSeeLogs;

  const { logs } = useGameServerLogs(serverId ?? "", {
    enabled: showsLogs && (canReadLogs || publiclyExposesLogs),
  });
  const { metrics } = useGameServerMetrics(serverId ?? "", {
    enabled: showsMetrics && (hasMetricsPermission || publiclyExposesMetrics),
    source: hasMetricsPermission ? "private" : "public",
  });

  if (!gameServer) {
    return null;
  }

  const isServerRunning = gameServer.status === GameServerDtoStatus.RUNNING;
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
