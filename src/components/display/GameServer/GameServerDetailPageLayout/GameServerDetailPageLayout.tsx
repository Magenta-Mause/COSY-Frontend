import "./gameServerDetailPageLayout.css";
import LanguageSelector from "@components/display/Configurations/OptionsBannerDropdown/LanguageSelector/LanguageSelector.tsx";
import LogOutButton from "@components/display/Configurations/OptionsBannerDropdown/LogOutButton/LogOutButton.tsx";
import UserMenuButton from "@components/display/Configurations/OptionsBannerDropdown/UserMenuButton/UserMenuButton.tsx";
import BackToHomeLink from "@components/display/GameServer/GameServerDetailPageLayout/BackToHomeLink.tsx";
import FancyNavigationButton from "@components/display/GameServer/GameServerDetailPageLayout/FancyNavigationButton.tsx";
import GameServerDetailPageHeader from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageHeader/GameServerDetailPageHeader.tsx";
import GameServerStartStopButton from "@components/display/GameServer/GameServerStartStopButton/GameServerStartStopButton.tsx";
import GameServerStatusIndicator from "@components/display/GameServer/GameServerStatusIndicator/GameServerStatusIndicator.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Button } from "@components/ui/button.tsx";
import Icon from "@components/ui/Icon.tsx";
import Link from "@components/ui/Link.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useLocation, useSearch } from "@tanstack/react-router";
import type * as React from "react";
import { type CSSProperties, cloneElement, createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import { GameServerAccessGroupDtoPermissionsItem, type GameServerDto } from "@/api/generated/model";
import dashboardBackgroundImage from "@/assets/gameServerDetailPage/dashboard-bg.webp";
import dashboardForegroundImage from "@/assets/gameServerDetailPage/dashboard-fg.webp";
import filesBackgroundImage from "@/assets/gameServerDetailPage/files-bg.webp";
import logsMetricsBackgroundImage from "@/assets/gameServerDetailPage/logs-metrics-bg.webp";
import logsMetricsForegroundImage from "@/assets/gameServerDetailPage/logs-metrics-fg.webp";
import settingsBackgroundImage from "@/assets/gameServerDetailPage/settings-bg.webp";
import settingsForegroundImage from "@/assets/gameServerDetailPage/settings-fg.webp";
import consoleIcon from "@/assets/icons/console.webp";
import doorClosedIcon from "@/assets/icons/doorClosed.webp";
import dotsIcon from "@/assets/icons/dots.webp";
import folderIcon from "@/assets/icons/folder.webp";
import houseIcon from "@/assets/icons/house.webp";
import chartIcon from "@/assets/icons/metrics.webp";
import settingsIcon from "@/assets/icons/settings.webp";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions.tsx";
import useIsDesktop, { useIsUltraWide } from "@/hooks/useIsDesktop/useIsDesktop.tsx";
import { cn } from "@/lib/utils.ts";

interface Tab {
  label: string;
  icon: React.ReactNode;
  path: string;
  activePathPattern?: RegExp;
  permissions?: GameServerAccessGroupDtoPermissionsItem[];
  background: string;
  foreground?: string;
  foregroundColor: string;
  buttonVariant?: "primary" | "secondary";
  sideBarButtonVariant?: "primary" | "secondary";
}

const TABS: Tab[] = [
  {
    label: "overview",
    icon: <Icon src={houseIcon} variant="secondary" className="scale-[1.4]" />,
    path: "/server/$serverId",
    background: dashboardBackgroundImage,
    foreground: dashboardForegroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
    sideBarButtonVariant: "secondary",
  },
  {
    label: "console",
    icon: <Icon src={consoleIcon} variant="secondary" className="scale-[1.4]" />,
    path: "/server/$serverId/console",
    permissions: [
      GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS,
      GameServerAccessGroupDtoPermissionsItem.SEND_COMMANDS,
    ],
    background: logsMetricsBackgroundImage,
    foreground: logsMetricsForegroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
    sideBarButtonVariant: "secondary",
  },
  {
    label: "metrics",
    icon: <Icon src={chartIcon} variant="secondary" className="scale-[1.4]" />,
    path: "/server/$serverId/metrics",
    permissions: [GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS],
    background: logsMetricsBackgroundImage,
    foreground: logsMetricsForegroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
    sideBarButtonVariant: "secondary",
  },
  {
    label: "file_explorer",
    icon: <Icon src={folderIcon} variant="secondary" className="scale-[1.4]" />,
    path: "/server/$serverId/files",
    activePathPattern: /\/server\/.*\/files/,
    permissions: [
      GameServerAccessGroupDtoPermissionsItem.READ_SERVER_SERVER_FILES,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_FILES,
    ],
    background: filesBackgroundImage,
    foregroundColor: "var(--button-primary-default)",
    buttonVariant: "primary",
    sideBarButtonVariant: "secondary",
  },
  {
    label: "settings",
    icon: <Icon src={settingsIcon} variant="secondary" className="scale-[1.4]" />,
    path: "/server/$serverId/settings/general",
    activePathPattern: /\/server\/.*\/settings/,
    permissions: [
      GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_CONFIGS,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_PERMISSIONS_SETTINGS,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_METRICS_SETTINGS,
      GameServerAccessGroupDtoPermissionsItem.CHANGE_RCON_SETTINGS,
    ],
    background: settingsBackgroundImage,
    foreground: settingsForegroundImage,
    foregroundColor: "var(--button-secondary-default)",
    buttonVariant: "secondary",
    sideBarButtonVariant: "secondary",
  },
];

function getActiveTab(pathname: string): Tab {
  // Tabs with an explicit regex pattern take priority
  const patternMatch = TABS.find((tab) => tab.activePathPattern?.test(pathname));
  if (patternMatch) return patternMatch;

  // For the rest, build an exact-match regex from the TanStack Router path
  // e.g. "/server/$serverId/console" → /^\/server\/[^/]+\/console$/
  const exactMatch = TABS.find((tab) => {
    const regexStr = tab.path.replace(/\$[^/]+/g, "[^/]+").replace(/\//g, "\\/");
    return new RegExp(`^${regexStr}$`).test(pathname);
  });
  return exactMatch ?? TABS[0];
}

interface GameServerDetailContext {
  gameServer: GameServerDto;
}

const GameServerDetailContext = createContext<GameServerDetailContext>({
  gameServer: {} as GameServerDto,
});

const GameServerDetailPageLayout = (props: {
  gameServer: GameServerDto;
  children: React.ReactNode;
}) => {
  const location = useLocation();

  const search = useSearch({ strict: false }) as { view?: string };
  const { hasPermission } = useGameServerPermissions(props.gameServer.uuid);
  const activeTab = getActiveTab(location.pathname);
  const isOnDashboard = activeTab.label === "overview";
  const canSeePrivateDashboard = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.READ_SERVER_PRIVATE_DASHBOARD,
  );
  const dashboardView =
    isOnDashboard && canSeePrivateDashboard
      ? search.view === "public"
        ? "public"
        : "private"
      : undefined;

  const isDesktop = useIsDesktop();
  const isUltraWide = useIsUltraWide();

  return (
    <GameServerDetailContext.Provider value={{ gameServer: props.gameServer }}>
      {isDesktop ? (
        /* Desktop layout */
        <div className="w-screen h-screen bg-red relative overflow-hidden">
          {/* Layer 1: cover-sized background + content */}
          <div
            className={cn(
              "game-server-bg absolute left-1/2 top-1/2 flex",
              !isUltraWide && "-translate-x-1/2 -translate-y-[50%]",
            )}
            style={
              {
                width: "max(100vw, 100vh * 640 / 368)",
                height: "max(100vh, 100vw * 368 / 640)",
                backgroundImage: `url(${activeTab.background})`,
                "--foreground-image": `url(${activeTab.foreground})`,
                imageRendering: "pixelated",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                /*
                 * On ultra-wide (aspect > 2.147) the bg div is taller than the viewport,
                 * so centering it clips the header. We shift the entire div (bg + content
                 * together) down so the header sits at the viewport top.
                 *
                 * shift = (groupHeight − viewportH) / 2, where groupH ≈ 4.0625rem + 43.8vw:
                 *   header 4.0625rem + margin 1.7vw + content 80% × 241/514 (≈ 37.5vw) + footer 8% of bgH (≈ 4.6vw)
                 * → translateY = −50% + 2.03rem + 21.9vw − 50vh
                 */
                ...(isUltraWide && { translate: "-50% calc(-50% + 2.03rem + 21.9vw - 50vh)" }),
              } as React.CSSProperties
            }
          >
            <div className="w-[10%] shrink-0" />
            <div className="grow flex flex-col min-w-0 relative z-10 h-auto justify-center">
              <GameServerDetailPageHeader
                gameServer={props.gameServer}
                className={"h-16.25 overflow-y-hidden flex justify-end mb-[1.7vw]"}
                style={
                  {
                    "--foreground": activeTab.foregroundColor,
                  } as CSSProperties
                }
                buttonVariant={activeTab.buttonVariant}
                hideStartButton={!hasPermission(GameServerAccessGroupDtoPermissionsItem.SEE_SERVER)}
                dashboardView={dashboardView}
              />
              <div className={"overflow-y-auto h-auto w-full aspect-514/241 bg-background"}>
                {props.children}
              </div>
              <div
                id={"lowerCenterPlaceholder"}
                className={"h-16.5 overflow-y-auto mt-[1.7vw]"}
              ></div>
            </div>
            <div className="w-[10%] shrink-0" />
          </div>

          {/* Layer 2: navigation at viewport edges */}
          <div className="absolute inset-0 z-30 flex pointer-events-none">
            <div
              id={"gameServerDetailPage:exitButton"}
              className={"flex h-25 items-end w-[10%] shrink-0 pointer-events-auto"}
            >
              <BackToHomeLink variant={activeTab.sideBarButtonVariant} />
            </div>
            <div className="grow" />
            <div className="flex flex-col justify-center items-end w-[10%] shrink-0 h-full pointer-events-none">
              <SideBar
                gameServer={props.gameServer}
                buttonVariant={activeTab.sideBarButtonVariant}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Mobile layout */
        <div className="flex flex-col h-screen bg-background">
          {/* Header: back button + server name + status + start/stop */}
          <div className="flex items-center gap-2 p-3 border-b-4 border-foreground">
            <Link to="/" className="shrink-0">
              <Button variant="secondary" size="icon-sm">
                <Icon src={doorClosedIcon} variant="foreground" className="size-6" />
              </Button>
            </Link>
            <div className="truncate text-lg font-bold">{props.gameServer.server_name}</div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <GameServerStatusIndicator gameServer={props.gameServer} />
              <GameServerStartStopButton gameServer={props.gameServer} />
            </div>
          </div>

          {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto p-2">{props.children}</div>

          {/* Bottom tab bar */}
          <MobileTabBar gameServer={props.gameServer} />
        </div>
      )}
    </GameServerDetailContext.Provider>
  );
};

const MobileTabBar = (props: { gameServer: GameServerDto }) => {
  const { hasPermission } = useGameServerPermissions(props.gameServer.uuid);
  const { authorized } = useContext(AuthContext);
  const { t } = useTranslation();
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);

  return (
    <div className="flex border-t-4 border-foreground bg-background shrink-0">
      {TABS.map((tab) => {
        const isReachable = tab.permissions ? tab.permissions.some((p) => hasPermission(p)) : true;
        const isActive = tab === activeTab;

        return (
          <Link
            key={tab.label}
            to={tab.path}
            disabled={!isReachable}
            className="flex-1 flex flex-col items-center py-2 gap-1"
          >
            <div
              className={cn(
                "p-2 rounded-md",
                isActive && "bg-button-primary-active text-white",
                !isReachable && "opacity-50",
              )}
            >
              {isActive
                ? cloneElement(tab.icon as React.ReactElement<{ variant: string }>, {
                    variant: "primary",
                  })
                : tab.icon}
            </div>
          </Link>
        );
      })}
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="flex-1 flex flex-col items-center py-2 gap-1">
            <div className="p-2 rounded-md">
              <Icon src={dotsIcon} variant="secondary" />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="z-40 flex flex-col gap-2 p-2 w-auto">
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <span className="text-sm">{t("optionsBanner.languageSelector")}</span>
          </div>
          {authorized && (
            <>
              <div className="flex items-center gap-2">
                <UserMenuButton />
                <span className="text-sm">{t("optionsBanner.userMenu")}</span>
              </div>
              <div className="flex items-center gap-2">
                <LogOutButton />
                <span className="text-sm">{t("optionsBanner.logout")}</span>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const SideBar = (props: { gameServer: GameServerDto; buttonVariant?: "primary" | "secondary" }) => {
  const { hasPermission } = useGameServerPermissions(props.gameServer.uuid);
  const { t } = useTranslation();
  const location = useLocation();

  return TABS.map(({ label, icon, path, activePathPattern, permissions }) => {
    const isLinkReachable = permissions ? permissions.some((perm) => hasPermission(perm)) : true;

    return (
      <div key={`${label}:${path}`} className={"relative"}>
        <Link
          key={label}
          to={path}
          activeOptions={{ exact: !activePathPattern }}
          className={
            "group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 pointer-events-auto"
          }
          preload={"viewport"}
          disabled={!isLinkReachable}
        >
          {({ isActive }) => (
            <TooltipWrapper
              tooltip={
                !isLinkReachable
                  ? t("serverPage.noAccessFor", {
                      element: t(`serverPage.navbar.${label}`),
                    })
                  : null
              }
              side={"left"}
              align="center"
            >
              <FancyNavigationButton
                isActive={activePathPattern ? activePathPattern.test(location.pathname) : isActive}
                label={t(`serverPage.navbar.${label}`)}
                data-testid={`server-tab-${label}`}
                disabled={!isLinkReachable}
                variant={props.buttonVariant}
              >
                {icon}
              </FancyNavigationButton>
            </TooltipWrapper>
          )}
        </Link>
      </div>
    );
  });
};

export default GameServerDetailPageLayout;
export { GameServerDetailContext };
