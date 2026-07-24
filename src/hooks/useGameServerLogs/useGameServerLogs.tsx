import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import { v7 as generateUuid } from "uuid";
import { getLogs } from "@/api/generated/backend-api.ts";
import type { GameServerLogMessageEntity } from "@/api/generated/model";
import type { DataLoadState } from "@/types/dataLoadState";
import type { GameServerLogWithUuid } from "@/types/logTypes";

interface UseGameServerLogsOptions {
  /**
   * Only fetch and subscribe while this is true. Pass `false` whenever the view
   * that renders the logs is not visible so nothing is loaded or kept around.
   */
  enabled?: boolean;
  /** Append incoming log messages from the websocket. */
  liveUpdates?: boolean;
}

interface UseGameServerLogsResult {
  logs: GameServerLogWithUuid[];
  state: DataLoadState;
  refresh: () => Promise<void>;
}

const byTimestamp = (a: GameServerLogMessageEntity, b: GameServerLogMessageEntity) =>
  (a.timestamp ? Date.parse(a.timestamp) : 0) - (b.timestamp ? Date.parse(b.timestamp) : 0);

/**
 * View-scoped log access for a single game server.
 *
 * The logs are fetched when the consuming component mounts (or becomes enabled)
 * and dropped again as soon as it unmounts, so nothing outlives the view that
 * actually renders it.
 */
const useGameServerLogs = (
  serverId: string,
  options: UseGameServerLogsOptions = {},
): UseGameServerLogsResult => {
  const { enabled = true, liveUpdates = true } = options;
  const { authorized } = useContext(AuthContext);

  const [logs, setLogs] = useState<GameServerLogWithUuid[]>([]);
  const [state, setState] = useState<DataLoadState>("idle");

  const active = enabled && !!serverId;

  // Guards against a slow response of an outdated request overwriting a newer one.
  const requestIdRef = useRef(0);

  const fetchLogs = useCallback(async () => {
    if (!active) return;

    const requestId = ++requestIdRef.current;
    setState("loading");
    try {
      const fetchedLogs = await getLogs(serverId);
      if (requestIdRef.current !== requestId) return;
      setLogs([...fetchedLogs].sort(byTimestamp).map((log) => ({ ...log, uuid: generateUuid() })));
      setState("idle");
    } catch {
      if (requestIdRef.current !== requestId) return;
      setState("failed");
    }
  }, [active, serverId]);

  useEffect(() => {
    if (!active) {
      // Invalidate in-flight requests so their results are discarded.
      requestIdRef.current++;
      setLogs([]);
      setState("idle");
      return;
    }

    fetchLogs();

    return () => {
      requestIdRef.current++;
      setLogs([]);
      setState("idle");
    };
  }, [active, fetchLogs]);

  useSubscription(
    active && liveUpdates
      ? [
          authorized
            ? `/topics/game-servers/${serverId}/logs`
            : `/topics/public/game-servers/${serverId}/logs`,
        ]
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as GameServerLogMessageEntity;
      setLogs((previous) => [...previous, { ...messageBody, uuid: generateUuid() }]);
    },
  );

  return { logs, state, refresh: fetchLogs };
};

export default useGameServerLogs;
