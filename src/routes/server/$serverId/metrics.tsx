import MetricDisplay from "@/components/display/MetricDisplay/MetricDisplay";
import { createFileRoute } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";

export const Route = createFileRoute("/server/$serverId/metrics")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { metrics } = useGameServerMetrics(serverId ?? "");
  const { gameServer } = useGameServer(serverId ?? "");

  if (!gameServer) {
    return null;
  }
  return (
    <div className="pb-6">
      <MetricDisplay metrics={metrics} gameServer={gameServer} />
    </div>
  );
}
