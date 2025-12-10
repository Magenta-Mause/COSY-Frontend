import { Button } from "@components/ui/button.tsx";
import { DialogContent, DialogFooter } from "@components/ui/dialog.tsx";
import { createContext, useCallback, useState } from "react";
import type { GameServerCreationDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import Step1 from "./CreationSteps/Step1";
import Step2 from "./CreationSteps/Step2";
import Step3 from "./CreationSteps/Step3";

export interface GameServerCreationContext {
  gameServerState: Partial<GameServerCreationDto>;
  setGameServerState: <K extends keyof GameServerCreationDto>(
    gameStateKey: K,
  ) => (value: GameServerCreationDto[K]) => void;
  setCurrentPageValid: (isValid: boolean) => void;
}

export const GameServerCreationContext = createContext<GameServerCreationContext>({
  gameServerState: {},
  setGameServerState: () => () => {},
  setCurrentPageValid: () => {},
});

const PAGES = [<Step1 key="step1" />, <Step2 key="step2" />, <Step3 key="step3" />];

const CreateGameServerModal = () => {
  const { createGameServer } = useDataInteractions();
  const [gameServerState, setGameServerInternalState] = useState<Partial<GameServerCreationDto>>(
    {},
  );
  const [isPageValid, setPageValid] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const isLastPage = currentPage === PAGES.length - 1;
  const { t } = useTranslationPrefix("components.CreateGameServer");

  const handleNextPage = () => {
    if (isLastPage) {
      createGameServer(gameServerState as GameServerCreationDto);
      return;
    }

    setCurrentPage((currentPage) => currentPage + 1);
  };

  const setCurrentPageValid = useCallback(
    (isValid: boolean) => {
      setPageValid((prev) => ({ ...prev, [currentPage]: isValid }));
    },
    [currentPage],
  );

  const setGameServerState: GameServerCreationContext["setGameServerState"] = useCallback(
    (gameStateKey) => (value) =>
      setGameServerInternalState((prev) => ({ ...prev, [gameStateKey]: value })),
    [],
  );

  return (
    <DialogContent className="sm:max-w-[600px]">
      <GameServerCreationContext.Provider
        value={{
          setGameServerState,
          gameServerState,
          setCurrentPageValid,
        }}
      >
        {PAGES[currentPage]}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((currentPage) => currentPage - 1)}
            disabled={currentPage === 0}
          >
            {t("backButton")}
          </Button>
          <Button
            type="button"
            onClick={handleNextPage}
            className={
              isLastPage
                ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                : ""
            }
            disabled={!isPageValid[currentPage]}
          >
            {isLastPage ? t("createServerButton") : t("nextStepButton")}
          </Button>
        </DialogFooter>
      </GameServerCreationContext.Provider>
    </DialogContent>
  );
};

export default CreateGameServerModal;
