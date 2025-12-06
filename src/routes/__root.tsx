import GameServerOverviewPageRightClickHandler from "@components/display/configurations/GameServerOverviewPageRightClickHandler/GameServerOverviewPageRightClickHandler.tsx";
import HeaderButtonGroup from "@components/display/configurations/HeaderButtonGroup/HeaderButtonGroup.tsx";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => {
  return (
    <GameServerOverviewPageRightClickHandler>
      <div>
        <HeaderButtonGroup className={"absolute z-50 top-0 right-0 mx-[2vw] my-[1vw]"} />
        <Outlet />
      </div>
    </GameServerOverviewPageRightClickHandler>
  );
};

export const Route = createRootRoute({ component: RootLayout });
