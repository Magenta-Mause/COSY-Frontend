import { Link } from "@tanstack/react-router";
import { type CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
import constructionImage from "@/assets/MainPage/construction_place.png";
import RightClickMenu, {
  type RightClickAction,
} from "@/components/display/Configurations/RightClickMenu/RightClickMenu.tsx";
import CreateGameServer from "@/components/display/GameServer/CreateGameServer/CreateGameServer";
import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import { cn } from "@/lib/utils.ts";

const ConstructionPlaceHouse = (props: { className?: string; style?: CSSProperties }) => {
  const { t } = useTranslation();

  const [isGameServerCreationModalOpen, setIsOpenGameServerCreationModalOpen] = useState(false);

  const actions: RightClickAction[] = [
    {
      label: t("rightClickMenu.createNewGameServer"),
      onClick: () => {
        setIsOpenGameServerCreationModalOpen(true);
      },
    },
  ];

  return (
    <RightClickMenu actions={actions}>
      <div>
        <CreateGameServer
          isModalOpen={isGameServerCreationModalOpen}
          setIsModalOpen={setIsOpenGameServerCreationModalOpen}
        />
        <TooltipWrapper
          tooltip={t("rightClickMenu.createNewGameServer")}
          side="bottom"
          contentClassName="text-base -translate-x-[1.4vw]"
          asChild
        >
          <Link
            className={cn(
              "block h-auto -translate-x-[4vw] translate-y-[7vw] aspect-[2.18] text-xs relative select-none",
              props.className,
            )}
            aria-label={t("aria.createNewGameServer")}
            data-testid="create-server-plot"
            to={"/"}
            style={{
              ...props.style,
              height: "11vw",
            }}
            onClick={() => setIsOpenGameServerCreationModalOpen((open) => !open)}
          >
            <img
              className="h-full object-contain max-w-[initial] absolute top-0 left-0"
              alt=""
              src={constructionImage}
              style={{ imageRendering: "pixelated" }}
            />
          </Link>
        </TooltipWrapper>
      </div>
    </RightClickMenu>
  );
};

export default ConstructionPlaceHouse;
