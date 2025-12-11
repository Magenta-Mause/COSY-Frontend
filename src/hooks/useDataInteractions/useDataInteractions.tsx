import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  type CreateGameServerMutationBody,
  getGetAllGameServersQueryKey,
  getGetAllUserInvitesQueryKey,
  useCreateGameServer,
  useCreateInvite,
  useDeleteGameServerById,
  useRevokeInvite,
} from "@/api/generated/backend-api.ts";
import type { UserInviteCreationDto } from "@/api/generated/model";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import type { InvalidRequestError } from "@/types/errors.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useDataInteractions = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: deleteGameServerById } = useDeleteGameServerById({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(gameServerSliceActions.removeGameServer(variables.uuid));
        toast.success(t("deleteGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("deleteGameServerError"));
        // rethrow error to allow for individual error handling
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

  // Invite Creation
  const { mutateAsync: mutateCreateInvite } = useCreateInvite({
    mutation: {
      onSuccess: (data) => {
        dispatch(userInviteSliceActions.addInvite(data));
        toast.success(t("inviteCreatedSuccess"));
      },
      onError: (err) => {
        const typedError = err as InvalidRequestError;
        const errorData = typedError.response?.data.data;
        let errorMessage = "Unknown Error";
        if (errorData && typeof errorData === "object") {
          const error = Object.entries(errorData)[0];
          errorMessage = error ? error[1] : "Unknown Error";
        } else if (errorData) {
          errorMessage = errorData;
        }
        toast.error(t("inviteCreateError", { error: errorMessage }));
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllUserInvitesQueryKey(),
        });
      },
    },
  });

  const createInvite = async (data: UserInviteCreationDto) => {
    return await mutateCreateInvite({ data });
  };

  // Invite Revocation
  const { mutateAsync: mutateRevokeInvite } = useRevokeInvite({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(userInviteSliceActions.removeInvite(variables.uuid));
        toast.success(t("toasts.inviteRevokedSuccess"));
      },
      onError: (err) => {
        toast.error(t("toasts.inviteRevokeError"));
        throw err;
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllUserInvitesQueryKey(),
        });
      },
    },
  });

  const { mutateAsync: createGameServerMutateAsync } = useCreateGameServer({
    mutation: {
      onSuccess: (data) => {
        dispatch(gameServerSliceActions.addGameServer(data));
        toast.success(t("createGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("createGameServerError"));
        throw err;
      },
    },
  });

  const createGameServer = async (data: CreateGameServerMutationBody) => {
    return await createGameServerMutateAsync({ data });
  };

  const revokeInvite = async (uuid: string) => {
    await mutateRevokeInvite({ uuid });
  };

  return {
    deleteGameServer,
    createInvite,
    revokeInvite,
    createGameServer,
  };
};

export default useDataInteractions;
