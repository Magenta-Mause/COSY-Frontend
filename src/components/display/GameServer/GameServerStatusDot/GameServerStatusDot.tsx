import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import { useTranslation } from "react-i18next";
import { GameServerDtoStatus } from "@/api/generated/model";
import { cn } from "@/lib/utils.ts";

const GAME_SERVER_STATUS_TO_COLOR: Record<GameServerDtoStatus, string> = {
  [GameServerDtoStatus.FAILED]: "bg-yellow-400",
  [GameServerDtoStatus.STOPPED]: "bg-red-400",
  [GameServerDtoStatus.RUNNING]: "bg-green-500",
  [GameServerDtoStatus.PULLING_IMAGE]: "bg-blue-400",
  [GameServerDtoStatus.AWAITING_UPDATE]: "bg-gray-400",
  [GameServerDtoStatus.STOPPING]: "bg-red-600",
};

export default function GameServerStatusDot(props: {
  status: GameServerDtoStatus;
  className?: string;
  showTooltip?: boolean;
  useScreenRelativeSizes?: boolean;
}) {
  const { t } = useTranslation();

  const dot = (
    <span
      className={cn(
        "rounded-full box-border",
        props.useScreenRelativeSizes ? "h-[0.9vw] w-[0.9vw] border-[0.11vw]" : "h-5 w-5 border-2",
        "border-button-primary-default shrink-0",
        GAME_SERVER_STATUS_TO_COLOR[props.status],
        props.className,
      )}
    />
  );

  if (!props.showTooltip) return dot;

  return (
    <TooltipWrapper tooltip={t(`serverStatus.${props.status}`)} side="top" asChild>
      {dot}
    </TooltipWrapper>
  );
}
