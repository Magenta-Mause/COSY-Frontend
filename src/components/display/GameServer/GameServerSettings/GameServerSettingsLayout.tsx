import { createContext, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import consoleIcon from "@/assets/icons/console.webp";
import dashboardIcon from "@/assets/icons/dashboard.webp";
import houseIcon from "@/assets/icons/house.webp";
import metricsIcon from "@/assets/icons/metrics.webp";
import settingsIcon from "@/assets/icons/settings.webp";
import userIcon from "@/assets/icons/user.webp";
import webhookIcon from "@/assets/icons/webhook.webp";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon.tsx";
import Link from "@/components/ui/Link";
import { Separator } from "@/components/ui/separator.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils.ts";

interface ServerSettingsState {
  serverName: string;
}

interface SettingsContextType {
  settings: ServerSettingsState;
  setSettings: <K extends keyof ServerSettingsState>(
    ServerSettingsStateKey: K,
  ) => (value: ServerSettingsState[K]) => void;
}

const SettingsProvider = createContext<SettingsContextType>({
  settings: { serverName: "" },
  setSettings: () => () => {},
});

interface GameServerSettingsProps {
  initialSettings: ServerSettingsState;
  serverUuid: string;
  children: React.ReactNode;
}

const GameServerSettingsLayout = ({
  initialSettings,
  serverUuid,
  children,
}: GameServerSettingsProps) => {
  const [serverSettings, setServerSettings] = useState<ServerSettingsState>(initialSettings);

  const { t } = useTranslationPrefix("components.GameServerSettings");
  const { t: tGlobal } = useTranslation();
  const { hasPermission } = useGameServerPermissions(serverUuid);

  const TABS = [
    {
      label: t("tabs.general"),
      icon: <Icon src={settingsIcon} className="mr-2" />,
      path: "/server/$serverId/settings/general",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_CONFIGS],
    },
    {
      label: t("tabs.design"),
      icon: <Icon src={houseIcon} className="mr-2" />,
      path: "/server/$serverId/settings/design",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_CONFIGS],
    },
    {
      label: t("tabs.privateDashboard"),
      icon: <Icon src={dashboardIcon} className="mr-2" />,
      path: "/server/$serverId/settings/private-dashboard",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_PRIVATE_DASHBOARD_SETTINGS],
    },
    {
      label: t("tabs.publicDashboard"),
      icon: <Icon src={dashboardIcon} className="mr-2" />,
      path: "/server/$serverId/settings/public-dashboard",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_PUBLIC_DASHBOARD_SETTINGS],
    },
    {
      label: t("tabs.rcon"),
      icon: <Icon src={consoleIcon} className="mr-2" />,
      path: "/server/$serverId/settings/rcon",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_RCON_SETTINGS],
    },
    {
      label: t("tabs.metrics"),
      icon: <Icon src={metricsIcon} className="mr-2" />,
      path: "/server/$serverId/settings/metrics",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_METRICS_SETTINGS],
    },
    {
      label: t("tabs.webhooks"),
      icon: <Icon src={webhookIcon} className="mr-2" />,
      path: "/server/$serverId/settings/webhooks",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_WEBHOOK_SETTINGS],
    },
    {
      label: t("tabs.accessManagement"),
      icon: <Icon src={userIcon} className="mr-2" />,
      path: "/server/$serverId/settings/access-management",
      permissions: [GameServerAccessGroupDtoPermissionsItem.CHANGE_PERMISSIONS_SETTINGS],
    },
  ];

  const setSettings: SettingsContextType["setSettings"] = useCallback(
    (settingsKey) => (newValue) => {
      setServerSettings((prevSettings) => ({
        ...prevSettings,
        [settingsKey]: newValue,
      }));
    },
    [],
  );

  return (
    <SettingsProvider.Provider value={{ settings: serverSettings, setSettings }}>
      <div className="flex gap-2 h-full overflow-visible">
        <div className="flex flex-col justify-center items-end w-[20%] min-w-0 align-top h-fit pl-4 pt-4">
          {TABS.map(({ label, icon, path, permissions }) => {
            const isLinkReachable = permissions
              ? permissions.some((perm) => hasPermission(perm))
              : true;

            return (
              <div key={`${label}:${path}`} className={"relative w-full py-0.5"}>
                <Link
                  key={label}
                  to={path}
                  activeOptions={{ exact: true, includeSearch: false }}
                  className={"group w-full"}
                  tabIndex={-1}
                  disabled={!isLinkReachable}
                >
                  {({ isActive }) => (
                    <TooltipWrapper
                      tooltip={
                        !isLinkReachable
                          ? tGlobal("settings.noAccessFor", {
                              element: label,
                            })
                          : label
                      }
                      side={"right"}
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        className={cn(
                          "w-full min-w-0 flex justify-start border-0 shadow-none bg-button-primary-default",
                          isActive && "bg-button-primary-active hover:bg-button-primary-active/80",
                          !isLinkReachable && "cursor-not-allowed opacity-50",
                        )}
                        disabled={!isLinkReachable}
                      >
                        {icon}
                        <span className="truncate text-left">{label}</span>
                      </Button>
                    </TooltipWrapper>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
        <div className={"p-4 h-auto overflow-hidden"}>
          <Separator className=" w-0.5! h-full!" orientation="vertical" />
        </div>
        <div className="w-full max-w-full h-full overflow-y-auto pt-8 pr-5 [&>*]:min-h-full">
          {children}
        </div>
      </div>
    </SettingsProvider.Provider>
  );
};

export default GameServerSettingsLayout;
export { type ServerSettingsState, SettingsProvider };
