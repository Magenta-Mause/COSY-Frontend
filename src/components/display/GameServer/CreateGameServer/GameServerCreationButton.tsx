import { useContext } from "react";
import { GameServerCreationContext } from "@/components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { Button } from "@/components/ui/button.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const GameServerCreationButton = () => {
  const { triggerNextPage, isPageValid, currentPage, creationState } =
    useContext(GameServerCreationContext);
  const { t } = useTranslationPrefix("components.CreateGameServer");
  const isDisabled = !isPageValid[currentPage];

  const buttonLabel = (() => {
    switch (currentPage) {
      case 0:
        return "useNoTemplate";
      case 1:
        return creationState.utilState.selectedTemplate ? "useTemplate" : "useNoTemplate";
      default:
        return "createServerButton";
    }
  })();

  const disabledTooltip = (() => {
    if (!isDisabled) return undefined;
    switch (currentPage) {
      case 1:
        return t("disabledTooltip.step2");
      default:
        return t("disabledTooltip.step3");
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
