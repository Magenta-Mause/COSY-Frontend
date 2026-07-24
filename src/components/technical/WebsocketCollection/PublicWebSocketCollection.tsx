import { useAppDispatch, useAppSelector } from "@/stores/hooks.ts";
import { useSubscription } from "react-stomp-hooks";
import { v7 as generateUuid } from "uuid";
import {
  type GameServerDto,
  type GameServerLogMessageEntity,
  type MetricPointDto,
  PublicDashboardLayoutLayoutType,
} from "@/api/generated/model";
import { gameServerLogSliceActions } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerMetricsSliceActions } from "@/stores/slices/gameServerMetrics";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

const PublicWebSocketCollection = () => {
  const gameServer = useAppSelector((state) => state.gameServerSliceReducer.data);
  const gameServerMetrics = useAppSelector((state) => state.gameServerMetricsSliceReducer.data);
  const dispatch = useAppDispatch();

  const publicServers = gameServer?.filter((server) => server.public_dashboard?.enabled);

  const serversWithLogs = publicServers?.filter((server) =>
    server.public_dashboard?.layouts?.some(
      (layout) => layout.layout_type === PublicDashboardLayoutLayoutType.LOGS,
    ),
  );

  const serversWithMetrics = publicServers?.filter((server) =>
    server.public_dashboard?.layouts?.some(
      (layout) => layout.layout_type === PublicDashboardLayoutLayoutType.METRIC,
    ),
  );

  useSubscription(
    publicServers
      ? publicServers.map((server) => `/topics/public/game-servers/updates/${server.uuid}`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body);

      if (messageBody.server_name !== undefined) {
        dispatch(gameServerSliceActions.updateGameServer(messageBody as GameServerDto));
      }
    },
  );

  useSubscription(
    serversWithLogs
      ? serversWithLogs.map((server) => `/topics/public/game-servers/${server.uuid}/logs`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as GameServerLogMessageEntity;
      dispatch(
        gameServerLogSliceActions.addLog({
          ...messageBody,
          uuid: generateUuid(),
        }),
      );
    },
  );

  useSubscription(
    serversWithMetrics
      ? serversWithMetrics.map((server) => `/topics/public/game-servers/${server.uuid}/metrics`)
      : [],
    (message) => {
      const messageBody = JSON.parse(message.body) as MetricPointDto;
      const serverMetricState = gameServerMetrics[messageBody.game_server_uuid ?? ""];

      if (!serverMetricState || !serverMetricState.enableMetricsLiveUpdates) {
        return;
      }

      dispatch(
        gameServerMetricsSliceActions.addMetrics({
          ...messageBody,
          uuid: generateUuid(),
        }),
      );
    },
  );

  return null;
};

export default PublicWebSocketCollection;
