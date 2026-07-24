import GeneralSettingsSection from "@/components/display/GameServer/GameServerSettings/sections/GeneralSettingsSection";
import NoAccess from "@/components/display/NoAccess/NoAccess";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

export const Route = createFileRoute("/server/$serverId/settings/general")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { hasPermission } = useGameServerPermissions(serverId ?? "");
  const { t } = useTranslation();

  const canAccess = hasPermission(GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_CONFIGS);

  if (!canAccess) {
    return <NoAccess element={t("components.GameServerSettings.tabs.general")} />;
  }

  return <GeneralSettingsSection />;
}
