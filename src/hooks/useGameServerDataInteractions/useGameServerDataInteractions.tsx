import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/stores/hooks.ts";
import {
  type CreateGameServerMutationBody,
  getGetAllGameServersQueryKey,
  type UpdateGameServerMutationBody,
  useCreateGameServer,
  useDeleteGameServerById,
  useTransferOwnership,
  useUpdateGameServer,
} from "@/api/generated/backend-api.ts";
import type { TransferOwnershipDto } from "@/api/generated/model";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";
import { notificationModal } from "@/lib/notificationModal";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useGameServerDataInteractions = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");
  const { loadGameServer } = useDataLoading();

  const { mutateAsync: deleteGameServerById } = useDeleteGameServerById({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(gameServerSliceActions.removeGameServer(variables.uuid));
      },
      onError: (err) => {
        notificationModal.error({ message: t("deleteGameServerError"), cause: err });
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllGameServersQueryKey(),
        });
      },
    },
  });

  const deleteGameServer = async (uuid: string) => {
    await deleteGameServerById({ uuid });
  };

  const { mutateAsync: createGameServerMutateAsync } = useCreateGameServer({
    mutation: {
      onSuccess: async (data) => {
        await loadGameServer(data.uuid);
      },
      onError: (err) => {
        notificationModal.error({ message: t("createGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const createGameServer = async (data: CreateGameServerMutationBody) => {
    return await createGameServerMutateAsync({ data });
  };

  const { mutateAsync: updateGameServerMutateAsync } = useUpdateGameServer({
    mutation: {
      onSuccess: (updatedGameServer) => {
        dispatch(gameServerSliceActions.updateGameServer(updatedGameServer));
        notificationModal.success({ message: t("updateGameServerSuccess") });
      },
      onError: (err) => {
        notificationModal.error({ message: t("updateGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const updateGameServer = async (uuid: string, data: UpdateGameServerMutationBody) => {
    return await updateGameServerMutateAsync({
      data,
      uuid,
    });
  };

  const { mutateAsync: transferOwnershipMutateAsync } = useTransferOwnership({
    mutation: {
      onSuccess: (updatedGameServer) => {
        dispatch(gameServerSliceActions.updateGameServer(updatedGameServer));
      },
      onError: (err) => {
        notificationModal.error({ message: t("serverTransferError"), cause: err });
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllGameServersQueryKey(),
        });
      },
    },
  });

  const transferOwnership = async (uuid: string, newOwnerName: TransferOwnershipDto) => {
    return await transferOwnershipMutateAsync({
      uuid,
      data: newOwnerName,
    });
  };

  return {
    deleteGameServer,
    createGameServer,
    updateGameServer,
    transferOwnership,
  };
};

export default useGameServerDataInteractions;
