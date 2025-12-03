import RightClickMenu, {
  type RightClickAction,
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import GameSign from "@components/display/GameServerConfiguration/GameSign/GameSign.tsx";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import constructionImage from "@/assets/ai-generated/main-page/construction.png";
import { cn } from "@/lib/utils.ts";

const ConstructionPlaceHouse = (props: { className?: string; style?: CSSProperties }) => {
  const { t } = useTranslation();
  const actions: RightClickAction[] = [
    {
      label: t("rightClickMenu.createNewGameserver"),
      onClick: () => {
        toast.info(t("toasts.notImplemented"));
      },
    },
  ];

  return (
    <RightClickMenu actions={actions}>
      <Link
        className={cn(
          "block w-[28%] h-auto overflow-visible translate-x-[-7.8vw] translate-y-[2vw] aspect-[2.18] text-xs relative select-none",
          props.className,
        )}
        aria-label={t("aria.createNewGameServer")}
        to={"/"}
        style={props.style}
      >
        <img
          className="h-full object-cover max-w-[initial] absolute top-0 left-0"
          aria-label={t("aria.createNewGameServer")}
          src={constructionImage}
        />
        <GameSign className="bottom-[5%] right-[22%] w-[15%]">
          {t("overviewPage.createNewServer")}
        </GameSign>
      </Link>
    </RightClickMenu>
  );
};

export default ConstructionPlaceHouse;
