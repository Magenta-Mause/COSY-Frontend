import {
    GameServerCreationContext,
    type GameServerCreationProps,
} from "@components/CreateGameServer/CreateGameServerModal.tsx";
import {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from "react";

export const GameServerCreationPageContext = createContext<GameServerCreationPageContextType>({
    attributesValid: {},
    setAttributeValid: () => {
    },
    attributesTouched: {},
    setAttributeTouched: () => {
    },
});

export interface GameServerCreationPageContextType {
    attributesValid: Partial<{
        [K in keyof GameServerCreationProps]: boolean;
    }>;
    setAttributeValid: (attribute: keyof GameServerCreationProps, valid: boolean) => void;
    attributesTouched: Partial<{
        [K in keyof GameServerCreationProps]: boolean;
    }>;
    setAttributeTouched: (attribute: keyof GameServerCreationProps, touched: boolean) => void;
}

const GenericGameServerCreationPage = (props: { children: ReactNode }) => {
    const {setCurrentPageValid} = useContext(GameServerCreationContext);
    const [attributesValid, setAttributesValid] = useState<
        Partial<{
            [K in keyof GameServerCreationProps]: boolean;
        }>
    >({});
    const [attributesTouched, setAttributesTouched] = useState<
        Partial<{
            [K in keyof GameServerCreationProps]: boolean;
        }>
    >({});
    const setAttributeValid = useCallback((attribute: keyof GameServerCreationProps, valid: boolean) => {
        setAttributesValid(prev => ({...prev, [attribute]: valid}));
    }, []);

    const setAttributeTouched = useCallback((attribute: keyof GameServerCreationProps, touched: boolean) => {
        setAttributesTouched(prev => ({...prev, [attribute]: touched}));
    }, []);

    useEffect(() => {
        console.log("Updating setAttributeeTouched");
    }, [setAttributeTouched, setAttributesTouched, setAttributeValid]);

    useEffect(() => {
        const allValid = Object.values(attributesValid).every((isValid) => isValid);
        const allTouched = Object.values(attributesTouched).every((isTouched) => isTouched);
        setCurrentPageValid(allValid && allTouched);
    }, [attributesValid, attributesTouched, setCurrentPageValid]);

    return (
        <GameServerCreationPageContext.Provider
            value={{
                attributesValid,
                attributesTouched,
                setAttributeValid,
                setAttributeTouched,
            }}
        >
            {props.children}
        </GameServerCreationPageContext.Provider>
    );
};

export default GenericGameServerCreationPage;
