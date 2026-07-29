import { useCallback, useMemo, useRef } from "react";
import { v7 as generateUuid } from "uuid";
import type { ZodType } from "zod";
import { type PortMapping, PortMappingProtocol } from "@/api/generated/model";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import ListInputEdit from "./ListInputEditGameServer";

interface PortItem {
  key: string;
  value: string;
  protocol: PortMappingProtocol;
  uuid: string;
}

interface Props {
  value?: PortMapping[];
  setValue: (vals: PortMapping[]) => void;
  onChange?: (vals: PortMapping[]) => void;

  fieldLabel: string;
  fieldDescription: string;

  keyValidator: ZodType;
  valueValidator: ZodType;
  errorLabel: string;
  required?: boolean;
}

function PortInputEditGameServer({
  value,
  setValue,
  onChange,
  fieldLabel,
  fieldDescription,
  keyValidator,
  valueValidator,
  errorLabel,
  required,
}: Props) {
  const inputType: "number" = "number";
  const { t } = useTranslationPrefix("components.editGameServer");
  const validateKeyValuePair = useCallback(
    (key?: string, value?: string) => {
      const preProcessValue = (v: string) => (v !== "" ? Number(v) : undefined);

      if (!key && !value && !required) return true;
      if (!key || !value) return false;

      return (
        keyValidator.safeParse(preProcessValue(key)).success &&
        valueValidator.safeParse(preProcessValue(value)).success
      );
    },
    [keyValidator, valueValidator, required],
  );

  const checkValidity = useCallback(
    (item: PortItem) => validateKeyValuePair(item.key, item.value),
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
      key: v.instance_port?.toString() ?? "",
      value: v.container_port?.toString() ?? "",
      protocol: v.protocol ?? PortMappingProtocol.TCP,
      uuid: uuidPerIndexRef.current[idx],
    }));
  }, [value]);

  return (
    <ListInputEdit<PortItem>
      value={rows}
      setParentValue={setValue}
      onChange={(rows) => {
        const preProcessValue = (v: string) => (v !== "" ? Number(v) : undefined);
        const mapped: PortMapping[] = rows.map((row) => ({
          instance_port: preProcessValue(row.key),
          container_port: preProcessValue(row.value),
          protocol: row.protocol,
        }));
        onChange?.(mapped);
      }}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (row) => (
        <>
          <Input
            className={rowError ? "border-red-500" : ""}
            placeholder={t("portSelection.placeholder.instancePort")}
            value={row.key}
            onChange={(e) => changeCallback({ ...row, key: e.target.value })}
            type={inputType}
          />
          <Input
            className={rowError ? "border-red-500" : ""}
            placeholder={t("portSelection.placeholder.containerPort")}
            value={row.value}
            onChange={(e) => changeCallback({ ...row, value: e.target.value })}
            type={inputType}
          />
          <Select
            value={row.protocol || PortMappingProtocol.TCP}
            onValueChange={(newVal) =>
              changeCallback({ ...row, protocol: newVal as PortMappingProtocol })
            }
          >
            <SelectTrigger className="w-22 bg-secondary-background">
              <SelectValue placeholder={t("portSelection.placeholder.protocol")} />
            </SelectTrigger>
            <SelectContent className="w-22">
              {Object.values(PortMappingProtocol).map((protocol) => (
                <SelectItem key={protocol} value={protocol}>
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

export default PortInputEditGameServer;
