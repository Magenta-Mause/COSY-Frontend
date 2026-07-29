import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import MetricsSettingsSection from "@/components/display/GameServer/GameServerSettings/sections/MetricsSettingsSection";
import NoAccess from "@/components/display/NoAccess/NoAccess";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

export const Route = createFileRoute("/server/$serverId/settings/metrics")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const { gameServer } = useGameServer(serverId ?? "");
  const { hasPermission } = useGameServerPermissions(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  const canAccess = hasPermission(GameServerAccessGroupDtoPermissionsItem.CHANGE_METRICS_SETTINGS);

  if (!canAccess) {
    return <NoAccess element={t("components.GameServerSettings.tabs.metrics")} />;
  }

  return <MetricsSettingsSection gameServer={gameServer} />;
}
