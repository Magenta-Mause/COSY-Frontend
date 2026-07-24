import { CpuLimitInput } from "@/components/display/CpuLimit/CpuLimitInput.tsx";
import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "@/components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@/components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { useCallback, useContext, useEffect, useState } from "react";
import { CPU_LIMIT_POSITIVE_ERROR, cpuLimitValidator } from "@/lib/validators/cpuLimitValidator.ts";

interface CpuLimitInputFieldProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
}

const validateCpuLimit = (
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

  const validationResult = cpuLimitValidator.safeParse(value);
  let errorMessage = defaultErrorLabel;

  if (!validationResult.success) {
    errorMessage = CPU_LIMIT_POSITIVE_ERROR;
  }

  return {
    isValid: validationResult.success,
    errorMessage,
  };
};

const CpuLimitInputField = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
}: CpuLimitInputFieldProps) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );
  const [errorMessage, setErrorMessage] = useState<string>(errorLabel);

  const attribute = "docker_max_cpu" as keyof GameServerCreationFormState;
  const isError = attributesTouched[attribute] && !attributesValid[attribute];

  useEffect(() => {
    if (!optional) {
      const value = creationState.gameServerState[attribute] as string | undefined;
      setAttributeTouched(attribute, true);

      const { isValid, errorMessage } = validateCpuLimit(value, optional, errorLabel);

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

      const { isValid, errorMessage } = validateCpuLimit(value, optional, errorLabel);

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

      const { isValid, errorMessage } = validateCpuLimit(value, optional, errorLabel);

      setErrorMessage(errorMessage);
      setAttributeValid(attribute, isValid);
      setAttributeTouched(attribute, true);
    },
    [optional, attribute, setAttributeTouched, setAttributeValid, setGameServerState, errorLabel],
  );

  return (
    <div>
      <CpuLimitInput
        id={attribute}
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

export default CpuLimitInputField;
