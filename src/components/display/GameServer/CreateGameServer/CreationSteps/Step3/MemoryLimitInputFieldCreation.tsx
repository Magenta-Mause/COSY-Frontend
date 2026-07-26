import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "@/components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@/components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { MemoryLimitInput } from "@/components/display/MemoryLimit/MemoryLimitInput.tsx";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  MEMORY_LIMIT_MIN_ERROR,
  memoryLimitValidator,
} from "@/lib/validators/memoryLimitValidator.ts";

interface MemoryLimitInputFieldCreationProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
}

const validateMemoryLimit = (
  value: string | undefined | null,
  optional: boolean,
  defaultErrorLabel: string,
): { isValid: boolean; errorMessage: string } => {
  if (value === "" || value === null || value === undefined) {
    return {
      isValid: optional,
      errorMessage: defaultErrorLabel,
    };
  }

  const validationResult = memoryLimitValidator.safeParse(value);
  let errorMessage = defaultErrorLabel;

  if (!validationResult.success && typeof value === "string") {
    const specificError = MEMORY_LIMIT_MIN_ERROR;
    if (specificError) {
      errorMessage = specificError;
    }
  }

  return {
    isValid: validationResult.success,
    errorMessage,
  };
};

const MemoryLimitInputFieldCreation = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
}: MemoryLimitInputFieldCreationProps) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );
  const [errorMessage, setErrorMessage] = useState<string>(errorLabel);

  const attribute = "docker_max_memory" as keyof GameServerCreationFormState;
  const isError = attributesTouched[attribute] && !attributesValid[attribute];

  useEffect(() => {
    if (!optional) {
      const value = creationState.gameServerState[attribute] as string | undefined;
      setAttributeTouched(attribute, true);

      const { isValid, errorMessage } = validateMemoryLimit(value, optional, errorLabel);

      setErrorMessage(errorMessage);
      setAttributeValid(attribute, isValid);
    }
  }, [
    optional,
    creationState.gameServerState,
    attribute,
    setAttributeTouched,
    setAttributeValid,
    errorLabel,
  ]);

  useEffect(() => {
    if (optional) {
      const value = creationState.gameServerState[attribute] as string | undefined;

      const { isValid, errorMessage } = validateMemoryLimit(value, optional, errorLabel);

      setErrorMessage(errorMessage);
      setAttributeValid(attribute, isValid);
      setAttributeTouched(attribute, true);
    }
  }, [
    optional,
    attribute,
    setAttributeValid,
    setAttributeTouched,
    creationState.gameServerState,
    errorLabel,
  ]);

  const changeCallback = useCallback(
    (value: string) => {
      const valToSend = value === "" ? undefined : value;
      setGameServerState(attribute)(
        valToSend as GameServerCreationFormState[keyof GameServerCreationFormState],
      );

      const { isValid, errorMessage } = validateMemoryLimit(value, optional, errorLabel);

      setErrorMessage(errorMessage);
      setAttributeValid(attribute, isValid);
      setAttributeTouched(attribute, true);
    },
    [optional, attribute, setAttributeTouched, setAttributeValid, setGameServerState, errorLabel],
  );

  return (
    <div>
      <MemoryLimitInput
        id={attribute}
        data-testid={`create-field-${attribute}`}
        header={label}
        isRequired={!optional}
        error={isError ? errorMessage : undefined}
        placeholder={placeholder}
        value={creationState.gameServerState[attribute] as string | number | undefined}
        onChange={(val) => changeCallback(val)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerNextPage();
          }
        }}
        description={description}
      />
    </div>
  );
};

export default MemoryLimitInputFieldCreation;
