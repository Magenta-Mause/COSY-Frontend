import CreateGameServer from "@components/CreateGameServer/CreateGameServer";
import RightClickMenu, {
  type RightClickAction,
} from "@components/display/configurations/RightClickMenu/RightClickMenu.tsx";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";

const GameServerOverviewPageRightClickHandler = (props: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { loadGameServers } = useDataLoading();

  const [openGameServerCreationModal, setOpenGameServerCreationModal] = useState(false);

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
        setOpenGameServerCreationModal(true);
      },
    },
  ];

  return (
    <RightClickMenu actions={actions}>
      <div>
        <CreateGameServer
          openModal={openGameServerCreationModal}
          setOpenModal={setOpenGameServerCreationModal}
        />
        {props.children}
      </div>
    </RightClickMenu>
  );
};

export default GameServerOverviewPageRightClickHandler;
