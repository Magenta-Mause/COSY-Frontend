import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  getGetAllGameServersQueryKey,
  getGetAllUserInvitesQueryKey,
  useCreateInvite,
  useDeleteGameServerById,
  useRevokeInvite,
} from "@/api/generated/backend-api.ts";
import type { UserInviteCreationDto } from "@/api/generated/model";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";

const useDataInteractions = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Game Server Deletion
  const { mutateAsync: mutateDeleteGameServer } = useDeleteGameServerById({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(gameServerSliceActions.removeGameServer(variables.uuid));
        toast.success(t("toasts.deleteGameServerSuccess"));
      },
      onError: (err) => {
        toast.error(t("toasts.deleteGameServerError"));
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
    await mutateDeleteGameServer({ uuid });
  };

  // Invite Creation
  const { mutateAsync: mutateCreateInvite } = useCreateInvite({
    mutation: {
      onSuccess: (data) => {
        dispatch(userInviteSliceActions.addInvite(data));
        toast.success(t("toasts.inviteCreatedSuccess"));
      },
      onError: (err) => {
        toast.error(t("toasts.inviteCreateError"));
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

  const revokeInvite = async (uuid: string) => {
    await mutateRevokeInvite({ uuid });
  };

  return {
    deleteGameServer,
    createInvite,
    revokeInvite,
  };
};

export default useDataInteractions;
