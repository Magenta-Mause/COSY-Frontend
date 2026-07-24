import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import Icon from "@/components/ui/Icon.tsx";
import { Input } from "@/components/ui/input.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper.tsx";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v7 as generateUuid } from "uuid";
import type { ZodType } from "zod";
import type { VolumeMountConfiguration } from "@/api/generated/model";
import checkCircleIcon from "@/assets/icons/checkCircle.webp";
import closeCirleIcon from "@/assets/icons/closeCircle.webp";
import { type InputType, preProcessInputValue } from "../CreateGameServer/util";
import ListInputEdit from "./ListInputEditGameServer";

interface VolumeMountRow {
  container_path: string;
  uuid: string;
  originalUuid?: string;
}

type PathChangeDecision = "keep" | "delete";

interface Props<T> {
  value?: T[];
  setValue: (vals: T[]) => void;
  onChange?: (vals: T[]) => void;

  placeholder: string;
  fieldLabel: string;
  fieldDescription: string;

  validator: ZodType;
  errorLabel: string;
  required?: boolean;

  inputType: InputType;
  objectKey: keyof T;

  originalVolumeMounts?: VolumeMountConfiguration[];
}

function EditVolumeMountConfigurationInput<T extends Record<string, string>>({
  value,
  setValue,
  onChange,
  placeholder,
  fieldLabel,
  fieldDescription,
  errorLabel,
  required,
  inputType,
  objectKey,
  originalVolumeMounts,
}: Props<T>) {
  const { t } = useTranslation();

  const [pathChangeDecisions, setPathChangeDecisions] = useState<Map<string, PathChangeDecision>>(
    new Map(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRowUuid, setPendingRowUuid] = useState<string | null>(null);

  const originalByUuid = useMemo(() => {
    const map = new Map<string, string>();
    originalVolumeMounts?.forEach((vm) => {
      if (vm.uuid && vm.container_path) {
        map.set(vm.uuid, vm.container_path);
      }
    });
    return map;
  }, [originalVolumeMounts]);

  // Clear decisions when value resets to original state (revert button)
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      // Check if all values match originals — if so, clear decisions
      const vals = value ?? [];
      const allMatch = vals.every((v) => {
        const uuid = (v as Record<string, string>).uuid;
        const path = String(v[objectKey] ?? "");
        if (!uuid) return true;
        const orig = originalByUuid.get(uuid);
        return orig === path;
      });
      if (allMatch && pathChangeDecisions.size > 0) {
        setPathChangeDecisions(new Map());
      }
    }
  }, [value, objectKey, originalByUuid, pathChangeDecisions.size]);

  const validateContainerPath = useCallback(
    (container_path?: string) => {
      const trimmed = container_path?.trim() ?? "";
      if (trimmed.length === 0) return !required;
      if (!trimmed.startsWith("/")) return false;
      if (trimmed === "/") return false;
      return true;
    },
    [required],
  );

  const checkValidity = useCallback(
    (item: VolumeMountRow) => validateContainerPath(item.container_path),
    [validateContainerPath],
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
      container_path: String(v[objectKey] ?? ""),
      uuid: uuidPerIndexRef.current[idx],
      originalUuid: (v as Record<string, string>).uuid,
    }));
  }, [value, objectKey]);

  const handleBlur = useCallback(
    (row: VolumeMountRow) => {
      if (!row.originalUuid) return;
      const originalPath = originalByUuid.get(row.originalUuid);
      if (!originalPath) return;

      if (row.container_path === originalPath) {
        // Path reverted to original — clear any decision
        if (row.originalUuid) {
          setPathChangeDecisions((prev) => {
            const next = new Map(prev);
            next.delete(row.originalUuid as string);
            return next;
          });
        }
        return;
      }

      // Path changed — if no decision yet, open dialog
      if (!pathChangeDecisions.has(row.originalUuid)) {
        setPendingRowUuid(row.originalUuid);
        setDialogOpen(true);
      }
    },
    [originalByUuid, pathChangeDecisions],
  );

  const handleDecision = useCallback(
    (decision: PathChangeDecision) => {
      if (!pendingRowUuid) return;
      setPathChangeDecisions((prev) => {
        const next = new Map(prev);
        next.set(pendingRowUuid, decision);
        return next;
      });
      setDialogOpen(false);
      setPendingRowUuid(null);
    },
    [pendingRowUuid],
  );

  const propagateValues = useCallback(
    (rows: VolumeMountRow[]) => {
      return rows.map((row) => {
        const base = {
          ...({} as T),
          [objectKey]: preProcessInputValue(row.container_path, inputType),
        };

        if (!row.originalUuid) {
          // New mount — no UUID
          return base;
        }

        const decision = pathChangeDecisions.get(row.originalUuid);
        if (decision === "delete") {
          // Explicitly chose to delete old files — omit UUID (backend creates new entity)
          return base;
        }

        // Unchanged, "keep", or no decision yet — always preserve UUID in state.
        // This ensures originalUuid tracking survives re-renders so the
        // blur handler can still detect path changes and open the dialog.
        return { ...base, uuid: row.originalUuid } as T;
      });
    },
    [objectKey, inputType, pathChangeDecisions],
  );

  return (
    <ListInputEdit<VolumeMountRow>
      value={rows}
      setParentValue={(rows) => {
        setValue(propagateValues(rows ?? []));
      }}
      onChange={(rows) => {
        onChange?.(propagateValues(rows));
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
              placeholder={placeholder}
              value={row.container_path}
              onChange={(e) => changeCallback({ ...row, container_path: e.target.value })}
              onBlur={() => handleBlur(row)}
              type={inputType}
            />
            {row.originalUuid && pathChangeDecisions.has(row.originalUuid) && (
              <TooltipWrapper
                tooltip={
                  pathChangeDecisions.get(row.originalUuid) === "keep"
                    ? t("components.editGameServer.volumeMountSelection.pathChange.keepIndicator")
                    : t("components.editGameServer.volumeMountSelection.pathChange.deleteIndicator")
                }
                asChild
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-9 p-0"
                  onClick={() => {
                    setPendingRowUuid(row.originalUuid ?? null);
                    setDialogOpen(true);
                  }}
                >
                  {pathChangeDecisions.get(row.originalUuid) === "keep" ? (
                    <Icon src={checkCircleIcon} className="size-5 text-green-500" />
                  ) : (
                    <Icon src={closeCirleIcon} className="size-5 text-destructive" />
                  )}
                </Button>
              </TooltipWrapper>
            )}
          </div>
          <VolumeMountChangeDialog
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            handleDecision={handleDecision}
          />
        </Fragment>
      )}
    />
  );
}

const VolumeMountChangeDialog = (props: {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<boolean>;
  handleDecision: (decision: PathChangeDecision) => void;
}) => {
  const { dialogOpen, setDialogOpen, handleDecision } = props;
  const { t } = useTranslation();

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("components.editGameServer.volumeMountSelection.pathChange.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("components.editGameServer.volumeMountSelection.pathChange.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleDecision("delete")}>
            {t("components.editGameServer.volumeMountSelection.pathChange.deleteButton")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDecision("keep")}>
            {t("components.editGameServer.volumeMountSelection.pathChange.keepButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditVolumeMountConfigurationInput;
