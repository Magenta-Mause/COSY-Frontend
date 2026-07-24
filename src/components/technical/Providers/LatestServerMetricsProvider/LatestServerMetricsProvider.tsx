import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSubscription } from "react-stomp-hooks";
import { getMetrics } from "@/api/generated/backend-api";
import {
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDtoStatus,
  type MetricPointDto,
} from "@/api/generated/model";
import { containsPermission } from "@/lib/permissionCalculations";
import { useTypedSelector } from "@/stores/rootReducer";

/** Window used to seed the first value so consumers don't render a zero until the first push. */
const SEED_WINDOW_MS = 60 * 1000;

interface LatestServerMetricsContextType {
  /** Newest known metric point per game server — only ever one point per server. */
  latestMetrics: Record<string, MetricPointDto>;
  /** Registers a consumer; the returned callback deregisters it again. */
  acquire: () => () => void;
}

const LatestServerMetricsContext = createContext<LatestServerMetricsContextType>({
  latestMetrics: {},
  acquire: () => () => {},
});

/**
 * Keeps the *current* resource usage of every running game server available to
 * components that display live usage, without holding on to any metric history.
 *
 * Nothing is fetched or subscribed until a consumer registers via `acquire()`,
 * and everything is dropped again once the last consumer unmounts.
 */
const LatestServerMetricsProvider = (props: { children: ReactNode }) => {
  const gameServers = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const gameServerPermissions = useTypedSelector(
    (state) => state.gameServerPermissionsSliceReducer.data,
  );
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [latestMetrics, setLatestMetrics] = useState<Record<string, MetricPointDto>>({});

  const active = subscriberCount > 0;

  const runningServerUuids = useMemo(
    () =>
      gameServers
        .filter(
          (server) =>
            server.status === GameServerDtoStatus.RUNNING &&
            containsPermission(
              (gameServerPermissions[server.uuid]?.permissions ??
                []) as GameServerAccessGroupDtoPermissionsItem[],
              GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS,
            ),
        )
        .map((server) => server.uuid),
    [gameServers, gameServerPermissions],
  );

  const acquire = useCallback(() => {
    setSubscriberCount((count) => count + 1);
    return () => setSubscriberCount((count) => Math.max(0, count - 1));
  }, []);

  // Seed once per server and activation so the first render shows real numbers
  // instead of waiting for the next push. Results are discarded if we go
  // inactive meanwhile.
  const seededServerUuids = useRef(new Set<string>());

  useEffect(() => {
    if (!active) {
      seededServerUuids.current.clear();
      setLatestMetrics({});
      return;
    }

    let cancelled = false;
    const start = new Date(Date.now() - SEED_WINDOW_MS).toISOString();
    const serversToSeed = runningServerUuids.filter(
      (serverUuid) => !seededServerUuids.current.has(serverUuid),
    );
    serversToSeed.forEach((serverUuid) => {
      seededServerUuids.current.add(serverUuid);
    });

    Promise.allSettled(
      serversToSeed.map(async (serverUuid) => {
        const points = await getMetrics(serverUuid, { start, pointCount: 1 });
        const latestPoint = points.at(-1);
        if (cancelled || !latestPoint) return;
        setLatestMetrics((previous) =>
          // A pushed value that arrived while we were fetching is newer than the seed.
          previous[serverUuid] ? previous : { ...previous, [serverUuid]: latestPoint },
        );
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [active, runningServerUuids]);

  useSubscription(
    active ? runningServerUuids.map((uuid) => `/topics/game-servers/${uuid}/metrics`) : [],
    (message) => {
      const point = JSON.parse(message.body) as MetricPointDto;
      const serverUuid = point.game_server_uuid;
      if (!serverUuid) return;
      setLatestMetrics((previous) => ({ ...previous, [serverUuid]: point }));
    },
  );

  const value = useMemo<LatestServerMetricsContextType>(
    () => ({ latestMetrics, acquire }),
    [latestMetrics, acquire],
  );

  return (
    <LatestServerMetricsContext.Provider value={value}>
      {props.children}
    </LatestServerMetricsContext.Provider>
  );
};

export { LatestServerMetricsContext };
export default LatestServerMetricsProvider;
