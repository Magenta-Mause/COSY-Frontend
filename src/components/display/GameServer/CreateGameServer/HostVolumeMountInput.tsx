import ListInput from "@/components/display/GameServer/CreateGameServer/ListInput.tsx";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useCallback, useContext } from "react";
import { v7 as generateUuid } from "uuid";
import type { HostVolumeMountConfigurationDto } from "@/api/generated/model";
import { HOST_MOUNT_EDITABLE_ROLES } from "@/lib/authConstants.ts";
import { cn } from "@/lib/utils.ts";
import { GameServerCreationContext, type GameServerCreationFormState } from "./context.ts";

interface HostMountItem {
  host_path: string;
  container_path: string;
  read_only: boolean;
  uuid: string;
}

interface Props {
  attribute: keyof GameServerCreationFormState;
  label: string;
  description: string;
  errorLabel: string;
  hostPathPlaceholder: string;
  containerPathPlaceholder: string;
  readOnlyLabel: string;
}

function HostVolumeMountInput({
  attribute,
  label,
  description,
  errorLabel,
  hostPathPlaceholder,
  containerPathPlaceholder,
  readOnlyLabel,
}: Props) {
  const { role } = useContext(AuthContext);
  const { creationState } = useContext(GameServerCreationContext);
  const canEdit = role != null && HOST_MOUNT_EDITABLE_ROLES.includes(role);

  const validateItem = useCallback((item: HostMountItem) => {
    const host = item.host_path?.trim() ?? "";
    const container = item.container_path?.trim() ?? "";
    // Empty row is allowed (treated as "no entry"); a partial row is invalid.
    if (host.length === 0 && container.length === 0) return true;
    if (host.length === 0) return false;
    // container_path must be an absolute path (^/.+).
    if (!/^\/.+/.test(container)) return false;
    return true;
  }, []);

  const computeValue = useCallback((items: HostMountItem[]) => {
    const mapped: HostVolumeMountConfigurationDto[] = [];
    items.forEach((item) => {
      const host = (item.host_path ?? "").trim();
      const container = (item.container_path ?? "").trim();
      if (host.length > 0 && container.length > 0) {
        mapped.push({
          host_path: host,
          container_path: container,
          read_only: item.read_only,
        });
      }
    });
    return mapped as unknown as GameServerCreationFormState[keyof GameServerCreationFormState];
  }, []);

  const parseInitialValue = useCallback(
    (
      contextValue: GameServerCreationFormState[keyof GameServerCreationFormState],
    ): HostMountItem[] => {
      if (!contextValue || !Array.isArray(contextValue)) return [];
      const mounts = contextValue as HostVolumeMountConfigurationDto[];
      return mounts.map((m) => ({
        host_path: String(m.host_path ?? ""),
        container_path: String(m.container_path ?? ""),
        read_only: m.read_only ?? true,
        uuid: generateUuid(),
      }));
    },
    [],
  );

  // Read-only rendering for non-admin/owner roles: show existing (template-applied) values,
  // no add/edit/remove.
  if (!canEdit) {
    const value = creationState.gameServerState[attribute];
    const mounts = (Array.isArray(value) ? value : []) as HostVolumeMountConfigurationDto[];
    return (
      <Field>
        <FieldLabel className="font-bold">{label}</FieldLabel>
        <div className="space-y-2 w-full">
          {mounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : (
            mounts.map((m) => (
              <div
                key={m.uuid ?? `${m.host_path}-${m.container_path}`}
                className="flex items-center gap-2 w-full"
              >
                <Input
                  className="w-full"
                  placeholder={hostPathPlaceholder}
                  value={m.host_path ?? ""}
                  disabled
                  readOnly
                  type="text"
                />
                <Input
                  className="w-full"
                  placeholder={containerPathPlaceholder}
                  value={m.container_path ?? ""}
                  disabled
                  readOnly
                  type="text"
                />
                <span className="flex items-center gap-1.5 text-sm whitespace-nowrap opacity-60">
                  <Checkbox checked={m.read_only ?? true} disabled />
                  {readOnlyLabel}
                </span>
              </div>
            ))
          )}
        </div>
        {mounts.length > 0 && <FieldDescription>{description}</FieldDescription>}
      </Field>
    );
  }

  return (
    <ListInput
      defaultNewItem={() => ({ host_path: "", container_path: "", read_only: true })}
      attribute={attribute}
      checkValidity={validateItem}
      errorLabel={errorLabel}
      fieldLabel={label}
      fieldDescription={description}
      computeValue={computeValue}
      parseInitialValue={parseInitialValue}
      renderRow={(changeCallback, rowError) => (item) => (
        <div className="flex items-center gap-2 w-full">
          <Input
            className={cn(rowError ? "border-red-500" : "", "w-full")}
            id={`host-mount-host-${item.uuid}`}
            placeholder={hostPathPlaceholder}
            value={item.host_path || ""}
            onChange={(e) => changeCallback({ ...item, host_path: e.target.value })}
            type="text"
          />
          <Input
            className={cn(rowError ? "border-red-500" : "", "w-full")}
            id={`host-mount-container-${item.uuid}`}
            placeholder={containerPathPlaceholder}
            value={item.container_path || ""}
            onChange={(e) => changeCallback({ ...item, container_path: e.target.value })}
            type="text"
          />
          <label
            htmlFor={`host-mount-ro-${item.uuid}`}
            className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer"
          >
            <Checkbox
              id={`host-mount-ro-${item.uuid}`}
              checked={item.read_only}
              onCheckedChange={(checked) => changeCallback({ ...item, read_only: checked === true })}
            />
            {readOnlyLabel}
          </label>
        </div>
      )}
    />
  );
}

export default HostVolumeMountInput;
