import { useCallback } from "react";
import {
  getAllTemplates,
  getAllUserEntities,
  getAllUserInvites,
  queryGames,
} from "@/api/generated/backend-api.ts";
import { useAppDispatch } from "@/stores/hooks.ts";
import { gameSliceActions } from "@/stores/slices/gameSlice.ts";
import { templateSliceActions } from "@/stores/slices/templateSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import { userSliceActions } from "@/stores/slices/userSlice.ts";
import useGameServerLoading from "./useGameServerLoading.ts";

const useDataLoading = () => {
  const dispatch = useAppDispatch();
  const gameServerLoading = useGameServerLoading();

  const loadGames = useCallback(async () => {
    dispatch(gameSliceActions.setState("loading"));
    try {
      const games = await queryGames({ query: "" });
      dispatch(gameSliceActions.setGames(games));
      dispatch(gameSliceActions.setState("idle"));
      return true;
    } catch (e) {
      console.error("Unexpected error while loading games", e);
      dispatch(gameSliceActions.setState("failed"));
      return false;
    }
  }, [dispatch]);

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

  const loadAllData = useCallback(
    async (isAdmin: boolean = false) => {
      const tasks = [gameServerLoading.loadGameServers(), loadTemplates(), loadGames()];
      const taskNames = ["gameServers", "templates", "games"];

      if (isAdmin) {
        tasks.push(loadUsers(), loadInvites());
        taskNames.push("users", "invites");
      }

      const results = await Promise.allSettled(tasks);

      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          console.error(`Failed to load ${taskNames[idx]}:`, result.reason);
        }
      });

      return {
        gameServers: results[0].status === "fulfilled" && results[0].value === true,
        templates: results[1].status === "fulfilled" && results[1].value === true,
        games: results[2].status === "fulfilled" && results[2].value === true,
        users:
          isAdmin && results[3]
            ? results[3].status === "fulfilled" && results[3].value === true
            : undefined,
        invites:
          isAdmin && results[4]
            ? results[4].status === "fulfilled" && results[4].value === true
            : undefined,
      };
    },
    [gameServerLoading.loadGameServers, loadTemplates, loadGames, loadUsers, loadInvites],
  );

  return {
    loadGames,
    loadUsers,
    loadInvites,
    loadAllData,
    loadTemplates,
    ...gameServerLoading,
  };
};

export default useDataLoading;
