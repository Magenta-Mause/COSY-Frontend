import { GameServerCreationContext } from "@components/CreateGameServer/CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "@components/CreateGameServer/GenericGameServerCreationPage.tsx";
import { FieldError } from "@components/ui/field";
import { Input } from "@components/ui/input.tsx";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useCallback, useContext, useEffect } from "react";
import type { ZodType } from "zod";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto";

const GenericGameServerCreationInputField = (props: {
  attribute: keyof GameServerCreationDto;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
}) => {
  const { setGameServerState, gameServerState } = useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched, attributesValid } = useContext(
    GameServerCreationPageContext,
  );

  const isError = attributesTouched[props.attribute] && !attributesValid[props.attribute];

  useEffect(() => {
    setAttributeTouched(props.attribute, gameServerState[props.attribute] !== undefined);
    setAttributeValid(
      props.attribute,
      props.validator.safeParse(gameServerState[props.attribute]).success,
    );
  }, [gameServerState, props.attribute, setAttributeTouched, setAttributeValid, props.validator]);

  const changeCallback = useCallback(
    (value: string) => {
      setGameServerState(props.attribute)(value);
      setAttributeValid(props.attribute, props.validator.safeParse(value).success);
      setAttributeTouched(props.attribute, true);
    },
    [
      props.attribute,
      props.validator.safeParse,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
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
        value={gameServerState[props.attribute] as string | number | undefined}
      />
      {props.description && <DialogDescription>{props.description}</DialogDescription>}
      {isError && <FieldError>{props.errorLabel}</FieldError>}
    </div>
  );
};

export default GenericGameServerCreationInputField;
