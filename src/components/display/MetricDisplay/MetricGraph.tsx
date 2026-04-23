import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { MetricValues } from "@/api/generated/model";
import useIsDesktop from "@/hooks/useIsDesktop/useIsDesktop.tsx";
import type { GameServerMetricsWithUuid } from "@/stores/slices/gameServerMetrics";
import {
  extractCustomMetricKey,
  formatMetricDisplayName,
  isCustomMetric,
  MetricsType,
} from "@/types/metricsTyp";

interface MetricGraphProps {
  className?: string;
  type: MetricsType | string;
  timeUnit: string;
  metrics: GameServerMetricsWithUuid[];
  canReadMetrics?: boolean;
  overridePermissionCheck?: boolean;
}

const chartConfig = {
  value: {
    label: "Metric",
    color: "blue",
  },
} satisfies ChartConfig;

const METRIC_KEY_MAP: Record<MetricsType, keyof MetricValues> = {
  CPU_PERCENT: "cpu_percent",
  MEMORY_PERCENT: "memory_percent",
  MEMORY_LIMIT: "memory_limit",
  MEMORY_USAGE: "memory_usage",
  BLOCK_READ: "block_read",
  BLOCK_WRITE: "block_write",
  NETWORK_INPUT: "network_input",
  NETWORK_OUTPUT: "network_output",
} as const;

const MetricGraph = (props: MetricGraphProps) => {
  const { t } = useTranslation();
  const { className, type, timeUnit, metrics, canReadMetrics = true } = props;
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  const isDesktop = useIsDesktop();

  const convertBytes = (byte: number, base: number, sizes: string[]) => {
    if (byte === 0) return "0 Bytes";
    const i = Math.floor(Math.log(byte) / Math.log(base));
    return `${(byte / base ** i).toFixed(2)} ${sizes[i]}`;
  };

  const formateMetric = (value: number) => {
    if (type === MetricsType.CPU_PERCENT || type === MetricsType.MEMORY_PERCENT) {
      return `${(value).toFixed(2)}%`;
    } else if (type === MetricsType.MEMORY_USAGE || type === MetricsType.MEMORY_LIMIT) {
      return convertBytes(value, 1024, ["Bytes", "KiB", "MiB", "GiB", "TiB"]);
    } else if (isCustomMetric(type)) {
      // For custom metrics, show raw value with 2 decimal places
      return value.toFixed(2);
    }
    return convertBytes(value, 1000, ["Bytes", "KB", "MB", "GB", "TB"]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeUnit === "day") {
      return date.toLocaleDateString(t("timerange.localTime"), {
        month: "2-digit",
        day: "2-digit",
      });
    }
    return date.toLocaleTimeString(t("timerange.localTime"), {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatTooltipTime = (_timeString: string, payload: Payload<ValueType, NameType>[]) => {
    if (!payload[0]) return "";
    const value = payload[0].payload as { time: number; value: number };
    const date = new Date(value.time);
    return date.toLocaleString(t("timerange.localTime"), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMetricValue = (metric: GameServerMetricsWithUuid): number | string => {
    if (isCustomMetric(type)) {
      const customKey = extractCustomMetricKey(type);
      const customValue = metric.metric_values?.custom_metric_holder?.[customKey];
      // Return the raw value (can be number or string)
      if (typeof customValue === "number" || typeof customValue === "string") {
        return customValue;
      }
      return 0;
    }

    return (metric.metric_values?.[METRIC_KEY_MAP[type as MetricsType]] as number) ?? 0;
  };

  const isStringMetric = (): boolean => {
    if (!isCustomMetric(type) || !metrics?.length) return false;

    const latestMetric = metrics[metrics.length - 1];
    const value = getMetricValue(latestMetric);

    // Check if value is a string or cannot be parsed as a number
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed);
    }

    return false;
  };

  const getLatestStringValue = (): string => {
    if (!metrics?.length) return "";
    const latestMetric = metrics[metrics.length - 1];
    const value = getMetricValue(latestMetric);
    return typeof value === "string" ? value : String(value);
  };

  const getDisplayName = (): string => {
    if (isCustomMetric(type)) {
      return formatMetricDisplayName(extractCustomMetricKey(type));
    }
    return t(`metrics.types.${type}`);
  };

  useEffect(() => {
    if (!metrics?.length) return;

    // Check if this is a string metric
    if (isCustomMetric(type) && metrics.length > 0) {
      const latestMetric = metrics[metrics.length - 1];
      if (isCustomMetric(type)) {
        const customKey = extractCustomMetricKey(type);
        const customValue = latestMetric?.metric_values?.custom_metric_holder?.[customKey];
        if (typeof customValue === "string" && Number.isNaN(Number(customValue))) {
          return; // Skip chart data for string metrics
        }
      }
    }

    const flattened = metrics
      .map((metric) => {
        let value: number | string = 0;
        if (isCustomMetric(type)) {
          const customKey = extractCustomMetricKey(type);
          const customValue = metric.metric_values?.custom_metric_holder?.[customKey];
          if (typeof customValue === "number" || typeof customValue === "string") {
            value = customValue;
          } else {
            value = 0;
          }
        } else {
          value = (metric.metric_values?.[METRIC_KEY_MAP[type as MetricsType]] as number) ?? 0;
        }

        const numericValue = typeof value === "number" ? value : Number(value);
        const timeString = metric.time ?? "";
        return {
          time: timeString ? new Date(timeString).getTime() : 0,
          value: Number.isNaN(numericValue) ? 0 : numericValue,
        };
      })
      .filter((metric) => metric.time !== 0);

    setChartData(flattened);
  }, [metrics, type]);

  const displayName = getDisplayName();
  const showStringValue = isStringMetric();

  return (
    <Card
      className={`flex flex-col col-span-1 min-[1300px]:col-span-3 text-lg py-3 bg-button-secondary-default ${isDesktop ? "h-[18vw]" : "h-56"} overflow-hidden border-2 relative ${className}`}
    >
      <CardHeader className="py-2 pt-1 grow-0 gap-0.5">
        <CardTitle>{displayName}</CardTitle>
        <CardDescription>
          {showStringValue
            ? t("metrics.currentValue", { type: displayName })
            : isCustomMetric(type)
              ? t("metrics.metricDescriptionCustom", { type: displayName })
              : t("metrics.metricDescription", { type: displayName })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {showStringValue ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2 wrap-break-word max-w-full px-4">
                {getLatestStringValue()}
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickCount={10}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formatTime}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={formateMetric}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatTooltipTime}
                    formatter={(value) => {
                      return [formateMetric(value as number), ` ${displayName}`];
                    }}
                  />
                }
              />
              <Area
                dataKey="value"
                type="monotone"
                stroke="#3E8EDE"
                fill="#3E8EDE"
                fillOpacity={0.4}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>

      {!canReadMetrics && !props.overridePermissionCheck && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold mb-1">{t("metrics.noMetricsPermission")}</div>
            <div className="text-sm text-muted-foreground">
              {t("metrics.noMetricsPermissionDesc")}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MetricGraph;
