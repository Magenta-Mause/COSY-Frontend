import {Button} from "@components/ui/button.tsx";
import {DialogContent, DialogFooter} from "@components/ui/dialog.tsx";
import {createContext, useCallback, useState} from "react";
import {useTranslation} from "react-i18next";
import Step1 from "./CreationSteps/Step1";
import Step2 from "./CreationSteps/Step2";

export interface GameServerCreationContext {
    gameServerState: Partial<GameServerCreationProps>;
    setGameServerState: (
        gameStateKey: keyof GameServerCreationProps,
    ) => (value: GameServerCreationProps[keyof GameServerCreationProps]) => void;
    setCurrentPageValid: (isValid: boolean) => void;
}

export const GameServerCreationContext = createContext<GameServerCreationContext>({
    gameServerState: {},
    setGameServerState: () => () => {
    },
    setCurrentPageValid: () => {
    },
});

export interface GameServerCreationProps {
    gameUuid: string;
    serverName: string;
    template: string;
    dockerImageName: string;
    dockerImageTag: string;
    port: number;
    executionCommand: string;
    environmentVariables?: Array<{ key: string; value: string }>;
    volumeMounts?: Array<{ hostPath: string; containerPath: string }>;
}

const PAGES = [<Step1 key="step1"/>, <Step1 key="step2"/>, <Step1 key="step3"/>];

const CreateGameServerModal = () => {
    const [gameServerState, setGameServerInternalState] = useState<Partial<GameServerCreationProps>>(
        {},
    );
    const [isPageValid, setPageValid] = useState<{ [key: number]: boolean }>({});
    const [currentPage, setCurrentPage] = useState(0);
    const isLastPage = currentPage === PAGES.length - 1;
    const {t} = useTranslation();

    const handleNextPage = () => {
        if (isLastPage) {
            return;
        }

        setCurrentPage((currentPage) => currentPage + 1);
    };

    const setCurrentPageValid = useCallback((isValid: boolean) => {
        setPageValid((prev) => ({...prev, [currentPage]: isValid}));
    }, [currentPage]);

    const setGameServerState: GameServerCreationContext["setGameServerState"] =
        useCallback((gameStateKey) => (value) =>
            setGameServerInternalState(prev => ({...prev, [gameStateKey]: value})), []);

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
                        {t("components.CreateGameServer.backButton")}
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
                        {isLastPage
                            ? t("components.CreateGameServer.createServerButton")
                            : t("components.CreateGameServer.nextStepButton")}
                    </Button>
                </DialogFooter>
            </GameServerCreationContext.Provider>
        </DialogContent>
    );
};

export default CreateGameServerModal;
