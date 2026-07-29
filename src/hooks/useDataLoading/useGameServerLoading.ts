import { useCallback } from "react";
import {
  getAllGameServers,
  getGameServerById,
  getUserPermissions,
} from "@/api/generated/backend-api.ts";
import { GameServerAccessGroupDtoPermissionsItem, type GameServerDto } from "@/api/generated/model";
import { containsPermission } from "@/lib/permissionCalculations.ts";
import { useAppDispatch } from "@/stores/hooks.ts";
import { gameServerPermissionsSliceActions } from "@/stores/slices/gameServerPermissionsSlice.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

const useGameServerLoading = () => {
  const dispatch = useAppDispatch();

  const removeGameServer = useCallback(
    async (gameServerUuid: string) => {
      dispatch(gameServerSliceActions.removeGameServer(gameServerUuid));
      dispatch(gameServerPermissionsSliceActions.removeGameServerPermissions(gameServerUuid));
    },
    [dispatch],
  );

  const loadGameServerPermissions = useCallback(
    async (gameServerUuid: string, permissions?: GameServerAccessGroupDtoPermissionsItem[]) => {
      dispatch(
        gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
          gameServerUuid,
          status: "loading",
        }),
      );
      try {
        const fetchedPermissions = permissions || (await getUserPermissions(gameServerUuid));
        dispatch(
          gameServerPermissionsSliceActions.setGameServerPermissions({
            gameServerUuid,
            permissions: fetchedPermissions,
          }),
        );
        dispatch(
          gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
            gameServerUuid,
            status: "idle",
          }),
        );
        return fetchedPermissions;
      } catch (e) {
        console.error("Unexpected error while loading game server permissions", e);
        dispatch(
          gameServerPermissionsSliceActions.updateGameServerPermissionsStatus({
            gameServerUuid,
            status: "failed",
          }),
        );
        return null;
      }
    },
    [dispatch],
  );

  const loadGameServer = useCallback(
    async (
      gameServerUuid: string,
      deleteIfNotFound?: boolean,
      permissions?: GameServerAccessGroupDtoPermissionsItem[],
    ) => {
      if (
        permissions !== undefined &&
        !containsPermission(permissions ?? [], GameServerAccessGroupDtoPermissionsItem.SEE_SERVER)
      ) {
        removeGameServer(gameServerUuid);
        return false;
      }

      let gameServer: GameServerDto;
      try {
        gameServer = await getGameServerById(gameServerUuid);
        dispatch(gameServerSliceActions.updateGameServer(gameServer));
      } catch (e) {
        if (deleteIfNotFound) {
          console.error("Game server not found, deleting from store", e);
          dispatch(gameServerSliceActions.removeGameServer(gameServerUuid));
          return false;
        } else {
          console.error("Unexpected error while loading game server", e);
          dispatch(gameServerSliceActions.setState("failed"));
          return false;
        }
      }

      try {
        await loadGameServerPermissions(gameServerUuid, permissions);
        dispatch(gameServerSliceActions.setState("idle"));
        return true;
      } catch (e) {
        console.error("Could not load ", e);
        return false;
      }
    },
    [dispatch, removeGameServer, loadGameServerPermissions],
  );

  const loadGameServers = useCallback(async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServers(gameServers));
      await Promise.allSettled(
        gameServers.map((gameServer) => loadGameServerPermissions(gameServer.uuid)),
      );
      return true;
    } catch {
      dispatch(gameServerSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch, loadGameServerPermissions]);

  const loadPublicGameServer = useCallback(async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServers(gameServers));
      return true;
    } catch {
      dispatch(gameServerSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch]);

  return {
    removeGameServer,
    loadGameServerPermissions,
    loadGameServer,
    loadGameServers,
    loadPublicGameServer,
  };
};

export default useGameServerLoading;
