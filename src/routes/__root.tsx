import GameServerOverviewPageRightClickHandler from "@/components/display/Configurations/GameServerOverviewPageRightClickHandler/GameServerOverviewPageRightClickHandler.tsx";
import OptionsBannerDropdown from "@/components/display/Configurations/OptionsBannerDropdown/OptionsBannerDropdown.tsx";
import { GameServerNotFoundPage } from "@/components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage.tsx";
import MarketplaceSign from "@/components/display/header/MarketplaceSign/MarketplaceSign.tsx";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useContext } from "react";
import useIsDesktop from "@/hooks/useIsDesktop/useIsDesktop.tsx";

const RootLayout = () => {
  const { authorized } = useContext(AuthContext);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDesktop = useIsDesktop();

  const showNotFound = authorized === false && pathname !== "/" && !pathname.startsWith("/server");
  const isServerPage = pathname.startsWith("/server/");

  return (
    <GameServerOverviewPageRightClickHandler>
      <div>
        <div className={isServerPage && !isDesktop ? "hidden" : undefined}>
          <OptionsBannerDropdown />
          <MarketplaceSign />
        </div>
        {showNotFound ? <GameServerNotFoundPage /> : <Outlet />}
      </div>
    </GameServerOverviewPageRightClickHandler>
  );
};

export const Route = createRootRoute({ component: RootLayout });
