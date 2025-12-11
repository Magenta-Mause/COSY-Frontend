import { Button } from "@components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { CircleAlertIcon, CircleX } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { v7 as uuidv7 } from "uuid";
import type { ZodType } from "zod";
import type { GameServerCreationDto } from "@/api/generated/model/gameServerCreationDto";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { GameServerCreationContext } from "./CreateGameServerModal";
import { GameServerCreationPageContext } from "./GenericGameServerCreationPage";

// All keys must be a key of HTMLInputTypeAttribute
interface InputType {
  text: string;
  number: string;
}

interface Props {
  attribute: keyof GameServerCreationDto;
  placeHolderKeyInput: string;
  placeHolderValueInput: string;
  fieldLabel: string;
  fieldDescription: string;
  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;
  inputType: keyof InputType;
  objectKey: string; // This is the property name for the key in the object
  objectValue: string; // This is the property name for the value in the object
}

export default function KeyValueInput({
  attribute,
  placeHolderKeyInput,
  placeHolderValueInput,
  fieldLabel,
  fieldDescription,
  keyValidator,
  valueValidator,
  errorLabel,
  required,
  inputType,
  objectKey,
  objectValue,
}: Props) {
  const { setGameServerState } = useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched } = useContext(
    GameServerCreationPageContext,
  );
  const { t } = useTranslationPrefix("components.CreateGameServer");

  const [keyValuePair, setKeyValuePair] = useState<
    Array<{
      uuid: string;
      valid: boolean;
      [objectKey]?: string | number;
      [objectValue]?: string | number;
    }>
  >([{ uuid: uuidv7(), valid: !required }]);

  const preProcessValue = useCallback(
    (value: string): string | number => {
      if (inputType === "number") {
        return Number(value);
      }
      return value;
    },
    [inputType],
  );

  const preProcessKeyAndValue = useCallback(
    (key: string, value: string): [string | number, string | number] => {
      const preProcessedKey: string | number = preProcessValue(key);
      const preProcessedValue: string | number = preProcessValue(value);

      return [preProcessedKey, preProcessedValue];
    },
    [preProcessValue],
  );

  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      if (!key && !value && !required) {
        return true;
      } else if (!key || !value) {
        return false;
      }

      const [preProcessedKey, preProcessedValue] = preProcessKeyAndValue(key, value);

      const keyValid = (key: string | number) => keyValidator.safeParse(key).success;
      const valueValid = (value: string | number) => valueValidator.safeParse(value).success;

      return keyValid(preProcessedKey) && valueValid(preProcessedValue);
    },
    [keyValidator, valueValidator, required, preProcessKeyAndValue],
  );

  useEffect(() => {
    setAttributeValid(
      attribute,
      keyValuePair.every((keyValuePair) => keyValuePair.valid),
    );
  }, [attribute, keyValuePair, setAttributeValid]);

  const changeCallback = useCallback(
    (key: string, index: number) => (value: string) => {
      setKeyValuePair((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
                ...item,
                [key]: preProcessValue(value),
                valid: validateKeyValuePair(
                  key === objectKey ? value : (item[objectKey] as string | undefined),
                  key === objectValue ? value : (item[objectValue] as string | undefined),
                ),
              }
            : item,
        ),
      );
      setAttributeTouched(attribute, true);
      setGameServerState(attribute)(
        keyValuePair
          .filter((keyValuePair) => keyValuePair.valid)
          .map((keyValuePair, idx) =>
            idx === index ? { ...keyValuePair, [key]: preProcessValue(value) } : keyValuePair,
          ) as {
          [objectKey]: string;
          [objectValue]: string;
        }[],
      );
    },
    [
      attribute,
      setAttributeTouched,
      setGameServerState,
      keyValuePair,
      validateKeyValuePair,
      objectKey,
      objectValue,
      preProcessValue,
    ],
  );

  const removeValueAtIndex = useCallback((index: number) => {
    setKeyValuePair((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  return (
    <Field>
      <FieldLabel htmlFor="key-value-input">{fieldLabel}</FieldLabel>

      <div className="space-y-2 w-full">
        {keyValuePair.map((keyValuePair, index) => {
          const rowError = attributesTouched[attribute] && !keyValuePair.valid;
          return (
            <div key={keyValuePair.uuid} className="flex items-center gap-2 w-full h-fit">
              <Input
                className={rowError ? "border-red-500" : ""}
                id={`key-value-input-key-${index}`}
                placeholder={placeHolderKeyInput}
                value={(keyValuePair[objectKey] as string | undefined) || ""}
                onChange={(e) => changeCallback(objectKey, index)(e.target.value)}
                type={inputType}
              />
              <Input
                className={rowError ? "border-red-500" : ""}
                id={`key-value-input-value-${index}`}
                placeholder={placeHolderValueInput}
                value={(keyValuePair[objectValue] as string | undefined) || ""}
                onChange={(e) => changeCallback(objectValue, index)(e.target.value)}
                type={inputType}
              />
              {index > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => removeValueAtIndex(index)}
                  className="h-9 w-9 p-0 flex items-center justify-center"
                  aria-label="Remove entry"
                >
                  <CircleX className="w-full h-full" />
                </Button>
              )}

              {rowError && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleAlertIcon className="text-red-500 w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent>{errorLabel}</TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
      <Button
        className="ml-2"
        onClick={() => setKeyValuePair((prev) => [...prev, { uuid: uuidv7(), valid: true }])}
      >
        {t("keyValueInputAddButton")}
      </Button>
      <FieldDescription>{fieldDescription}</FieldDescription>
    </Field>
  );
}
