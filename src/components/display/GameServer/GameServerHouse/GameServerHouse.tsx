import { useRouter } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { GameServerDto } from "@/api/generated/model";
import castle from "@/assets/MainPage/castle.png";
import house from "@/assets/MainPage/house.png";
import RightClickMenu, {
  type RightClickAction,
} from "@/components/display/Configurations/RightClickMenu/RightClickMenu.tsx";
import NameAndStatusBanner from "@/components/display/GameServer/NameAndStatusBanner/NameAndStatusBanner.tsx";
import Link from "@/components/ui/Link.tsx";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import { notificationModal } from "@/lib/notificationModal";
import { cn } from "@/lib/utils.ts";
import { GameServerDesign } from "@/types/gameServerDesign.ts";

const hashUUID = (uuid: string): number => {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const GameServerHouse = (props: {
  gameServer: GameServerDto;
  className?: string;
  style?: CSSProperties;
}) => {
  const { t } = useTranslation();
  const { startServer, stopServer } = useDataInteractions();
  const router = useRouter();

  const isHouse = useMemo(() => {
    if (props.gameServer.design !== undefined) {
      return props.gameServer.design === GameServerDesign.HOUSE;
    }
    const hash = hashUUID(props.gameServer.uuid);
    return hash % 2 === 0;
  }, [props.gameServer.uuid, props.gameServer.design]);

  const serverHouseImage = useMemo(() => {
    return {
      image: isHouse ? house : castle,
      size: isHouse ? "15vw" : "20vw",
      translate: isHouse ? "translate-y-[3.5vw] translate-x-[1.5vw]" : "",
    };
  }, [isHouse]);

  const handleClick = () => {
    const scrollContainer = document.querySelector("[data-scroll-container]");
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    sessionStorage.setItem("homeScrollPosition", scrollTop.toString());
  };

  const actions: RightClickAction[] = [
    ...(props.gameServer.status === "STOPPED" || props.gameServer.status === "FAILED"
      ? [
          {
            label: t("rightClickMenu.startServer"),
            onClick: async () => {
              try {
                notificationModal.info({
                  message: t("toasts.serverStarting"),
                });
                startServer(props.gameServer.uuid, true);
              } catch (e) {
                notificationModal.error({
                  message: t("toasts.serverStartError", { error: String(e) }),
                  cause: e,
                });
              }
            },
          },
        ]
      : props.gameServer.status === "RUNNING"
        ? [
            {
              label: t("rightClickMenu.stopServer"),
              onClick: async () => {
                try {
                  await stopServer(props.gameServer.uuid, true);
                } catch (e) {
                  notificationModal.error({
                    message: t("toasts.serverStopError", { error: String(e) }),
                    cause: e,
                  });
                }
              },
            },
          ]
        : props.gameServer.status === "AWAITING_UPDATE" ||
            props.gameServer.status === "PULLING_IMAGE" ||
            props.gameServer.status === "STOPPING"
          ? [
              {
                label: t("rightClickMenu.loading"),
                disabled: true,
              },
            ]
          : []),
    {
      label: t("rightClickMenu.viewLogs"),
      onClick: () => {
        handleClick();
        router.navigate({
          to: `/server/${props.gameServer.uuid}/console`,
        });
      },
    },
  ];

  return (
    <RightClickMenu actions={actions}>
      <Link
        className={cn(
          "block h-auto overflow-visible aspect-square select-none relative",
          serverHouseImage.translate,
          props.className,
        )}
        to={`/server/${props.gameServer.uuid}`}
        data-testid="server-house"
        aria-label={t("aria.gameServer", {
          serverName: props.gameServer.server_name,
        })}
        style={{
          ...props.style,
          width: serverHouseImage.size,
          height: serverHouseImage.size,
        }}
        onClick={handleClick}
        preload={"viewport"}
      >
        <NameAndStatusBanner
          className={
            isHouse
              ? "absolute -translate-y-[1.1vw] whitespace-nowrap z-10"
              : "absolute translate-x-[1.55vw] translate-y-[2.6vw] whitespace-nowrap z-10"
          }
          classNameTextChildren={"-translate-y-[1.1vw]"}
          status={props.gameServer.status}
        >
          {props.gameServer.server_name}
        </NameAndStatusBanner>
        <img
          alt={t("aria.gameServer", {
            serverName: props.gameServer.server_name,
          })}
          className="w-full h-full object-contain overflow-visible flex items-center justify-center"
          style={{
            imageRendering: "pixelated",
          }}
          src={serverHouseImage.image}
        />
      </Link>
    </RightClickMenu>
  );
};

export default GameServerHouse;
