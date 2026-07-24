import { Button } from "@/components/ui/button.tsx";
import Icon from "@/components/ui/Icon.tsx";
import { useRouter, useRouterState } from "@tanstack/react-router";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { UserEntityDtoRole } from "@/api/generated/model";
import marketPlaceSignAsset from "@/assets/header/marketPlaceSign.png";
import arrowBigRightIcon from "@/assets/icons/arrowBigRight.webp";
import { useRequireRoles } from "@/utils/routeGuards";

const MarketplaceSign = () => {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useTranslationPrefix("components.userManagement.userDetailButton");

  const hasAccess = useRequireRoles([UserEntityDtoRole.OWNER, UserEntityDtoRole.ADMIN]);

  if (!hasAccess || pathname !== "/") {
    return null;
  }

  return (
    <div
      className="fixed z-50 top-[10%] -right-4 flex items-end justify-center w-70"
      style={{
        backgroundImage: `url(${marketPlaceSignAsset})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }}
    >
      <div className="pt-15 pb-4 pl-3">
        <Button className="text-sm" size="sm" onClick={() => router.navigate({ to: "/users" })}>
          {t("viewUsers")}
          <Icon src={arrowBigRightIcon} className="size-5" />
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceSign;
