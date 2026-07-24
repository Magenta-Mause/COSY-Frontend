import type { MetricLayout, MetricPointDto } from "@/api/generated/model";

export type GameServerMetricsWithUuid = MetricPointDto & { uuid: string };

export type MetricsType = (typeof MetricsType)[keyof typeof MetricsType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MetricsType = {
  CPU_PERCENT: "CPU_PERCENT",
  MEMORY_LIMIT: "MEMORY_LIMIT",
  MEMORY_PERCENT: "MEMORY_PERCENT",
  MEMORY_USAGE: "MEMORY_USAGE",
  NETWORK_INPUT: "NETWORK_INPUT",
  NETWORK_OUTPUT: "NETWORK_OUTPUT",
  BLOCK_READ: "BLOCK_READ",
  BLOCK_WRITE: "BLOCK_WRITE",
} as const;

export type MetricLayoutUI = MetricLayout & { _uiUuid: string };

// Custom metric types use a prefix to distinguish them from standard metrics
export const CUSTOM_METRIC_PREFIX = "custom.";

export const isCustomMetric = (metricType: string): boolean => {
  return metricType.startsWith(CUSTOM_METRIC_PREFIX);
};

export const createCustomMetricType = (key: string): string => {
  return `${CUSTOM_METRIC_PREFIX}${key}`;
};

export const extractCustomMetricKey = (metricType: string): string => {
  return metricType.replace(CUSTOM_METRIC_PREFIX, "");
};

export const formatMetricDisplayName = (key: string): string => {
  // Convert camelCase or snake_case to Title Case
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
