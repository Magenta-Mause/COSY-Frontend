import { createFileRoute, Outlet } from "@tanstack/react-router";
import GameServerSettingsLayout from "@/components/display/GameServer/GameServerSettings/GameServerSettingsLayout";
import useGameServer from "@/hooks/useGameServer/useGameServer";

export const Route = createFileRoute("/server/$serverId/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { gameServer } = useGameServer(serverId ?? "");

  if (!gameServer) {
    return null;
  }

  return (
    <GameServerSettingsLayout
      initialSettings={{ serverName: gameServer.server_name }}
      serverUuid={serverId ?? ""}
    >
      <Outlet />
    </GameServerSettingsLayout>
  );
}
