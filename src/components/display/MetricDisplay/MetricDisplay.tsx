import { useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type GameServerDto, MetricLayoutSize } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner.tsx";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";
import { MetricsType } from "@/types/metricsTyp";
import TimeRangeDropDown from "../DropDown/TimeRangeDropDown";
import MetricGraph from "./MetricGraph";
import { COL_SPAN_MAP } from "./metricLayout";

const MetricDisplay = (
  props: {
    gameServer: GameServerDto;
    canReadMetrics?: boolean;
  } & React.ComponentProps<"div">,
) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<string>("hour");
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const { gameServer, canReadMetrics = true } = props;

  const search = useSearch({ strict: false }) as { timeRangeType?: string };
  const hasUrlTimeRange = search.timeRangeType === "preset" || search.timeRangeType === "custom";

  // The metrics belong to this view only: they are loaded on mount and released
  // again on unmount. Because this component is the sole owner of the request,
  // a time range restored from the URL can no longer be overwritten by an
  // unrelated background load — the initial default load is simply skipped and
  // TimeRangeDropDown fires the restored range instead.
  const { metrics, state, liveUpdatesEnabled, setLiveUpdatesEnabled, loadRange } =
    useGameServerMetrics(gameServer.uuid, {
      enabled: canReadMetrics,
      deferInitialLoad: hasUrlTimeRange,
    });

  const handleTimeChange = (startTime: Date, endTime?: Date) => {
    if (!startTime) return;
    const isToday = !endTime || endTime.getDate() === new Date().getDate();
    setIsCustomTime(!isToday);
    setLiveUpdatesEnabled(isToday);
    loadRange(startTime, endTime);
  };

  return (
    <div className={"flex flex-col w-full items-center p-4 h-full"}>
      <div className="flex mb-2 w-full items-center justify-end gap-2 p-4">
        <TimeRangeDropDown
          onChange={({
            startTime: selectedStartTime,
            endTime: selectedEndTime,
            timeUnit: selectedUnit,
          }) => {
            setUnit(selectedUnit);
            handleTimeChange(selectedStartTime, selectedEndTime);
          }}
          defaultLabel={t("timerange.hour", { time: 1 })}
        />
        <Button disabled={isCustomTime} onClick={() => setLiveUpdatesEnabled(!liveUpdatesEnabled)}>
          {liveUpdatesEnabled ? t("metrics.liveMetricsOn") : t("metrics.liveMetricsOff")}
        </Button>
      </div>
      <div className="grid grid-cols-1 min-[1300px]:grid-cols-6 gap-2 w-full h-auto mb-auto relative">
        {state === "loading" && (
          <div className="absolute z-10 flex justify-center items-center w-full h-full backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Spinner className="size-10" />
              <div className="flex justify-center text-xl">{t("metrics.loadingMetrics")}</div>
            </div>
          </div>
        )}
        {state === "failed" && (
          <div className="absolute z-10 flex justify-center items-center w-full h-full backdrop-blur-sm">
            <div className="flex justify-center text-xl">{t("metrics.loadingMetricsFailed")}</div>
          </div>
        )}
        {gameServer.metric_layout?.map((metric) => (
          <MetricGraph
            key={metric.metric_type}
            className={`${COL_SPAN_MAP[metric.size ?? MetricLayoutSize.MEDIUM]}`}
            metrics={metrics}
            type={metric.metric_type ?? MetricsType.CPU_PERCENT}
            timeUnit={unit}
            canReadMetrics={canReadMetrics}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricDisplay;
