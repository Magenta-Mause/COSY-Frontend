import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { Button } from "@components/ui/button.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const GameServerCreationButton = () => {
  const { triggerNextPage, isPageValid, currentPage, creationState } =
    useContext(GameServerCreationContext);
  const { t } = useTranslation();
  const isDisabled = !isPageValid[currentPage];

  const buttonLabel = (() => {
    switch (currentPage) {
      case 0:
        return "components.CreateGameServer.useNoTemplate";
      case 1:
        return creationState.utilState.selectedTemplate
          ? "components.CreateGameServer.useTemplate"
          : "components.CreateGameServer.useNoTemplate";
      default:
        return "components.CreateGameServer.createServerButton";
    }
  })();

  const disabledTooltip = (() => {
    if (!isDisabled) return undefined;
    switch (currentPage) {
      case 1:
        return t("components.CreateGameServer.disabledTooltip.step2");
      default:
        return t("components.CreateGameServer.disabledTooltip.step3");
    }
  })();

  return (
    <TooltipWrapper tooltip={disabledTooltip} asChild={false} triggerProps={{ asChild: true }}>
      <span className="inline-flex">
        <Button
          type="button"
          variant="primary"
          data-testid="create-server-next-btn"
          onClick={triggerNextPage}
          disabled={isDisabled}
        >
          {t(buttonLabel)}
        </Button>
      </span>
    </TooltipWrapper>
  );
};

export default GameServerCreationButton;
