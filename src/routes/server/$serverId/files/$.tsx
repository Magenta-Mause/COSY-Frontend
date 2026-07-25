import { FileBrowserDialog } from "@/components/display/GameServer/FileBrowser/FileBrowserDialog/FileBrowserDialog";
import { createFileRoute } from "@tanstack/react-router";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

export const Route = createFileRoute("/server/$serverId/files/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { gameServer } = useGameServer(serverId);
  const { t } = useTranslationPrefix("filesPage");
  const { _splat: path } = Route.useParams();
  const { hasPermission } = useGameServerPermissions(serverId ?? "");

  if (!gameServer)
    return (
      <div className="flex justify-center items-center h-screen">{t("loading")}</div>
    );

  const canReadFiles = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.READ_SERVER_SERVER_FILES,
  );
  const canChangeFiles = hasPermission(GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_FILES);

  return (
    <div className="mx-auto flex flex-col gap-4 grow h-full">
      <FileBrowserDialog
        serverUuid={serverId}
        volumes={gameServer.volume_mounts}
        path={`/${path}`}
        canReadFiles={canReadFiles}
        canChangeFiles={canChangeFiles}
      />
    </div>
  );
}
