import ListInput from "@components/display/GameServer/CreateGameServer/ListInput.tsx";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { Fragment, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { v7 as generateUuid } from "uuid";
import type { ZodType } from "zod";
import infoIcon from "@/assets/icons/info.webp";
import type { GameServerCreationFormState } from "./CreateGameServerModal.tsx";
import { type InputType, preProcessInputValue } from "./util";

interface KeyValueItem {
  key: string;
  value: string;
  uuid: string;
}

interface Props {
  attribute: keyof GameServerCreationFormState;
  placeHolderKeyInput: string;
  placeHolderValueInput: string;
  fieldLabel: string;
  fieldDescription: string;
  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;
  inputType: InputType;
  objectKey: string;
  objectValue: string;
  processEscapeSequences?: boolean;
}

function KeyValueInput({
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
  processEscapeSequences: shouldProcessEscapeSequences = false,
}: Props) {
  const { t } = useTranslation();
  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      if (!key && !value && !required) {
        return true;
      } else if (!key || !value) {
        return false;
      }

      const preProcessedKey = preProcessInputValue(key, inputType);
      const preProcessedValue = preProcessInputValue(value, inputType);

      const keyValid = (key: string | number) => keyValidator.safeParse(key).success;
      const valueValid = (value: string | number) => valueValidator.safeParse(value).success;

      return keyValid(preProcessedKey) && valueValid(preProcessedValue);
    },
    [keyValidator, valueValidator, required, inputType],
  );

  const checkValidity = useCallback(
    (item: KeyValueItem) => validateKeyValuePair(item.key, item.value),
    [validateKeyValuePair],
  );

  const computeValue = useCallback(
    (items: KeyValueItem[]) => {
      const mappedItems: { [objectKey]: string | number; [objectValue]: string | number }[] = [];
      items.forEach((item) => {
        mappedItems.push({
          [objectKey]: preProcessInputValue(item.key, inputType),
          [objectValue]: preProcessInputValue(item.value, inputType),
        });
      });
      return mappedItems as unknown as GameServerCreationFormState[keyof GameServerCreationFormState];
    },
    [inputType, objectKey, objectValue],
  );

  const parseInitialValue = useCallback(
    (
      contextValue: GameServerCreationFormState[keyof GameServerCreationFormState],
    ): KeyValueItem[] => {
      if (!contextValue || !Array.isArray(contextValue)) {
        return [];
      }
      const items = contextValue as Array<Record<string, unknown>>;
      return items.map((item) => ({
        key: String(item[objectKey] ?? ""),
        value: String(item[objectValue] ?? ""),
        uuid: generateUuid(),
      }));
    },
    [objectKey, objectValue],
  );

  return (
    <ListInput
      attribute={attribute}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      computeValue={computeValue}
      parseInitialValue={parseInitialValue}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (keyValuePair) => (
        <Fragment key={keyValuePair.uuid}>
          <Input
            className={rowError ? "border-red-500" : ""}
            id={`key-value-input-key-${keyValuePair.uuid}`}
            placeholder={placeHolderKeyInput}
            value={(keyValuePair.key as string | undefined) || ""}
            onChange={(e) => changeCallback({ ...keyValuePair, key: e.target.value })}
            type={inputType}
          />
          <div className="relative flex items-center gap-1">
            <Input
              className={rowError ? "border-red-500" : ""}
              id={`key-value-input-value-${keyValuePair.uuid}`}
              placeholder={placeHolderValueInput}
              value={(keyValuePair.value?.replaceAll("\n", "\\n") as string | undefined) || ""}
              onChange={(e) => {
                changeCallback({ ...keyValuePair, value: e.target.value });
              }}
              type={inputType}
            />
            {shouldProcessEscapeSequences && (
              <TooltipWrapper
                tooltip={t("components.CreateGameServer.keyValueInput.escapeSequencesTooltip")}
                side="top"
                asChild={false}
                triggerProps={{ className: "flex" }}
              >
                <Icon src={infoIcon} className="size-5" variant="foreground" />
              </TooltipWrapper>
            )}
          </div>
        </Fragment>
      )}
    />
  );
}

export type { InputType };

export default KeyValueInput;
