import { createFileRoute } from "@tanstack/react-router";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import AccessManagementSettingsSection from "@/components/display/GameServer/GameServerSettings/sections/AccessManagementSettingsSection";
import NoAccess from "@/components/display/NoAccess/NoAccess";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

export const Route = createFileRoute("/server/$serverId/settings/access-management")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { hasPermission } = useGameServerPermissions(serverId ?? "");
  const { t } = useTranslationPrefix("components.GameServerSettings.tabs");

  const canAccess = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.CHANGE_PERMISSIONS_SETTINGS,
  );

  if (!canAccess) {
    return <NoAccess element={t("accessManagement")} />;
  }

  return <AccessManagementSettingsSection />;
}
