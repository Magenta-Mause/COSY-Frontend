import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/display/GameServer/CreateGameServer/GenericGameServerCreationPage.tsx";
import { Input } from "@components/ui/input.tsx";
import RequiredMark from "@components/ui/RequiredMark.tsx";
import { useCallback, useContext, useEffect } from "react";
import type { ZodType } from "zod";

const GenericGameServerCreationInputField = (props: {
  attribute: keyof GameServerCreationFormState;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
  inputType?: React.ComponentProps<"input">["type"];
  inputMode?: React.ComponentProps<"input">["inputMode"];
  step?: React.ComponentProps<"input">["step"];
}) => {
  const { setGameServerState, creationState, triggerNextPage } =
    useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );

  const isError = attributesTouched[props.attribute] && !attributesValid[props.attribute];

  useEffect(() => {
    const value = creationState.gameServerState[props.attribute];
    const isEmpty = value === "" || value === null || value === undefined;

    // Optional fields are always considered "touched" even when empty
    // Required fields are only touched when they have a value
    setAttributeTouched(
      props.attribute,
      (value !== undefined || (props.optional && isEmpty)) ?? false,
    );

    // If optional and empty, it's valid
    if (props.optional && isEmpty) {
      setAttributeValid(props.attribute, true);
      return;
    }

    // If value is provided (or required), validate it
    const isValid = isEmpty ? false : props.validator.safeParse(value).success;
    setAttributeValid(props.attribute, isValid);
  }, [
    props.optional,
    creationState.gameServerState,
    props.attribute,
    setAttributeTouched,
    setAttributeValid,
    props.validator,
  ]);

  const changeCallback = useCallback(
    (value: string) => {
      if (value === "" && props.defaultValue !== undefined)
        return setGameServerState(props.attribute)(props.defaultValue);
      setGameServerState(props.attribute)(value);

      const isEmpty = value === "";

      // Validate: empty is OK when optional, otherwise validate
      const isValid =
        props.optional && isEmpty
          ? true
          : isEmpty
            ? false
            : props.validator.safeParse(value).success;

      setAttributeValid(props.attribute, isValid);
      setAttributeTouched(props.attribute, true);
    },
    [
      props.optional,
      props.attribute,
      props.validator,
      props.defaultValue,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
    ],
  );

  useEffect(() => {
    if (props.defaultValue !== undefined) {
      changeCallback(props.defaultValue);
    }
  }, [changeCallback, props.defaultValue]);

  return (
    <div>
      <Input
        error={isError ? props.errorLabel : undefined}
        description={props.description}
        header={
          props.label ? (
            props.optional ? (
              props.label
            ) : (
              <>
                {props.label} <RequiredMark />
              </>
            )
          ) : undefined
        }
        placeholder={props.placeholder}
        type={props.inputType}
        inputMode={props.inputMode}
        step={props.step}
        onChange={(e) => changeCallback(e.target.value)}
        id={props.attribute}
        data-testid={`create-field-${props.attribute}`}
        value={creationState.gameServerState[props.attribute] as string | number | undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerNextPage();
          }
        }}
      />
    </div>
  );
};

export default GenericGameServerCreationInputField;
