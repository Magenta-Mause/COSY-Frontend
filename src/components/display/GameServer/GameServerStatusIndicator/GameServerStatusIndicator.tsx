import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import type { ReactNode } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { type GameServerDto, GameServerDtoStatus } from "@/api/generated/model";
import { useAppSelector } from "@/stores/hooks.ts";
import GameServerStatusDot from "../GameServerStatusDot/GameServerStatusDot.tsx";

const COMPLETED_STATUSES = new Set(["Pull complete", "Already exists", "Download complete"]);

const GameServerStatusIndicator = (props: {
  gameServer: GameServerDto;
  useScreenRelativeSizes?: boolean;
}) => {
  const { t } = useTranslationPrefix("serverStatus");
  const status = props.gameServer.status ?? GameServerDtoStatus.STOPPED;
  const pullProgressMap = useAppSelector((state) => state.gameServerSliceReducer.pullProgress);

  let buttonLabel: ReactNode = t(status);
  let tooltipContent: ReactNode = null;

  if (status === GameServerDtoStatus.PULLING_IMAGE) {
    const serverLayers = pullProgressMap[props.gameServer.uuid];
    const layers = serverLayers ? Object.values(serverLayers) : [];

    const dataLayers = layers.filter((l) => l.total !== undefined && l.total > 0);

    const totalBytes = dataLayers.reduce((sum, l) => sum + (l.total ?? 0), 0);
    const currentBytes = dataLayers.reduce((sum, l) => {
      if (COMPLETED_STATUSES.has(l.status)) return sum + (l.total ?? 0);
      if (l.status === "Downloading" && l.current != null) return sum + l.current;
      return sum;
    }, 0);

    const overallPercent: number | null =
      totalBytes > 0 ? Math.round((currentBytes / totalBytes) * 100) : null;

    buttonLabel =
      overallPercent !== null
        ? `${t("PULLING_IMAGE")} (${overallPercent}%)`
        : t("PULLING_IMAGE");

    if (layers.length > 0) {
      tooltipContent = (
        <div className="min-w-50 space-y-1 text-xs">
          {layers.map((layer) => {
            const layerPercent = COMPLETED_STATUSES.has(layer.status)
              ? 100
              : layer.status === "Downloading" && layer.current != null && layer.total
                ? Math.round((layer.current / layer.total) * 100)
                : null;
            return (
              <div key={layer.id ?? "__unknown__"} className="flex justify-between gap-4">
                <span className="font-mono opacity-70 shrink-0">
                  {layer.id ? layer.id.slice(0, 12) : "?"}
                </span>
                <span className="truncate">{layer.status}</span>
                <span className="shrink-0 opacity-70">
                  {layerPercent !== null ? `${layerPercent}%` : ""}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  }

  return (
    <div className={"flex gap-2 align-middle items-center"} data-testid="server-status-indicator">
      <GameServerStatusDot status={status} />
      <TooltipWrapper
        tooltip={status === GameServerDtoStatus.PULLING_IMAGE ? tooltipContent : null}
        side="bottom"
        align="center"
      >
        <div className={"text-lg"}>{buttonLabel}</div>
      </TooltipWrapper>
    </div>
  );
};

export default GameServerStatusIndicator;
