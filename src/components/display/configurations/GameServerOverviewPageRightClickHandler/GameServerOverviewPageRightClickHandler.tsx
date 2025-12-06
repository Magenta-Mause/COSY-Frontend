import RightClickMenu, {
  type RightClickAction,
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";

const GameServerOverviewPageRightClickHandler = (props: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { loadGameServers } = useDataLoading();

  const actions: RightClickAction[] = [
    {
      label: t("rightClickMenu.refresh"),
      onClick: async () => {
        if (await loadGameServers()) {
          toast.success(t("toasts.refreshGameServersSuccess"));
        } else {
          toast.error(t("toasts.refreshGameServersError"));
        }
      },
    },
    {
      label: t("rightClickMenu.createNewGameserver"),
      onClick: () => {
        toast.info(t("toasts.notImplemented"));
      },
    },
  ];

  return <RightClickMenu actions={actions}>{props.children}</RightClickMenu>;
};

export default GameServerOverviewPageRightClickHandler;
