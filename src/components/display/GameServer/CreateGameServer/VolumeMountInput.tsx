import ListInput from "@/components/display/GameServer/CreateGameServer/ListInput.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useCallback } from "react";
import { v7 as generateUuid } from "uuid";
import type { VolumeMountConfigurationCreationDto } from "@/api/generated/model/volumeMountConfigurationCreationDto.ts";
import { cn } from "@/lib/utils.ts";
import type { GameServerCreationFormState } from "./CreateGameServerModal.tsx";

interface VolumeMountItem {
  container_path: string;
  uuid: string;
}

interface Props {
  attribute: keyof GameServerCreationFormState;
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
}

function VolumeMountInput({ attribute, label, description, errorLabel, placeholder }: Props) {
  const validateItem = useCallback((container_path?: string) => {
    const trimmed = container_path?.trim() ?? "";
    if (trimmed.length === 0) return true;
    if (!trimmed.startsWith("/")) return false;
    if (trimmed === "/") return false;
    return true;
  }, []);

  const checkValidity = useCallback(
    (item: VolumeMountItem) => validateItem(item.container_path),
    [validateItem],
  );

  const computeValue = useCallback((items: VolumeMountItem[]) => {
    const mapped: VolumeMountConfigurationCreationDto[] = [];
    items.forEach((item) => {
      const trimmed = (item.container_path ?? "").trim();
      if (trimmed.length > 0) {
        mapped.push({ container_path: trimmed });
      }
    });
    return mapped;
  }, []);

  const parseInitialValue = useCallback(
    (
      contextValue: GameServerCreationFormState[keyof GameServerCreationFormState],
    ): VolumeMountItem[] => {
      if (!contextValue || !Array.isArray(contextValue)) return [];
      const mounts = contextValue as VolumeMountConfigurationCreationDto[];
      return mounts.map((m) => ({
        container_path: String(m.container_path ?? ""),
        uuid: generateUuid(),
      }));
    },
    [],
  );

  return (
    <ListInput
      defaultNewItem={() => ({ container_path: "" })}
      attribute={attribute}
      checkValidity={checkValidity}
      errorLabel={errorLabel}
      fieldLabel={label}
      fieldDescription={description}
      computeValue={computeValue}
      parseInitialValue={parseInitialValue}
      renderRow={(changeCallback, rowError) => (item) => (
        <Input
          className={cn(rowError ? "border-red-500" : "", "w-full")}
          id={`volume-mount-input-${item.uuid}`}
          placeholder={placeholder}
          value={item.container_path || ""}
          onChange={(e) => changeCallback({ ...item, container_path: e.target.value })}
          type={"text"}
        />
      )}
    />
  );
}

export default VolumeMountInput;
