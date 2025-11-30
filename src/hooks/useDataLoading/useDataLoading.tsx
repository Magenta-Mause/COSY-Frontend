import { useDispatch } from "react-redux";
import { getAllGameServers } from "@/api/generated/backend-api.ts";
import { gameServerConfigurationSliceActions } from "@/stores/slices/gameServerConfigurationSlice.ts";

const useDataLoading = () => {
  const dispatch = useDispatch();

  const loadGameServers = async () => {
    dispatch(gameServerConfigurationSliceActions.setState("loading"));
    try {
      const gameServers = await getAllGameServers();
      dispatch(gameServerConfigurationSliceActions.setState("idle"));
      dispatch(
        gameServerConfigurationSliceActions.setGameServerConfigurations(
          gameServers
        )
      );
    } catch {
      dispatch(gameServerConfigurationSliceActions.setState("failed"));
    }
  };

  return {
    loadGameServers,
  };
};

export default useDataLoading;
