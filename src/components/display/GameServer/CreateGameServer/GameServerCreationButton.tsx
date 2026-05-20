import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { Button } from "@components/ui/button.tsx";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const GameServerCreationButton = () => {
  const { triggerNextPage, isPageValid, currentPage, creationState } =
    useContext(GameServerCreationContext);
  const { t } = useTranslation();
  if (currentPage === 0) return null;

  const buttonLabel = (() => {
    switch (currentPage) {
      case 1:
        return creationState.utilState.selectedTemplate
          ? "components.CreateGameServer.useTemplate"
          : "components.CreateGameServer.useNoTemplate";
      default:
        return "components.CreateGameServer.createServerButton";
    }
  })();

  return (
    <Button
      type="button"
      variant="primary"
      onClick={triggerNextPage}
      disabled={!isPageValid[currentPage]}
    >
      {t(buttonLabel)}
    </Button>
  );
};

export default GameServerCreationButton;
