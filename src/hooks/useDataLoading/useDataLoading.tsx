import { useDispatch } from "react-redux";
import { getAllGameServers } from "@/api/generated/backend-api.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

const useDataLoading = () => {
  const dispatch = useDispatch();

  const loadGameServers = async () => {
    dispatch(gameServerSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerSliceActions.setState("idle"));
      dispatch(gameServerSliceActions.setGameServerConfigurations(gameServers));
      return true;
    } catch {
      dispatch(gameServerSliceActions.setState("failed"));
      return false;
    }
  };

  return {
    loadGameServers,
  };
};

export default useDataLoading;
