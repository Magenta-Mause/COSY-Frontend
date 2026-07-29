import axios from "axios";
import { startService, stopService } from "@/api/generated/backend-api.ts";
import { GameServerDtoStatus } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { notificationModal } from "@/lib/notificationModal";
import { useAppDispatch } from "@/stores/hooks.ts";
import { gameServerSliceActions } from "@/stores/slices/gameServerSlice.ts";

const useServerInteractions = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslationPrefix("toasts");

  const startServer = async (gameServerId: string, includeToastNotification?: boolean) => {
    try {
      const startPromise = startService(gameServerId);
      dispatch(gameServerSliceActions.awaitPendingUpdate(gameServerId));
      await startPromise;
      if (includeToastNotification) {
        notificationModal.success({ message: t("serverStartSuccess") });
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.code === "ECONNABORTED") return;
      dispatch(
        gameServerSliceActions.setGameServerState({
          gameServerUuid: gameServerId,
          serverState: GameServerDtoStatus.FAILED,
        }),
      );
      notificationModal.error({ message: t("serverStartError", { error: String(e) }), cause: e });
    }
  };

  const stopServer = async (gameServerId: string, includeToastNotification?: boolean) => {
    try {
      const stopPromise = stopService(gameServerId, { timeout: 1000 });
      dispatch(gameServerSliceActions.awaitPendingUpdate(gameServerId));
      await stopPromise;
      if (includeToastNotification) {
        notificationModal.success({ message: t("serverStopSuccess") });
      }
    } catch (e) {
      notificationModal.error({ message: t("serverStopError", { error: String(e) }), cause: e });
    }
  };

  return { startServer, stopServer };
};

export default useServerInteractions;
