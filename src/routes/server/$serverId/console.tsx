import LogDisplay from "@/components/display/LogDisplay/LogDisplay.tsx";
import { createFileRoute } from "@tanstack/react-router";
import {
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDtoStatus,
} from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions.tsx";

export const Route = createFileRoute("/server/$serverId/console")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { gameServer } = useGameServer(serverId ?? "");
  const { hasPermission } = useGameServerPermissions(serverId ?? "");
  const canReadLogs = hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS);
  // Only this view renders the logs, so they are fetched here and dropped on unmount.
  const { logs } = useGameServerLogs(serverId ?? "", { enabled: canReadLogs });

  if (!gameServer) {
    return null;
  }

  const isServerRunning = gameServer.status === GameServerDtoStatus.RUNNING;
  const canSendCommands = hasPermission(GameServerAccessGroupDtoPermissionsItem.SEND_COMMANDS);

  return (
    <div className="flex flex-col gap-4 grow h-full w-full rounded-none">
      <LogDisplay
        logMessages={logs}
        showCommandInput={canSendCommands}
        gameServerUuid={serverId}
        isServerRunning={isServerRunning}
        canReadLogs={canReadLogs}
        showExtendedTimestamps
        disableRoundness
        disableBorder
      />
    </div>
  );
}
