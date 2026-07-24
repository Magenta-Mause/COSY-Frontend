import PrivateDashboardSettingsSection from "@/components/display/GameServer/GameServerSettings/sections/PrivateDashboardSetting/PrivateDashboardSettingsSection";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer";

export const Route = createFileRoute("/server/$serverId/settings/private-dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const { gameServer } = useGameServer(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return <PrivateDashboardSettingsSection gameServer={gameServer} />;
}
