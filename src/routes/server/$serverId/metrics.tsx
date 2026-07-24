import MetricDisplay from "@/components/display/MetricDisplay/MetricDisplay";
import { createFileRoute } from "@tanstack/react-router";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

export const Route = createFileRoute("/server/$serverId/metrics")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { gameServer } = useGameServer(serverId ?? "");
  const { hasPermission } = useGameServerPermissions(serverId ?? "");

  if (!gameServer) {
    return null;
  }

  const canReadMetrics = hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS);

  return (
    <div className="pb-6">
      <MetricDisplay gameServer={gameServer} canReadMetrics={canReadMetrics} />
    </div>
  );
}
