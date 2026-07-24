import type { InputType } from "./KeyValueInput.tsx";
import ListInput from "./ListInput.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useCallback } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { v7 as generateUuid } from "uuid";
import type { ZodType } from "zod";
import { type PortMapping, PortMappingProtocol } from "@/api/generated/model";
import { cn } from "@/lib/utils.ts";
import type { GameServerCreationFormState } from "@/components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";

interface PortItem {
  key: string;
  value: string;
  protocol: PortMappingProtocol;
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
}

const inputType: InputType = "number";
const preProcessValue = Number;

function PortInput({
  attribute,
  placeHolderKeyInput,
  placeHolderValueInput,
  fieldLabel,
  fieldDescription,
  keyValidator,
  valueValidator,
  errorLabel,
  required,
}: Props) {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3.portSelection");
  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      if (!key && !value && !required) {
        return true;
      } else if (!key || !value) {
        return false;
      }

      const preProcessedKey = preProcessValue(key);
      const preProcessedValue = preProcessValue(value);

      const keyValid = (key: string | number) => keyValidator.safeParse(key).success;
      const valueValid = (value: string | number) => valueValidator.safeParse(value).success;

      return keyValid(preProcessedKey) && valueValid(preProcessedValue);
    },
    [keyValidator, valueValidator, required],
  );

  const checkValidity = useCallback(
    (item: PortItem) => validateKeyValuePair(item.key, item.value),
    [validateKeyValuePair],
  );

  const computeValue = useCallback((items: PortItem[]) => {
    const mappedItems: PortMapping[] = [];
    items.forEach((item) => {
      mappedItems.push({
        instance_port: preProcessValue(item.key),
        container_port: preProcessValue(item.value),
        protocol: item.protocol,
      });
    });
    return mappedItems;
  }, []);

  const parseInitialValue = useCallback(
    (contextValue: GameServerCreationFormState[keyof GameServerCreationFormState]): PortItem[] => {
      if (!contextValue || !Array.isArray(contextValue)) {
        return [];
      }
      const portMappings = contextValue as PortMapping[];
      return portMappings.map((pm) => ({
        key: String(pm.instance_port ?? ""),
        value: String(pm.container_port ?? ""),
        protocol: pm.protocol ?? PortMappingProtocol.TCP,
        uuid: generateUuid(),
      }));
    },
    [],
  );

  return (
    <ListInput
      defaultNewItem={() => ({ protocol: PortMappingProtocol.TCP })}
      attribute={attribute}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      computeValue={computeValue}
      parseInitialValue={parseInitialValue}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (keyValuePair) => (
        <>
          <Input
            className={cn(rowError ? "border-red-500" : "", "w-30")}
            id={`key-value-input-key-${keyValuePair.uuid}`}
            placeholder={placeHolderKeyInput}
            value={(keyValuePair.key as string | undefined) || ""}
            onChange={(e) => changeCallback({ ...keyValuePair, key: e.target.value })}
            type={inputType}
          />
          <Input
            className={cn(rowError ? "border-red-500" : "", "w-30")}
            id={`key-value-input-value-${keyValuePair.uuid}`}
            placeholder={placeHolderValueInput}
            value={(keyValuePair.value as string | undefined) || ""}
            onChange={(e) => {
              changeCallback({ ...keyValuePair, value: e.target.value });
            }}
            type={inputType}
          />
          <Select
            value={keyValuePair.protocol}
            onValueChange={(newVal) =>
              changeCallback({
                ...keyValuePair,
                protocol: newVal as PortMappingProtocol,
              })
            }
          >
            <SelectTrigger className={"w-20"}>
              <SelectValue
                placeholder={t("protocolPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PortMappingProtocol).map((protocol) => (
                <SelectItem value={protocol} key={protocol}>
                  {protocol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    />
  );
}

export default PortInput;
