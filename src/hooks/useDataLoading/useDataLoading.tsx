import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { v7 as generateUuid } from "uuid";
import {
  getAllGameServers,
  getAllTemplates,
  getAllUserEntities,
  getAllUserInvites,
  getGameServerById,
  getLogs,
  getMetrics,
  getPublicEvaluableMetrics,
  getUserPermissions,
} from "@/api/generated/backend-api.ts";
import { GameServerAccessGroupDtoPermissionsItem, type GameServerDto } from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
import { containsPermission } from "@/lib/permissionCalculations.ts";
import { gameServerLogSliceActions } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerMetricsSliceActions } from "@/stores/slices/gameServerMetrics";
import { gameServerPermissionsSliceActions } from "@/stores/slices/gameServerPermissionsSlice.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import { templateSliceActions } from "@/stores/slices/templateSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import { userSliceActions } from "@/stores/slices/userSlice.ts";
import { DashboardElementTypes } from "@/types/dashboardTypes";

// Module-level counter to track the latest metrics request per server UUID.
// Ensures that if multiple requests are in-flight (e.g. on page reload), only
// the result of the most recently initiated request is applied to the store.
const gameServersMetricsRequestCounter: Record<string, number> = {};

const useDataLoading = () => {
  const dispatch = useDispatch();

  // --- Leaf functions (depend only on dispatch) ---

  const loadTemplates = useCallback(async () => {
    dispatch(templateSliceActions.setState("loading"));
    try {
      const templates = await getAllTemplates();
      dispatch(templateSliceActions.setTemplates(templates));
      dispatch(templateSliceActions.setState("idle"));
      return true;
    } catch (e) {
      console.error("Unexpected error while loading templates", e);
      dispatch(templateSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch]);

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

  const removeGameServer = useCallback(
    async (gameServerUuid: string) => {
      dispatch(gameServerSliceActions.removeGameServer(gameServerUuid));
      dispatch(gameServerLogSliceActions.removeLogsFromServer(gameServerUuid));
      dispatch(gameServerMetricsSliceActions.removeMetricsFromServer(gameServerUuid));
      dispatch(gameServerPermissionsSliceActions.removeGameServerPermissions(gameServerUuid));
    },
    [dispatch],
  );

  const loadUsers = useCallback(async () => {
    dispatch(userSliceActions.setState("loading"));
    try {
      const users = await getAllUserEntities();
      dispatch(userSliceActions.setUsers(users));
      dispatch(userSliceActions.setState("idle"));
      return true;
    } catch {
      dispatch(userSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch]);

  const loadInvites = useCallback(async () => {
    dispatch(userInviteSliceActions.setState("loading"));
    try {
      const invites = await getAllUserInvites();
      dispatch(userInviteSliceActions.setInvites(invites));
      dispatch(userInviteSliceActions.setState("idle"));
      return true;
    } catch {
      dispatch(userInviteSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch]);

  const loadGameServerLogs = useCallback(
    async (
      gameServerUuid: string,
      permissions?: GameServerAccessGroupDtoPermissionsItem[],
      skipPermissionCheck?: boolean,
    ) => {
      if (
        !skipPermissionCheck &&
        !containsPermission(
          permissions ?? [],
          GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS,
        )
      ) {
        dispatch(gameServerLogSliceActions.removeLogsFromServer(gameServerUuid));
        return;
      }
      dispatch(gameServerLogSliceActions.setState({ gameServerUuid, state: "loading" }));
      try {
        const logs = await getLogs(gameServerUuid);
        logs.sort(
          (a, b) =>
            (a.timestamp ? Date.parse(a.timestamp) : 0) -
            (b.timestamp ? Date.parse(b.timestamp) : 0),
        );
        const logsWithUuid = logs.map((log) => ({ ...log, uuid: generateUuid() }));
        dispatch(
          gameServerLogSliceActions.setGameServerLogs({ gameServerUuid, logs: logsWithUuid }),
        );
        dispatch(gameServerLogSliceActions.setState({ gameServerUuid, state: "idle" }));
      } catch {
        dispatch(gameServerLogSliceActions.setState({ gameServerUuid, state: "failed" }));
      }
    },
    [dispatch],
  );

  const loadPublicGameServerMetrics = useCallback(
    async (gameServerUuid: string, start?: Date, end?: Date) => {
      dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "loading" }));
      try {
        const metrics = await getPublicEvaluableMetrics(gameServerUuid, {
          start: start ? start.toISOString() : undefined,
          end: end ? end.toISOString() : undefined,
        });
        const metricsWithUuid = metrics.map((metric) => ({ ...metric, uuid: generateUuid() }));
        dispatch(
          gameServerMetricsSliceActions.setGameServerMetrics({
            gameServerUuid,
            metrics: metricsWithUuid,
          }),
        );
      } catch {
        notificationModal.error({
          message: `Failed to load public metrics for server: ${gameServerUuid}`,
        });
        dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "failed" }));
      }
    },
    [dispatch],
  );

  const loadGameServerMetrics = useCallback(
    async (
      gameServerUuid: string,
      start?: Date,
      end?: Date,
      permissions?: GameServerAccessGroupDtoPermissionsItem[],
    ) => {
      const nextRequestId = (gameServersMetricsRequestCounter[gameServerUuid] ?? 0) + 1;
      gameServersMetricsRequestCounter[gameServerUuid] = nextRequestId;
      const requestId = nextRequestId;
      if (
        permissions !== undefined &&
        !containsPermission(
          permissions ?? [],
          GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS,
        )
      ) {
        dispatch(gameServerMetricsSliceActions.removeMetricsFromServer(gameServerUuid));
        return;
      }
      dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "loading" }));
      try {
        const metrics = await getMetrics(gameServerUuid, {
          start: start ? start.toISOString() : undefined,
          end: end ? end.toISOString() : undefined,
        });
        if (gameServersMetricsRequestCounter[gameServerUuid] !== requestId) return;
        const metricsWithUuid = metrics.map((metric) => ({ ...metric, uuid: generateUuid() }));
        dispatch(
          gameServerMetricsSliceActions.setGameServerMetrics({
            gameServerUuid,
            metrics: metricsWithUuid,
          }),
        );
        dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "idle" }));
      } catch {
        if (gameServersMetricsRequestCounter[gameServerUuid] !== requestId) return;
        notificationModal.error({
          message: `Failed to load metrics for server: ${gameServerUuid}`,
        });
        dispatch(gameServerMetricsSliceActions.setState({ gameServerUuid, state: "failed" }));
      }
    },
    [dispatch],
  );

  // --- Second level (depend on leaf functions) ---

  const checkForLoadingPublicMetrics = useCallback(
    async (gameServer: GameServerDto) => {
      if (
        !gameServer.public_dashboard?.layouts?.some(
          (layout) => layout.layout_type === DashboardElementTypes.METRIC,
        )
      ) {
        return;
      }

      await loadPublicGameServerMetrics(gameServer.uuid, undefined, undefined);
    },
    [loadPublicGameServerMetrics],
  );

  const checkForLoadingPublicLogs = useCallback(
    async (gameServer: GameServerDto) => {
      if (
        !gameServer.public_dashboard?.layouts?.some(
          (layout) => layout.layout_type === DashboardElementTypes.LOGS,
        )
      ) {
        return;
      }

      await loadGameServerLogs(gameServer.uuid, [], true);
    },
    [loadGameServerLogs],
  );

  // --- Third level ---

  const loadAdditionalGameServerData = useCallback(
    async (
      gameServerUuid: string,
      gameServer: GameServerDto,
      permissions?: GameServerAccessGroupDtoPermissionsItem[],
    ) => {
      const fetchedPermissions =
        (await loadGameServerPermissions(gameServerUuid, permissions)) || undefined;

      if (!fetchedPermissions) {
        return;
      }

      await Promise.allSettled([
        containsPermission(
          fetchedPermissions,
          GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS,
        )
          ? loadGameServerLogs(gameServerUuid, fetchedPermissions)
          : checkForLoadingPublicLogs(gameServer),
        containsPermission(
          fetchedPermissions,
          GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS,
        )
          ? loadGameServerMetrics(gameServerUuid, undefined, undefined, fetchedPermissions)
          : checkForLoadingPublicMetrics(gameServer),
      ]);
    },
    [
      loadGameServerPermissions,
      loadGameServerLogs,
      loadGameServerMetrics,
      checkForLoadingPublicLogs,
      checkForLoadingPublicMetrics,
    ],
  );

  const loadPublicServerDetails = useCallback(
    async (gameServer: GameServerDto) => {
      await Promise.allSettled([
        checkForLoadingPublicLogs(gameServer),
        checkForLoadingPublicMetrics(gameServer),
      ]);
    },
    [checkForLoadingPublicLogs, checkForLoadingPublicMetrics],
  );

  // --- Fourth level ---

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
        await loadAdditionalGameServerData(gameServerUuid, gameServer, permissions);

        dispatch(gameServerSliceActions.setState("idle"));
        return true;
      } catch (e) {
        console.error("Could not load ", e);
        return false;
      }
    },
    [dispatch, removeGameServer, loadAdditionalGameServerData],
  );

  const loadGameServers = useCallback(async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServers(gameServers));
      await Promise.allSettled(
        gameServers.map((gameServer) =>
          loadAdditionalGameServerData(gameServer.uuid, gameServer, undefined),
        ),
      );
      return true;
    } catch {
      dispatch(gameServerSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch, loadAdditionalGameServerData]);

  const loadPublicGameServer = useCallback(async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServers(gameServers));

      await Promise.allSettled(
        gameServers.map((gameServer) => loadPublicServerDetails(gameServer)),
      );
      return true;
    } catch {
      dispatch(gameServerSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch, loadPublicServerDetails]);

  // --- Top level ---

  const loadAllData = useCallback(
    async (isAdmin: boolean = false) => {
      const tasks = [loadGameServers(), loadTemplates()];
      const taskNames = ["gameServers", "templates"];

      // Only load users and invites for admin users
      if (isAdmin) {
        tasks.push(loadUsers(), loadInvites());
        taskNames.push("users", "invites");
      }

      const results = await Promise.allSettled(tasks);

      const summary = {
        gameServers: results[0].status === "fulfilled" && results[0].value === true,
        templates: results[1].status === "fulfilled" && results[1].value === true,
        users:
          isAdmin && results[2]
            ? results[2].status === "fulfilled" && results[2].value === true
            : undefined,
        invites:
          isAdmin && results[3]
            ? results[3].status === "fulfilled" && results[3].value === true
            : undefined,
      };

      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          console.error(`Failed to load ${taskNames[idx]}:`, result.reason);
        }
      });

      return summary;
    },
    [loadGameServers, loadTemplates, loadUsers, loadInvites],
  );

  return {
    loadGameServers,
    loadUsers,
    loadInvites,
    loadAllData,
    loadTemplates,
    loadGameServerMetrics,
    loadGameServerLogs,
    loadGameServerPermissions,
    loadAdditionalGameServerData,
    loadGameServer,
    loadPublicGameServer,
  };
};

export default useDataLoading;
