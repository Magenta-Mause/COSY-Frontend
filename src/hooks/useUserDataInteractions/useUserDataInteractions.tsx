import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAllUserInvitesQueryKey,
  useChangePasswordByAdmin,
  useChangeRole,
  useCreateInvite,
  useRevokeInvite,
  useSetCanCreateGameServers,
  useUpdateDockerLimits,
} from "@/api/generated/backend-api.ts";
import type {
  UserDockerLimitsUpdateDto,
  UserInviteCreationDto,
  UserRoleUpdateDtoRole,
} from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
import { useAppDispatch } from "@/stores/hooks.ts";
import { userInviteSliceActions } from "@/stores/slices/userInviteSlice.ts";
import { userSliceActions } from "@/stores/slices/userSlice.ts";
import type { InvalidRequestError } from "@/types/errors.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useUserDataInteractions = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: mutateCreateInvite } = useCreateInvite({
    mutation: {
      onSuccess: (data) => {
        dispatch(userInviteSliceActions.addInvite(data));
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
        notificationModal.error({
          message: t("inviteCreateError", { error: errorMessage }),
          cause: err,
        });
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

  const { mutateAsync: mutateRevokeInvite } = useRevokeInvite({
    mutation: {
      onSuccess: (_data, variables) => {
        dispatch(userInviteSliceActions.removeInvite(variables.uuid));
      },
      onError: (err) => {
        notificationModal.error({ message: t("inviteRevokeError"), cause: err });
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

  const { mutateAsync: mutateChangeRole } = useChangeRole({
    mutation: {
      onSuccess: (updatedUser) => {
        dispatch(userSliceActions.updateUser(updatedUser));
      },
    },
  });

  const changeRole = async (uuid: string, role: UserRoleUpdateDtoRole) => {
    await mutateChangeRole({ uuid, data: { role } });
  };

  const { mutateAsync: mutateUpdateDockerLimits } = useUpdateDockerLimits({
    mutation: {
      onSuccess: (updatedUser) => {
        dispatch(userSliceActions.updateUser(updatedUser));
      },
    },
  });

  const updateDockerLimits = async (uuid: string, data: UserDockerLimitsUpdateDto) => {
    await mutateUpdateDockerLimits({ uuid, data });
  };

  const { mutateAsync: mutateChangePasswordByAdmin } = useChangePasswordByAdmin({
    mutation: {
      onSuccess: () => {
        notificationModal.success({ message: t("adminChangePasswordSuccess") });
      },
      onError: (err) => {
        notificationModal.error({ message: t("adminChangePasswordError"), cause: err });
        throw err;
      },
    },
  });

  const changePasswordByAdmin = async (uuid: string, newPassword: string) => {
    await mutateChangePasswordByAdmin({ uuid, data: { new_password: newPassword } });
  };

  const { mutateAsync: mutateSetCanCreateGameServers } = useSetCanCreateGameServers({
    mutation: {
      onSuccess: (updatedUser) => {
        dispatch(userSliceActions.updateUser(updatedUser));
      },
    },
  });

  const setCanCreateGameServers = async (uuid: string, canCreate: boolean) => {
    await mutateSetCanCreateGameServers({ uuid, data: { can_create_game_servers: canCreate } });
  };

  return {
    createInvite,
    revokeInvite,
    changeRole,
    updateDockerLimits,
    changePasswordByAdmin,
    setCanCreateGameServers,
  };
};

export default useUserDataInteractions;
