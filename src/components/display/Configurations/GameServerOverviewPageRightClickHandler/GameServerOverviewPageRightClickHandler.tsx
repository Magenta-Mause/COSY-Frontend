import RightClickMenu, {
  type RightClickAction,
} from "@/components/display/Configurations/RightClickMenu/RightClickMenu.tsx";
import CreateGameServer from "@/components/display/GameServer/CreateGameServer/CreateGameServer";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { ThemeContext, ThemeOptions } from "@/components/technical/Providers/ThemeProvider.tsx";
import { type ReactNode, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";
import { notificationModal } from "@/lib/notificationModal";

const GameServerOverviewPageRightClickHandler = (props: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { loadGameServers } = useDataLoading();
  const { authorized, canCreateGameServers } = useContext(AuthContext);
  const { selectedTheme, setTheme } = useContext(ThemeContext);

  const [openIsGameServerCreationModalOpen, setIsOpenGameServerCreationModalOpen] = useState(false);

  const actions: RightClickAction[] = [
    {
      label: t("rightClickMenu.refresh"),
      onClick: async () => {
        if (await loadGameServers()) {
        } else {
          notificationModal.error({ message: t("toasts.refreshGameServersError") });
        }
      },
    },
    {
      label: t("rightClickMenu.theme"),
      value: selectedTheme ?? "",
      children: [
        {
          label: t("rightClickMenu.themes.auto"),
          tooltip: t("rightClickMenu.themes.autoTooltip"),
          onClick: () => {
            setTheme(null);
          },
          value: "",
        },
        {
          label: t("rightClickMenu.themes.day"),
          onClick: () => {
            setTheme("day");
          },
          value: ThemeOptions.DAY,
        },
        {
          label: t("rightClickMenu.themes.night"),
          onClick: () => {
            setTheme("night");
          },
          value: ThemeOptions.NIGHT,
        },
      ],
    },
    ...(authorized
      ? [
          {
            label: t("rightClickMenu.createNewGameServer"),
            onClick: canCreateGameServers
              ? () => setIsOpenGameServerCreationModalOpen(true)
              : undefined,
            disabled: !canCreateGameServers,
            tooltip: canCreateGameServers
              ? undefined
              : t("rightClickMenu.createNewGameServerNoPermission"),
          },
        ]
      : []),
  ];

  return (
    <RightClickMenu actions={actions}>
      <div>
        {authorized && canCreateGameServers && (
          <CreateGameServer
            isModalOpen={openIsGameServerCreationModalOpen}
            setIsModalOpen={setIsOpenGameServerCreationModalOpen}
          />
        )}
        {props.children}
      </div>
    </RightClickMenu>
  );
};

export default GameServerOverviewPageRightClickHandler;
