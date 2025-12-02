import RightClickMenu from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import { DeleteGameServerAlertDialog } from "@components/display/GameServerConfiguration/DeleteGameServerAlertDialog.tsx";
import GameSign from "@components/display/GameServerConfiguration/GameSign/GameSign.tsx";
import Link from "@components/ui/Link.tsx";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { GameServerConfigurationEntity } from "@/api/generated/model";
import serverHouseImage from "@/assets/ai-generated/main-page/house.png";
import useBackendFunctionality from "@/hooks/useBackendFunctionality.tsx";
import { cn } from "@/lib/utils.ts";

const GameServerConfigurationHouse = (props: {
  gameServer: GameServerConfigurationEntity;
  className?: string;
  style?: CSSProperties;
}) => {
  const { t } = useTranslation();
  const { deleteGameServer } = useBackendFunctionality();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const actions = [
    {
      label: t("rightClickMenu.edit"),
      onClick: () => {
        toast.info(t("toasts.notImplemented"));
      },
    },
    {
      label: t("rightClickMenu.delete"),
      onClick: () => {
        setIsDeleteDialogOpen(true);
      },
      closeOnClick: false,
    },
  ];

  return (
    <>
      <RightClickMenu actions={actions}>
        <Link
          className={cn("block w-[14%] h-auto aspect-square select-none", props.className)}
          to={`/game-server-configuration/${props.gameServer.uuid}`}
          aria-label={t("aria.gameServerConfiguration", {
            serverName: props.gameServer.server_name,
          })}
          style={props.style}
        >
          <img
            alt={t("aria.gameServerConfiguration", {
              serverName: props.gameServer.server_name,
            })}
            className="w-full h-full object-cover"
            aria-label={t("aria.gameServerConfiguration", {
              serverName: props.gameServer.server_name,
            })}
            src={serverHouseImage}
          />
          <GameSign className="bottom-[-2%] right-[5%] w-[25%]" classNameTextChildren="!text-[.5vw]">
            {props.gameServer.server_name}
          </GameSign>
        </Link>
      </RightClickMenu>
      <DeleteGameServerAlertDialog
        serverName={props.gameServer.server_name ?? ""}
        onConfirm={() => deleteGameServer(props.gameServer.uuid ?? "")}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};

export default GameServerConfigurationHouse;
