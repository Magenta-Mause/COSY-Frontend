import { createFileRoute } from "@tanstack/react-router";
import PublicDashboardSettingsSection from "@/components/display/GameServer/GameServerSettings/sections/PublicDashboardSettingsSection";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

export const Route = createFileRoute("/server/$serverId/settings/public-dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslationPrefix("serverPage");
  const { serverId } = Route.useParams();
  const { gameServer } = useGameServer(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("notFound")}</div>;
  }

  return <PublicDashboardSettingsSection gameServer={gameServer} />;
}
