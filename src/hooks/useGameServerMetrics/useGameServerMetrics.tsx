import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import { v7 as generateUuid } from "uuid";
import { getMetrics, getPublicEvaluableMetrics } from "@/api/generated/backend-api.ts";
import type { MetricPointDto } from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
import type { DataLoadState } from "@/types/dataLoadState";
import type { GameServerMetricsWithUuid } from "@/types/metricsTyp";

interface UseGameServerMetricsOptions {
  /**
   * Only fetch and subscribe while this is true. Pass `false` whenever the view
   * that renders the metrics is not visible so nothing is loaded or kept around.
   */
  enabled?: boolean;
  /** Which endpoint to read from — the public one does not require permissions. */
  source?: "private" | "public";
  /**
   * Skip the default load on mount because the consumer immediately requests an
   * explicit time range (e.g. one restored from the URL). Avoids a throwaway request.
   */
  deferInitialLoad?: boolean;
}

interface UseGameServerMetricsResult {
  metrics: GameServerMetricsWithUuid[];
  state: DataLoadState;
  liveUpdatesEnabled: boolean;
  setLiveUpdatesEnabled: (enabled: boolean) => void;
  loadRange: (start?: Date, end?: Date) => Promise<void>;
}

/**
 * View-scoped metric access for a single game server.
 *
 * The metrics are fetched when the consuming component mounts (or becomes enabled)
 * and dropped again as soon as it unmounts, so nothing outlives the view that
 * actually renders it.
 */
const useGameServerMetrics = (
  serverId: string,
  options: UseGameServerMetricsOptions = {},
): UseGameServerMetricsResult => {
  const { enabled = true, source = "private", deferInitialLoad = false } = options;
  const { authorized } = useContext(AuthContext);

  const [metrics, setMetrics] = useState<GameServerMetricsWithUuid[]>([]);
  const [state, setState] = useState<DataLoadState>("idle");
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);

  const active = enabled && !!serverId;

  // Guards against a slow response of an outdated range overwriting a newer one.
  const requestIdRef = useRef(0);
  // Only the very first load can be deferred — the flag is derived from the URL
  // and flips once the consumer writes its selection back to it.
  const skipInitialLoadRef = useRef(deferInitialLoad);

  const loadRange = useCallback(
    async (start?: Date, end?: Date) => {
      if (!active) return;

      const requestId = ++requestIdRef.current;
      setState("loading");
      const params = {
        start: start ? start.toISOString() : undefined,
        end: end ? end.toISOString() : undefined,
      };
      try {
        const fetchedMetrics =
          source === "public"
            ? await getPublicEvaluableMetrics(serverId, params)
            : await getMetrics(serverId, params);
        if (requestIdRef.current !== requestId) return;
        setMetrics(fetchedMetrics.map((metric) => ({ ...metric, uuid: generateUuid() })));
        setState("idle");
      } catch {
        if (requestIdRef.current !== requestId) return;
        notificationModal.error({
          message: `Failed to load metrics for server: ${serverId}`,
        });
        setState("failed");
      }
    },
    [active, serverId, source],
  );

  useEffect(() => {
    if (!active) {
      // Invalidate in-flight requests so their results are discarded.
      requestIdRef.current++;
      setMetrics([]);
      setState("idle");
      return;
    }

    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
    } else {
      loadRange();
    }

    return () => {
      requestIdRef.current++;
      setMetrics([]);
      setState("idle");
    };
  }, [active, loadRange]);

  useSubscription(
    active && liveUpdatesEnabled
      ? [
          authorized
            ? `/topics/game-servers/${serverId}/metrics`
            : `/topics/public/game-servers/${serverId}/metrics`,
        ]
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as MetricPointDto;
      setMetrics((previous) => [...previous, { ...messageBody, uuid: generateUuid() }]);
    },
  );

  return { metrics, state, liveUpdatesEnabled, setLiveUpdatesEnabled, loadRange };
};

export default useGameServerMetrics;
