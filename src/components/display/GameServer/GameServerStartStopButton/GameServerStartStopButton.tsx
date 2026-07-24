import { Button } from "@components/ui/button.tsx";
import Icon from "@components/ui/Icon.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import { useTranslation } from "react-i18next";
import {
  GameServerAccessGroupDtoPermissionsItem,
  type GameServerDto,
  GameServerDtoStatus,
} from "@/api/generated/model";
import powerIcon from "@/assets/icons/power.webp";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

const GameServerStartStopButton = (props: {
  gameServer: GameServerDto;
  buttonVariant?: "primary" | "secondary";
}) => {
  const { t } = useTranslation();
  const { stopServer, startServer } = useDataInteractions();
  const { hasPermission } = useGameServerPermissions(props.gameServer.uuid);

  const canStartStopServer = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.START_STOP_SERVER,
  );

  const icon = <Icon src={powerIcon} variant={props.buttonVariant} className="size-5" />;

  const buttonProps: React.ComponentProps<"button"> = (() => {
    switch (props.gameServer.status) {
      case GameServerDtoStatus.RUNNING:
        return {
          onClick: () => stopServer(props.gameServer.uuid),
          disabled: !canStartStopServer,
          children: (
            <>
              {icon}
              {t("serverPage.stop")}
            </>
          ),
        };
      case GameServerDtoStatus.STOPPED:
      case GameServerDtoStatus.FAILED:
        return {
          onClick: () => startServer(props.gameServer.uuid),
          disabled: !canStartStopServer,
          children: (
            <>
              {icon}
              {t("serverPage.start")}
            </>
          ),
        };
      case GameServerDtoStatus.PULLING_IMAGE:
        return {
          disabled: true,
          "data-loading": true,
          children: t(`serverStatus.PULLING_IMAGE`),
        };
      case GameServerDtoStatus.AWAITING_UPDATE:
        return {
          disabled: true,
          "data-loading": true,
          children: (
            <>
              {icon}
              {t("serverStatus.AWAITING_UPDATE")}
            </>
          ),
        };
      case GameServerDtoStatus.STOPPING:
        return {
          disabled: true,
          "data-loading": true,
          children: (
            <>
              {icon}
              {t("serverStatus.STOPPING")}
            </>
          ),
        };
      default:
        return {};
    }
  })();

  const isLoadingState =
    props.gameServer.status === GameServerDtoStatus.PULLING_IMAGE ||
    props.gameServer.status === GameServerDtoStatus.AWAITING_UPDATE ||
    props.gameServer.status === GameServerDtoStatus.STOPPING;

  const showTooltip = !canStartStopServer && !isLoadingState;

  return (
    <TooltipWrapper
      tooltip={showTooltip ? t("serverPage.noStartStopPermission") : null}
      side="bottom"
      align="center"
    >
      <Button
        {...buttonProps}
        data-testid="server-start-stop-btn"
        className="transition-all duration-300"
        variant={props.buttonVariant ?? "primary"}
      />
    </TooltipWrapper>
  );
};

export default GameServerStartStopButton;
