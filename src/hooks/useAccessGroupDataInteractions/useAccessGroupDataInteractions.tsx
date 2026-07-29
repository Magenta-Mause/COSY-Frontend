import {
  useCreateGameServerAccessGroup,
  useDeleteGameServerAccessGroup,
  useUpdateGameServerAccessGroups,
} from "@/api/generated/backend-api.ts";
import type { AccessGroupCreationDto, AccessGroupUpdateDto } from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
import { useAppDispatch } from "@/stores/hooks.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useAccessGroupDataInteractions = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: createGameServerAccessGroupMutateAsync } = useCreateGameServerAccessGroup({
    mutation: {
      onSuccess: (createdAccessGroup) => {
        dispatch(
          gameServerSliceActions.addGameServerAccessGroup({
            gameServerUuid: createdAccessGroup.game_server_uuid,
            accessGroup: createdAccessGroup,
          }),
        );
      },
      onError: (err) => {
        notificationModal.error({ message: t("updateGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const createGameServerAccessGroup = async (
    gameServerUuid: string,
    accessGroupCreationDto: AccessGroupCreationDto,
  ) => {
    return await createGameServerAccessGroupMutateAsync({
      uuid: gameServerUuid,
      data: accessGroupCreationDto,
    });
  };

  const { mutateAsync: deleteGameServerAccessGroupMutateAsync } = useDeleteGameServerAccessGroup({
    mutation: {
      onSuccess: (_, props) => {
        dispatch(
          gameServerSliceActions.removeGameServerAccessGroup({
            gameServerUuid: props.uuid,
            accessGroupUuid: props.accessGroupUuid,
          }),
        );
        notificationModal.success({ message: t("updateGameServerSuccess") });
      },
      onError: (err) => {
        notificationModal.error({ message: t("updateGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const deleteGameServerAccessGroup = async (gameServerUuid: string, accessGroupUuid: string) => {
    return await deleteGameServerAccessGroupMutateAsync({
      uuid: gameServerUuid,
      accessGroupUuid: accessGroupUuid,
    });
  };

  const { mutateAsync: updateGameServerAccessGroupsMutateAsync } = useUpdateGameServerAccessGroups({
    mutation: {
      onSuccess: (updatedAccessGroups, props) => {
        dispatch(
          gameServerSliceActions.updateGameServerAccessGroups({
            gameServerUuid: props.uuid,
            newAccessGroups: updatedAccessGroups,
          }),
        );
        notificationModal.success({ message: t("updateGameServerSuccess") });
      },
      onError: (err) => {
        notificationModal.error({ message: t("updateGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const updateGameServerAccessGroups = async (
    gameServerUuid: string,
    accessGroupUuid: string,
    accessGroupUpdateDto: AccessGroupUpdateDto,
  ) => {
    return await updateGameServerAccessGroupsMutateAsync({
      uuid: gameServerUuid,
      accessGroupUuid: accessGroupUuid,
      data: accessGroupUpdateDto,
    });
  };

  return {
    createGameServerAccessGroup,
    deleteGameServerAccessGroup,
    updateGameServerAccessGroups,
  };
};

export default useAccessGroupDataInteractions;
