import { Button } from "@components/ui/button";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { type GameServerDto, MetricLayoutSize } from "@/api/generated/model";
import spinner from "@/assets/gifs/spinner.gif";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading";
import { useTypedSelector } from "@/stores/rootReducer";
import {
  type GameServerMetricsWithUuid,
  gameServerMetricsSliceActions,
} from "@/stores/slices/gameServerMetrics";
import { MetricsType } from "@/types/metricsTyp";
import TimeRangeDropDown from "../DropDown/TimeRangeDropDown";
import MetricGraph from "./MetricGraph";
import { COL_SPAN_MAP } from "./metricLayout";

const MetricDisplay = (
  props: {
    metrics: GameServerMetricsWithUuid[];
    gameServer: GameServerDto;
  } & React.ComponentProps<"div">,
) => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<string>("hour");
  const [loading, setLoading] = useState<boolean>(false);
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const { loadGameServerMetrics } = useDataLoading();
  const dispatch = useDispatch();
  const { metrics, gameServer } = props;

  const search = useSearch({ strict: false }) as { timeRangeType?: string };
  const hasUrlTimeRange = search.timeRangeType === "preset" || search.timeRangeType === "custom";

  // When a URL-restored time range is present, the initial onChange from
  // TimeRangeDropDown races against loadAdditionalGameServerData's default
  // metrics load. If the background load wins (higher request counter), the
  // URL-restored selection gets overwritten. We detect this by watching for
  // a loading→idle transition we didn't initiate and re-fire with the saved range.
  const savedTimeRangeRef = useRef<{ start: Date; end?: Date } | null>(null);
  const needsRefire = useRef(hasUrlTimeRange);
  const metricsReduxState = useTypedSelector(
    (s) => s.gameServerMetricsSliceReducer.data[gameServer.uuid]?.state,
  );
  const prevMetricsReduxStateRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const prev = prevMetricsReduxStateRef.current;
    prevMetricsReduxStateRef.current = metricsReduxState;

    if (
      prev === "loading" &&
      metricsReduxState === "idle" &&
      needsRefire.current &&
      savedTimeRangeRef.current
    ) {
      needsRefire.current = false;
      const { start, end } = savedTimeRangeRef.current;
      loadGameServerMetrics(gameServer.uuid, start, end);
    }
  }, [metricsReduxState, gameServer.uuid, loadGameServerMetrics]);

  const liveEnabled = useTypedSelector(
    (s) => s.gameServerMetricsSliceReducer.data[gameServer.uuid]?.enableMetricsLiveUpdates ?? true,
  );

  const handleLiveMetrics = (enableLiveMetrics: boolean) => {
    dispatch(
      gameServerMetricsSliceActions.setEnableMetricsLiveUpdates({
        gameServerUuid: gameServer.uuid,
        enable: enableLiveMetrics,
      }),
    );
  };

  const handleTimeChange = async (startTime: Date, endTime?: Date) => {
    if (!startTime) return;
    savedTimeRangeRef.current = { start: startTime, end: endTime };
    const isToday = !endTime || endTime.getDate() === new Date().getDate();
    setIsCustomTime(!isToday);
    handleLiveMetrics(isToday);

    setLoading(true);
    try {
      await loadGameServerMetrics(gameServer.uuid, startTime, endTime);
    } finally {
      setLoading(false);
    }
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
        <Button disabled={isCustomTime} onClick={() => handleLiveMetrics(!liveEnabled)}>
          {liveEnabled ? t("metrics.liveMetricsOn") : t("metrics.liveMetricsOff")}
        </Button>
      </div>
      <div className="grid grid-cols-1 min-[1300px]:grid-cols-6 gap-2 w-full h-auto mb-auto relative">
        {loading && (
          <div className="absolute z-10 flex justify-center items-center w-full h-full backdrop-blur-sm">
            <div className="flex flex-col gap-2">
              <img src={spinner} alt="spinner" />
              <div className="flex justify-center text-xl">{t("signIn.loading")}</div>
            </div>
          </div>
        )}
        {gameServer.metric_layout?.map((metric) => (
          <MetricGraph
            key={metric.metric_type}
            className={`${COL_SPAN_MAP[metric.size ?? MetricLayoutSize.MEDIUM]}`}
            metrics={metrics}
            type={metric.metric_type ?? MetricsType.CPU_PERCENT}
            timeUnit={unit}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricDisplay;
