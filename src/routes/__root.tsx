import LanguageSelector from "@components/display/configurations/LanguageSelector/LanguageSelector.tsx";
import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => {
  return (
    <>
      <LanguageSelector className={"absolute z-100 top-0 right-0 mx-[2vw] my-[1vw]"} />
      <Outlet />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
