import { useNavigate } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import type { GameServerDto } from "@/api/generated/model";
import globeIcon from "@/assets/icons/globe.webp";
import globePrivateIcon from "@/assets/icons/globePrivate.webp";
import GameServerStartStopButton from "@/components/display/GameServer/GameServerStartStopButton/GameServerStartStopButton.tsx";
import GameServerStatusIndicator from "@/components/display/GameServer/GameServerStatusIndicator/GameServerStatusIndicator.tsx";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils.ts";

const DashboardViewToggle = (props: {
  gameServer: GameServerDto;
  currentView: "private" | "public";
  buttonVariant?: "primary" | "secondary";
}) => {
  const navigate = useNavigate();
  const { t } = useTranslationPrefix("dashboard");
  const isPublic = props.currentView === "public";

  const toggle = () => {
    navigate({
      to: "/server/$serverId",
      params: { serverId: props.gameServer.uuid },
      search: isPublic ? {} : { view: "public" },
    });
  };

  return (
    <TooltipWrapper tooltip={isPublic ? t("hidePublicDashboard") : t("showPublicDashboard")}>
      <Button
        variant={isPublic ? (props.buttonVariant ?? "primary") : "secondary"}
        size="icon-sm"
        onClick={toggle}
        className="self-center"
        style={{ height: "2.5rem", width: "2.5rem" }}
      >
        {isPublic ? (
          <Icon src={globeIcon} variant="foreground" className="size-6" />
        ) : (
          <Icon src={globePrivateIcon} variant="foreground" className="size-6" />
        )}
      </Button>
    </TooltipWrapper>
  );
};

const GameServerDetailPageHeader = (props: {
  gameServer: GameServerDto;
  className?: string;
  style?: CSSProperties;
  buttonVariant?: "primary" | "secondary";
  hideStartButton?: boolean;
  dashboardView?: "private" | "public";
}) => {
  return (
    <div className={cn("text-foreground", props.className)} style={props.style}>
      <div
        className={
          "flex align-bottom items-end gap-[2vw] border-b-4 border-foreground py-1.25 justify-between w-full"
        }
      >
        <div className={"flex items-end gap-4 min-w-0"}>
          {props.dashboardView && props.gameServer.public_dashboard?.enabled && (
            <DashboardViewToggle
              gameServer={props.gameServer}
              currentView={props.dashboardView}
              buttonVariant={props.buttonVariant}
            />
          )}
          <div className={"text-2xl truncate text-ellipsis max-w-[45vw] leading-none"}>
            {props.gameServer.server_name}
          </div>
        </div>
        <div className={"flex gap-5 items-center"}>
          <GameServerStatusIndicator gameServer={props.gameServer} />
          {!props.hideStartButton && (
            <GameServerStartStopButton
              gameServer={props.gameServer}
              buttonVariant={props.buttonVariant}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameServerDetailPageHeader;
