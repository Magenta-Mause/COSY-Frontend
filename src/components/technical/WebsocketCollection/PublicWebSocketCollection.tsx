import { useAppDispatch, useAppSelector } from "@/stores/hooks.ts";
import { useSubscription } from "react-stomp-hooks";
import type { GameServerDto } from "@/api/generated/model";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

const PublicWebSocketCollection = () => {
  const gameServer = useAppSelector((state) => state.gameServerSliceReducer.data);
  const dispatch = useAppDispatch();

  const publicServers = gameServer?.filter((server) => server.public_dashboard?.enabled);

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

  return null;
};

export default PublicWebSocketCollection;
