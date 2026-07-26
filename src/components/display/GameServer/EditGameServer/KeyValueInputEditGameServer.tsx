import Icon from "@/components/ui/Icon.tsx";
import { Input } from "@/components/ui/input.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import { Fragment, useCallback, useMemo, useRef } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { v7 as generateUuid } from "uuid";
import type { ZodType } from "zod";
import infoIcon from "@/assets/icons/info.webp";
import { type InputType, preProcessInputValue } from "../CreateGameServer/utils/inputValue";
import ListInputEdit from "@/components/display/GameServer/EditGameServer/inputs/ListInputEditGameServer";

interface KeyValueItem {
  key: string;
  value: string;
  uuid: string;
}

interface Props<T> {
  value?: T[];
  setValue: (vals: T[]) => void;
  onChange?: (vals: T[]) => void;

  placeHolderKeyInput: string;
  placeHolderValueInput: string;
  fieldLabel: string;
  fieldDescription?: string;

  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;

  inputType: InputType;
  objectKey: keyof T;
  objectValue: keyof T;
  processEscapeSequences?: boolean;
}

function EditKeyValueInput<T extends Record<string, string>>({
  value,
  setValue,
  onChange,
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
}: Props<T>) {
  const { t } = useTranslationPrefix("components.CreateGameServer.keyValueInput");
  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      if (!key && !value && !required) {
        return true;
      } else if ((!key || !value) && required) {
        return false;
      }

      const preProcessedKey = preProcessInputValue(key ?? "", inputType);
      const preProcessedValue = preProcessInputValue(value ?? "", inputType);

      const keyValid = keyValidator.safeParse(preProcessedKey).success;
      const valueValid = valueValidator.safeParse(preProcessedValue).success;

      if (!required) {
        if (!key) return valueValid;
        if (!value) return keyValid;
      }

      return keyValid && valueValid;
    },
    [keyValidator, valueValidator, required, inputType],
  );

  const checkValidity = useCallback(
    (item: KeyValueItem) => validateKeyValuePair(item.key, item.value),
    [validateKeyValuePair],
  );

  const uuidPerIndexRef = useRef<string[]>([]);

  const rows = useMemo(() => {
    const vals = value ?? [];

    const uuids = uuidPerIndexRef.current;
    if (uuids.length > vals.length) {
      uuidPerIndexRef.current = uuids.slice(0, vals.length);
    }
    while (uuidPerIndexRef.current.length < vals.length) {
      uuidPerIndexRef.current.push(generateUuid());
    }

    return vals.map((v, idx) => ({
      key: String(v[objectKey] ?? ""),
      value: String(v[objectValue] ?? ""),
      uuid: uuidPerIndexRef.current[idx],
    }));
  }, [value, objectKey, objectValue]);

  return (
    <ListInputEdit<KeyValueItem>
      value={rows}
      setParentValue={(rows) => {
        setValue(
          rows?.map((row) => ({
            ...({} as T),
            [objectKey]: preProcessInputValue(row.key, inputType),
            [objectValue]: preProcessInputValue(row.value, inputType),
          })) ?? [],
        );
      }}
      onChange={(rows) => {
        const mapped = rows.map((row) => ({
          ...({} as T),
          [objectKey]: preProcessInputValue(row.key, inputType),
          [objectValue]: preProcessInputValue(row.value, inputType),
        }));
        onChange?.(mapped);
      }}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (row) => (
        <Fragment key={row.uuid}>
          <div className="flex gap-2 items-center">
            <Input
              className={rowError ? "border-red-500" : ""}
              placeholder={placeHolderKeyInput}
              value={row.key}
              onChange={(e) => changeCallback({ ...row, key: e.target.value })}
              type={inputType}
            />
            <div className="relative flex items-center gap-1">
              <Input
                className={rowError ? "border-red-500" : ""}
                placeholder={placeHolderValueInput}
                value={row.value || ""}
                onChange={(e) => changeCallback({ ...row, value: e.target.value })}
                type={inputType}
              />
              {shouldProcessEscapeSequences && (
                <TooltipWrapper
                  tooltip={t("escapeSequencesTooltip")}
                  side="top"
                  asChild={false}
                >
                  <Icon src={infoIcon} className="size-5" variant="foreground" />
                </TooltipWrapper>
              )}
            </div>
          </div>
        </Fragment>
      )}
    />
  );
}

export default EditKeyValueInput;
