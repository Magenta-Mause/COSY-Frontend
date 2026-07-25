import { useEffect, useState } from "react";
import { getMetrics } from "@/api/generated/backend-api";
import { getAvailableCustomMetrics } from "@/utils/customMetrics";

/**
 * Resolves which custom metrics a game server currently reports.
 *
 * Only the most recent aggregated point is requested — enough to read the custom
 * metric keys off it without pulling in any metric history.
 */
const useCustomMetricKeys = (gameServerUuid?: string, enabled: boolean = true): string[] => {
  const [customMetricKeys, setCustomMetricKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!gameServerUuid || !enabled) {
      setCustomMetricKeys([]);
      return;
    }

    let cancelled = false;

    getMetrics(gameServerUuid, { pointCount: 1 })
      .then((points) => {
        if (!cancelled) setCustomMetricKeys(getAvailableCustomMetrics(points));
      })
      .catch(() => {
        if (!cancelled) setCustomMetricKeys([]);
      });

    return () => {
      cancelled = true;
    };
  }, [gameServerUuid, enabled]);

  return customMetricKeys;
};

export default useCustomMetricKeys;
