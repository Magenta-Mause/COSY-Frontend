import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

export const GameServerCreationPageContext = createContext<GameServerCreationPageContextType>({
  attributesValid: {},
  setAttributeValid: () => {},
  attributesTouched: {},
  setAttributeTouched: () => {},
});

export interface GameServerCreationPageContextType {
  attributesValid: Partial<{
    [K in keyof GameServerCreationFormState]: boolean;
  }>;
  setAttributeValid: (attribute: keyof GameServerCreationFormState, valid: boolean) => void;
  attributesTouched: Partial<{
    [K in keyof GameServerCreationFormState]: boolean;
  }>;
  setAttributeTouched: (attribute: keyof GameServerCreationFormState, touched: boolean) => void;
}

const GenericGameServerCreationPage = (props: { children: ReactNode; extraValid?: boolean }) => {
  const { extraValid = true } = props;
  const { setCurrentPageValid } = useContext(GameServerCreationContext);
  const [attributesValid, setAttributesValid] = useState<
    Partial<{
      [K in keyof GameServerCreationFormState]: boolean;
    }>
  >({});
  const [attributesTouched, setAttributesTouched] = useState<
    Partial<{
      [K in keyof GameServerCreationFormState]: boolean;
    }>
  >({});
  const setAttributeValid = useCallback(
    (attribute: keyof GameServerCreationFormState, valid: boolean) => {
      setAttributesValid((prev) => ({ ...prev, [attribute]: valid }));
    },
    [],
  );

  const setAttributeTouched = useCallback(
    (attribute: keyof GameServerCreationFormState, touched: boolean) => {
      setAttributesTouched((prev) => ({ ...prev, [attribute]: touched }));
    },
    [],
  );

  useEffect(() => {
    const allValid = Object.values(attributesValid).every((isValid) => isValid);
    const allTouched = Object.values(attributesTouched).every((isTouched) => isTouched);
    setCurrentPageValid(allValid && allTouched && extraValid);
  }, [attributesValid, attributesTouched, setCurrentPageValid, extraValid]);

  return (
    <GameServerCreationPageContext.Provider
      value={{
        attributesValid,
        attributesTouched,
        setAttributeValid,
        setAttributeTouched,
      }}
    >
      <div className="flex flex-col gap-6 pb-4">{props.children}</div>
    </GameServerCreationPageContext.Provider>
  );
};

export default GenericGameServerCreationPage;
