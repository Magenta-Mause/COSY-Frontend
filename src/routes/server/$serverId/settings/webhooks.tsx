import WebhooksSettingsSection from "@/components/display/GameServer/GameServerSettings/sections/WebhooksSettingsSection/WebhooksSettingsSection.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/webhooks")({
  component: RouteComponent,
});

function RouteComponent() {
  return <WebhooksSettingsSection />;
}
