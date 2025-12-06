import {
  GameServerCreationContext,
  type GameServerCreationProps,
} from "@components/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/CreateGameServer/GenericGameServerCreationPage.tsx";
import { FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input.tsx";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useCallback, useContext, useEffect } from "react";
import type { ZodType } from "zod";

export enum InputType {
  TEXT = "text",
  NUMBER = "number",
}

const GenericGameServerCreationInputField = (props: {
  attribute: keyof GameServerCreationProps;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  type?: InputType;
}) => {
  const { setGameServerState } = useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );

  const isError = attributesTouched[props.attribute] && !attributesValid[props.attribute];

  useEffect(() => {
    setAttributeTouched(props.attribute, false);
  }, [props.attribute, setAttributeTouched]);

  const changeCallback = useCallback(
    (value: string) => {
      const preProcessedValue = props.type === InputType.NUMBER ? Number(value) : value;

      setGameServerState(props.attribute)(preProcessedValue);
      setAttributeValid(props.attribute, props.validator.safeParse(preProcessedValue).success);
      setAttributeTouched(props.attribute, true);
    },
    [
      props.attribute,
      props.validator.safeParse,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      props.type,
    ],
  );

  return (
    <div>
      {props.label && <label htmlFor={props.attribute}>{props.label}</label>}
      <Input
        className={isError ? "border-red-500" : ""}
        placeholder={props.placeholder}
        onChange={(e) => changeCallback(e.target.value)}
        id={props.attribute}
      />
      {props.description && <DialogDescription>{props.description}</DialogDescription>}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default GenericGameServerCreationInputField;
