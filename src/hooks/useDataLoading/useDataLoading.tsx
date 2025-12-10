import { useDispatch } from "react-redux";
import {
  getAllGameServers,
  getAllUserEntities,
  getAllUserInvites,
} from "@/api/generated/backend-api.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import { userSliceActions } from "@/stores/slices/userSlice.ts";

const useDataLoading = () => {
  const dispatch = useDispatch();

  const loadGameServers = async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServer(gameServers));
      return true;
    } catch {
      dispatch(gameServerSliceActions.setState("failed"));
      return false;
    }
  };

  const loadUsers = async () => {
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
  };

  const loadInvites = async () => {
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
  };

  const loadAllData = async () => {
    const results = await Promise.allSettled([
      loadGameServers(),
      loadUsers(),
      loadInvites(),
    ]);

    const summary = {
      gameServers: results[0].status === "fulfilled" && results[0].value === true,
      users: results[1].status === "fulfilled" && results[1].value === true,
      invites: results[2].status === "fulfilled" && results[2].value === true,
    };

    results.forEach((result, idx) => {
      if (result.status === "rejected") {
        const names = ["gameServers", "users", "invites"];
        console.error(`Failed to load ${names[idx]}:`, result.reason);
      }
    });

    return summary;
  };

  return {
    loadGameServers,
    loadUsers,
    loadInvites,
    loadAllData,
  };
};

export default useDataLoading;
