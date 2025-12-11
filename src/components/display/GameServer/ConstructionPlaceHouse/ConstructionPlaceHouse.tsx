import CreateGameServer from "@components/CreateGameServer/CreateGameServer";
import RightClickMenu, {
  type RightClickAction,
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import { Link } from "@tanstack/react-router";
import { type CSSProperties, useState } from "react";
import { useTranslation } from "react-i18next";
import constructionImage from "@/assets/ai-generated/main-page/construction.png";
import { cn } from "@/lib/utils.ts";
import GameSign from "../GameSign/GameSign";

const ConstructionPlaceHouse = (props: { className?: string; style?: CSSProperties }) => {
  const { t } = useTranslation();

  const [openGameServerCreationModal, setOpenGameServerCreationModal] = useState(false);

  const actions: RightClickAction[] = [
    {
      label: t("rightClickMenu.createNewGameserver"),
      onClick: () => {
        setOpenGameServerCreationModal(true);
      },
    },
  ];

  return (
    <RightClickMenu actions={actions}>
      <div>
        <CreateGameServer
          openModal={openGameServerCreationModal}
          setOpenModal={setOpenGameServerCreationModal}
        />
        <Link
          className={cn(
            "block w-[28%] h-auto overflow-visible translate-x-[-7.8vw] translate-y-[2vw] aspect-[2.18] text-xs relative select-none",
            props.className,
          )}
          aria-label={t("aria.createNewGameServer")}
          to={"/"}
          style={props.style}
          onClick={() => setOpenGameServerCreationModal((open) => !open)}
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
      </div>
    </RightClickMenu>
  );
};

export default ConstructionPlaceHouse;
