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
  const { mutate } = useDeleteGameServerById({
    mutation: {
      onMutate: async (variables) => {
        const deletedUuid = variables.uuid;
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({
          queryKey: getGetAllGameServersQueryKey(),
        });

        // Snapshot the previous value
        const previousGameServers = gameServers;

        // Optimistically update to the new value
        dispatch(gameServerConfigurationSliceActions.removeGameServerConfiguration(deletedUuid));

        // Return a context object with the snapshotted value
        return { previousGameServers };
      },
      onSuccess: () => {
        toast.success(t("toasts.deleteGameServerSuccess"));
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (_err, _variables, context) => {
        if (context?.previousGameServers) {
          dispatch(
            gameServerConfigurationSliceActions.setGameServerConfigurations(
              context.previousGameServers,
            ),
          );
        }
        toast.error(t("toasts.deleteGameServerError"));
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllGameServersQueryKey(),
        });
      },
    },
  });

  const deleteGameServer = (uuid: string) => {
    mutate({ uuid });
  };

  return {
    deleteGameServer,
  };
};

export default useBackendFunctionality;
