import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  getGetAllGameServersQueryKey,
  useDeleteGameServerById,
} from "@/api/generated/backend-api.ts";
import type { RootState } from "@/stores";
import { gameServerConfigurationSliceActions } from "@/stores/slices/gameServerConfigurationSlice.ts";

const useBackendFunctionality = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const gameServers = useSelector(
    (state: RootState) => state.gameServerConfigurationSliceReducer.data,
  );
  const { mutateAsync } = useDeleteGameServerById({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(gameServerConfigurationSliceActions.removeGameServerConfiguration(variables.uuid));
        toast.success(t("toasts.deleteGameServerSuccess"));
      },
      // If the mutation fails, show an error toast
      onError: (err) => {
        toast.error(t("toasts.deleteGameServerError"));
        // rethrow error to allow for individual error handling
        throw err;
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllGameServersQueryKey(),
        });
      },
    },
  });

  const deleteGameServer = async (uuid: string) => {
    await mutateAsync({ uuid });
  };

  return {
    deleteGameServer,
  };
};

export default useBackendFunctionality;
