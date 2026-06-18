import { Button } from "@components/ui/button.tsx";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field.tsx";
import Icon from "@components/ui/Icon.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper.tsx";
import { type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v7 as generateUuid } from "uuid";
import attentionIcon from "@/assets/icons/attention.webp";
import plusIcon from "@/assets/icons/plus.webp";
import trashIcon from "@/assets/icons/trash.webp";
import {
  GameServerCreationContext,
  type GameServerCreationFormState,
} from "./CreateGameServerModal.tsx";
import { GameServerCreationPageContext } from "./GenericGameServerCreationPage.tsx";

interface Props<T extends { uuid: string }> {
  attribute: keyof GameServerCreationFormState;
  onChange?: (vals: T[]) => void;
  checkValidity: (val: T) => boolean;
  errorLabel: string;
  fieldLabel: ReactNode;
  computeValue: (vals: T[]) => GameServerCreationFormState[keyof GameServerCreationFormState];
  fieldDescription: ReactNode;
  renderRow: (changeCallback: (newVal: T) => void, rowError: boolean) => (item: T) => ReactNode;
  defaultNewItem?: () => Partial<T>;
  parseInitialValue?: (
    contextValue: GameServerCreationFormState[keyof GameServerCreationFormState],
  ) => T[];
}

function ListInput<T extends { uuid: string }>({
  onChange,
  attribute,
  errorLabel,
  fieldDescription,
  fieldLabel,
  checkValidity,
  computeValue,
  renderRow,
  defaultNewItem,
  parseInitialValue,
}: Props<T>) {
  const { t } = useTranslation();
  const { setGameServerState, creationState } = useContext(GameServerCreationContext);
  const { setAttributeTouched, setAttributeValid, attributesTouched } = useContext(
    GameServerCreationPageContext,
  );
  const [rowErrors, setRowErrors] = useState<{ [uuid: string]: boolean }>({});

  // Initialize from context if values exist, otherwise use default
  const getInitialValues = (): T[] => {
    const contextValue = creationState.gameServerState[attribute];
    if (contextValue && parseInitialValue) {
      return parseInitialValue(contextValue);
    }
    return [
      {
        ...(defaultNewItem ? defaultNewItem() : {}),
        uuid: generateUuid(),
      } as T,
    ];
  };

  const [values, setValuesInternal] = useState<T[]>(getInitialValues);

  // Track the last synced context value to avoid infinite loops
  const lastSyncedValueRef = useRef<string | null>(null);
  // Track if we're currently updating from user input (to prevent sync loop)
  const isUserInputRef = useRef<boolean>(false);
  // Track if we've initialized validation
  const initializedRef = useRef<boolean>(false);

  // Initialize validation state on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;

      // Validate the initial values
      const newRowErrors: { [uuid: string]: boolean } = {};
      values.forEach((item) => {
        newRowErrors[item.uuid] = !checkValidity(item);
      });

      const allValid = Object.values(newRowErrors).filter((err) => err).length === 0;
      setAttributeValid(attribute, allValid);

      setAttributeTouched(attribute, true);
    }
  }, [values, checkValidity, attribute, setAttributeValid, setAttributeTouched]);

  // Sync local state when context changes (e.g., template applied)
  useEffect(() => {
    // Don't sync if the change came from user input
    if (isUserInputRef.current) {
      isUserInputRef.current = false;
      return;
    }

    const contextValue = creationState.gameServerState[attribute];
    if (contextValue && parseInitialValue) {
      // Serialize context value to check if it changed
      const contextValueStr = JSON.stringify(contextValue);

      // Only update if the context value actually changed
      if (contextValueStr !== lastSyncedValueRef.current) {
        lastSyncedValueRef.current = contextValueStr;
        const parsedValues = parseInitialValue(contextValue);
        setValuesInternal(parsedValues);

        // Validate the new values
        const newRowErrors: { [uuid: string]: boolean } = {};
        parsedValues.forEach((item) => {
          newRowErrors[item.uuid] = !checkValidity(item);
        });
        setRowErrors(newRowErrors);
        setAttributeValid(attribute, Object.values(newRowErrors).filter((err) => err).length === 0);
        setAttributeTouched(attribute, true);
      }
    }
  }, [
    creationState.gameServerState,
    attribute,
    parseInitialValue,
    checkValidity,
    setAttributeValid,
    setAttributeTouched,
  ]);

  const setValues = useCallback(
    (callback: (prevVals: T[]) => T[]) => {
      // Mark that this change is from user input
      isUserInputRef.current = true;

      const newVal = callback(values);
      setValuesInternal(newVal);
      setGameServerState(attribute)(computeValue(newVal));
      setAttributeTouched(attribute, true);

      const newRowErrors: { [uuid: string]: boolean } = {};
      newVal.forEach((item, _index) => {
        newRowErrors[item.uuid] = !checkValidity(item);
      });
      setRowErrors(newRowErrors);
      setAttributeValid(attribute, Object.values(newRowErrors).filter((err) => err).length === 0);
      if (onChange) {
        onChange(newVal);
      }

      // Update the last synced value to match what we just set in context
      lastSyncedValueRef.current = JSON.stringify(computeValue(newVal));
    },
    [
      attribute,
      checkValidity,
      computeValue,
      onChange,
      setAttributeTouched,
      setAttributeValid,
      setGameServerState,
      values,
    ],
  );

  const changeCallback = useCallback(
    (uuid: string) => (value: T) => {
      const newVals = values.map((item) => (item.uuid === uuid ? value : item));
      setValues(() => newVals);
    },
    [values, setValues],
  );

  const removeValue = useCallback(
    (uuid: string) => {
      setValues((prev) => prev.filter((pair) => pair.uuid !== uuid));
    },
    [setValues],
  );

  const addNewValue = useCallback(() => {
    setValues((prev) => [
      ...prev,
      { ...(defaultNewItem ? defaultNewItem() : {}), uuid: generateUuid() } as T,
    ]);
  }, [setValues, defaultNewItem]);

  return (
    <Field>
      <FieldLabel className="font-bold" htmlFor="key-value-input">
        {fieldLabel}
      </FieldLabel>

      <div className="space-y-2 w-full">
        {values.map((keyValuePair, index) => {
          const rowError = attributesTouched[attribute] && rowErrors[keyValuePair.uuid];
          return (
            <div key={keyValuePair.uuid} className="flex items-center gap-2 w-full h-fit">
              {renderRow(changeCallback(keyValuePair.uuid), rowError ?? false)(keyValuePair)}
              {index > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => removeValue(keyValuePair.uuid)}
                  className="h-9 w-9 p-0 flex items-center justify-center"
                  aria-label={t("common.removeEntry")}
                >
                  <Icon src={trashIcon} className="size-5" />
                </Button>
              )}
              {index === (values ?? []).length - 1 && (
                <Button className="h-9 w-9 p-0" onClick={addNewValue}>
                  <Icon src={plusIcon} className="size-5" />
                </Button>
              )}
              {rowError && (
                <TooltipWrapper tooltip={errorLabel} asChild>
                  <Icon src={attentionIcon} className="size-5 text-red-500 pointer-events-auto" />
                </TooltipWrapper>
              )}
            </div>
          );
        })}
      </div>
      <FieldDescription>{fieldDescription}</FieldDescription>
    </Field>
  );
}

export default ListInput;
