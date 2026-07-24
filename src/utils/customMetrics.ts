import type { MetricPointDto } from "@/api/generated/model";
import { createCustomMetricType } from "@/types/metricsTyp";

/**
 * Extracts available custom metric keys from the latest metric point
 * @param metrics Array of metrics for a game server
 * @returns Array of custom metric types (with prefix)
 */
export const getAvailableCustomMetrics = (metrics: MetricPointDto[] | undefined): string[] => {
  if (!metrics || metrics.length === 0) {
    return [];
  }

  // Get the most recent metric point
  const latestMetric = metrics[metrics.length - 1];
  const customMetricHolder = latestMetric?.metric_values?.custom_metric_holder;

  if (!customMetricHolder || typeof customMetricHolder !== "object") {
    return [];
  }

  // Extract keys and convert to custom metric types
  return Object.keys(customMetricHolder).map((key) => createCustomMetricType(key));
};
