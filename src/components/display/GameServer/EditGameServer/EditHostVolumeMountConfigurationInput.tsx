import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { Checkbox } from "@components/ui/checkbox.tsx";
import { Field, FieldDescription, FieldLabel } from "@components/ui/field.tsx";
import { Input } from "@components/ui/input.tsx";
import { Fragment, useCallback, useContext, useMemo } from "react";
import type { HostVolumeMountConfigurationDto } from "@/api/generated/model";
import { HOST_MOUNT_EDITABLE_ROLES } from "@/lib/authConstants.ts";
import ListInputEdit from "./ListInputEditGameServer";

interface HostMountRow {
  host_path: string;
  container_path: string;
  read_only: boolean;
  uuid: string;
  originalUuid?: string;
}

interface Props {
  value?: HostVolumeMountConfigurationDto[];
  setValue: (vals: HostVolumeMountConfigurationDto[]) => void;
  onChange?: (vals: HostVolumeMountConfigurationDto[]) => void;

  fieldLabel: string;
  fieldDescription: string;
  errorLabel: string;
  hostPathPlaceholder: string;
  containerPathPlaceholder: string;
  readOnlyLabel: string;
}

/**
 * Host-mount editor for the edit flow. Editable only for ADMIN/OWNER; other roles see existing
 * mounts read-only (no add/edit/remove), and their saves preserve the mounts untouched.
 */
function EditHostVolumeMountConfigurationInput({
  value,
  setValue,
  onChange,
  fieldLabel,
  fieldDescription,
  errorLabel,
  hostPathPlaceholder,
  containerPathPlaceholder,
  readOnlyLabel,
}: Props) {
  const { role } = useContext(AuthContext);
  const canEdit = role != null && HOST_MOUNT_EDITABLE_ROLES.includes(role);

  const validateRow = useCallback((row: HostMountRow) => {
    const host = row.host_path?.trim() ?? "";
    const container = row.container_path?.trim() ?? "";
    if (host.length === 0 && container.length === 0) return true;
    if (host.length === 0) return false;
    return /^\/.+/.test(container);
  }, []);

  const rows = useMemo(
    () =>
      (value ?? []).map((v) => ({
        host_path: String(v.host_path ?? ""),
        container_path: String(v.container_path ?? ""),
        read_only: v.read_only ?? true,
        // Use the server-assigned uuid as the stable React key. propagateValues round-trips
        // newly-added rows' display uuid through the DTO so it is always set here.
        uuid: v.uuid ?? "",
        originalUuid: v.uuid,
      })),
    [value],
  );

  const propagateValues = useCallback(
    (rows: HostMountRow[]): HostVolumeMountConfigurationDto[] =>
      rows.map((row) => ({
        host_path: row.host_path,
        container_path: row.container_path,
        read_only: row.read_only,
        // Always round-trip the uuid (server uuid for existing rows, display uuid for new rows)
        // so the next render can use v.uuid as a stable key rather than positional tracking.
        uuid: row.originalUuid ?? (row.uuid || undefined),
      })),
    [],
  );

  // Read-only view for non-admin/owner roles.
  if (!canEdit) {
    return (
      <Field className="py-2">
        <FieldLabel className="pb-0 font-bold">{fieldLabel}</FieldLabel>
        <div className="space-y-2 w-full">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{fieldDescription}</p>
          ) : (
            rows.map((row) => (
              <div key={row.uuid} className="flex items-center gap-2 w-full">
                <Input className="w-full" value={row.host_path} disabled readOnly type="text" />
                <Input
                  className="w-full"
                  value={row.container_path}
                  disabled
                  readOnly
                  type="text"
                />
                <span className="flex items-center gap-1.5 text-sm whitespace-nowrap opacity-60">
                  <Checkbox checked={row.read_only} disabled />
                  {readOnlyLabel}
                </span>
              </div>
            ))
          )}
        </div>
        {rows.length > 0 && <FieldDescription>{fieldDescription}</FieldDescription>}
      </Field>
    );
  }

  return (
    <ListInputEdit<HostMountRow>
      value={rows}
      setParentValue={(rows) => setValue(propagateValues(rows ?? []))}
      onChange={(rows) => onChange?.(propagateValues(rows))}
      checkValidity={validateRow}
      errorLabel={errorLabel}
      fieldLabel={fieldLabel}
      fieldDescription={fieldDescription}
      renderRow={(changeCallback, rowError) => (row) => (
        <Fragment key={row.uuid}>
          <div className="flex gap-2 items-center w-full">
            <Input
              className={rowError ? "border-red-500 w-full" : "w-full"}
              placeholder={hostPathPlaceholder}
              value={row.host_path}
              onChange={(e) => changeCallback({ ...row, host_path: e.target.value })}
              type="text"
            />
            <Input
              className={rowError ? "border-red-500 w-full" : "w-full"}
              placeholder={containerPathPlaceholder}
              value={row.container_path}
              onChange={(e) => changeCallback({ ...row, container_path: e.target.value })}
              type="text"
            />
            <label
              htmlFor={`edit-host-mount-ro-${row.uuid}`}
              className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer"
            >
              <Checkbox
                id={`edit-host-mount-ro-${row.uuid}`}
                checked={row.read_only}
                onCheckedChange={(checked) =>
                  changeCallback({ ...row, read_only: checked === true })
                }
              />
              {readOnlyLabel}
            </label>
          </div>
        </Fragment>
      )}
    />
  );
}

export default EditHostVolumeMountConfigurationInput;
