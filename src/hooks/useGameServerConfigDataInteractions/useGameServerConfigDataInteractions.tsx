import { useAppDispatch } from "@/stores/hooks.ts";
import {
  useUpdateDesign,
  useUpdateMetricLayout,
  useUpdatePrivateDashboard,
  useUpdatePublicDashboardLayout,
  useUpdateRconConfiguration,
} from "@/api/generated/backend-api.ts";
import type {
  GameServerDesignUpdateDtoDesign,
  GameServerDto,
  MetricLayout,
  PrivateDashboardLayout,
  PublicDashboard,
  RCONConfiguration,
} from "@/api/generated/model";
import { notificationModal } from "@/lib/notificationModal";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";
import useTranslationPrefix from "../useTranslationPrefix/useTranslationPrefix";

const useGameServerConfigDataInteractions = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslationPrefix("toasts");

  const { mutateAsync: updateRconConfigurationMutateAsync } = useUpdateRconConfiguration({
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

  const updateRconConfiguration = async (uuid: string, rconConfiguration: RCONConfiguration) => {
    return await updateRconConfigurationMutateAsync({
      uuid,
      data: rconConfiguration,
    });
  };

  const { mutateAsync: updateGameServerDesignMutateAsync } = useUpdateDesign({
    mutation: {
      onSuccess: (updatedGameServer: GameServerDto) => {
        dispatch(gameServerSliceActions.updateGameServer(updatedGameServer));
        notificationModal.success({ message: t("updateGameServerSuccess") });
      },
      onError: (err: unknown) => {
        notificationModal.error({ message: t("updateGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const updateGameServerDesign = async (uuid: string, design: GameServerDesignUpdateDtoDesign) => {
    return await updateGameServerDesignMutateAsync({
      uuid,
      data: { design },
    });
  };

  const { mutateAsync: updateGameServerPublicDashboardConfiguration } =
    useUpdatePublicDashboardLayout({
      mutation: {
        onSuccess: (_, query) => {
          dispatch(
            gameServerSliceActions.updatePublicDashboard({
              gameServerUuid: query.uuid,
              publicDashboard: query.data,
            }),
          );
          notificationModal.success({ message: t("updateGameServerSuccess") });
        },
        onError: (err: unknown) => {
          notificationModal.error({ message: t("updateGameServerError"), cause: err });
          throw err;
        },
      },
    });

  const updateGameServerPublicDashboard = async (
    uuid: string,
    publicDashboard: PublicDashboard,
  ) => {
    return await updateGameServerPublicDashboardConfiguration({ uuid, data: publicDashboard });
  };

  const { mutateAsync: updateGameServerMetricLayoutConfiguration } = useUpdateMetricLayout({
    mutation: {
      onSuccess: (_, query) => {
        dispatch(
          gameServerSliceActions.updateMetricLayout({
            gameServerUuid: query.uuid,
            metricLayout: query.data,
          }),
        );
        notificationModal.success({ message: t("updateGameServerSuccess") });
      },
      onError: (err: unknown) => {
        notificationModal.error({ message: t("updateGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const updateGameServerMetricLayout = async (uuid: string, publicDashboard: MetricLayout[]) => {
    return await updateGameServerMetricLayoutConfiguration({ uuid, data: publicDashboard });
  };

  const { mutateAsync: updatePrivateDashboard } = useUpdatePrivateDashboard({
    mutation: {
      onSuccess: (_, query) => {
        dispatch(
          gameServerSliceActions.updatePrivateDashboard({
            gameServerUuid: query.uuid,
            privateDashboard: query.data,
          }),
        );
        notificationModal.success({ message: t("updateGameServerSuccess") });
      },
      onError: (err: unknown) => {
        notificationModal.error({ message: t("updateGameServerError"), cause: err });
        throw err;
      },
    },
  });

  const updateGameServerPrivateDashboard = async (
    uuid: string,
    privateDashboard: PrivateDashboardLayout[],
  ) => {
    return await updatePrivateDashboard({ uuid, data: privateDashboard });
  };

  return {
    updateRconConfiguration,
    updateGameServerDesign,
    updateGameServerPublicDashboard,
    updateGameServerMetricLayout,
    updateGameServerPrivateDashboard,
  };
};

export default useGameServerConfigDataInteractions;
