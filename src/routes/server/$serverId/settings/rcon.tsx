import RconSettingsSection from "@/components/display/GameServer/GameServerSettings/sections/RconSettingsSection/RconSettingsSection.tsx";
import NoAccess from "@/components/display/NoAccess/NoAccess";
import { createFileRoute } from "@tanstack/react-router";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

export const Route = createFileRoute("/server/$serverId/settings/rcon")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { hasPermission } = useGameServerPermissions(serverId ?? "");
  const { t } = useTranslationPrefix("components.GameServerSettings.tabs");

  const canAccess = hasPermission(GameServerAccessGroupDtoPermissionsItem.CHANGE_RCON_SETTINGS);

  if (!canAccess) {
    return <NoAccess element={t("rcon")} />;
  }

  return <RconSettingsSection />;
}
