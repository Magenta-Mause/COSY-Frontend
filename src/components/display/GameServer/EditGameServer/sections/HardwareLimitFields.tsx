import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { GameServerUpdateDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil.ts";
import { getMemoryLimitError } from "@/lib/validators/memoryLimitValidator.ts";
import CpuLimitInputFieldEdit from "@/components/display/GameServer/EditGameServer/inputs/CpuLimitInputFieldEdit.tsx";
import MemoryLimitInputFieldEdit from "@/components/display/GameServer/EditGameServer/inputs/MemoryLimitInputFieldEdit.tsx";

interface HardwareLimitFieldsProps {
  readonly cpuLimit: number | null;
  readonly memoryLimit: string | null;
  readonly cpuCores?: number;
  readonly memoryLimitValue?: string;
  readonly setGameServerState: Dispatch<SetStateAction<GameServerUpdateDto>>;
  readonly setCpuError: Dispatch<SetStateAction<string | undefined>>;
  readonly setMemoryError: Dispatch<SetStateAction<string | undefined>>;
  readonly setMemoryErrorMessage: Dispatch<SetStateAction<string | undefined>>;
  readonly disabled: boolean;
}

const HardwareLimitFields = ({
  cpuLimit,
  memoryLimit,
  cpuCores,
  memoryLimitValue,
  setGameServerState,
  setCpuError,
  setMemoryError,
  setMemoryErrorMessage,
  disabled,
}: HardwareLimitFieldsProps) => {
  const { t } = useTranslationPrefix("components.editGameServer");
  const { t: t_root } = useTranslation();

  return (
    <fieldset disabled={disabled}>
      <div className="grid grid-cols-2 gap-4">
        <CpuLimitInputFieldEdit
          placeholder="0.5"
          label={t("cpuLimitSelection.title") + (cpuLimit === null ? " (Optional)" : "")}
          description={
            cpuLimit !== null
              ? `${t("cpuLimitSelection.description")} ${t_root("common.yourLimit")}: ${cpuLimit} Cores)`
              : t("cpuLimitSelection.description")
          }
          errorLabel={t("cpuLimitSelection.errorLabel")}
          value={cpuCores}
          onChange={(v) =>
            setGameServerState((s) => ({
              ...s,
              docker_hardware_limits: {
                ...s.docker_hardware_limits,
                docker_max_cpu_cores: v !== null && v !== "" ? Number(v) : undefined,
              },
            }))
          }
          optional={cpuLimit === null}
          onValidationChange={(hasError) => setCpuError(hasError ? "error" : undefined)}
        />

        <MemoryLimitInputFieldEdit
          placeholder="512"
          label={`${t("memoryLimitSelection.title")} ${memoryLimit === null ? " (Optional)" : ""}`}
          description={
            memoryLimit !== null
              ? `${t("memoryLimitSelection.description")} (${t_root("common.yourLimit")}: ${formatMemoryLimit(memoryLimit)})`
              : t("memoryLimitSelection.description")
          }
          errorLabel={t("memoryLimitSelection.errorLabel")}
          value={memoryLimitValue}
          onChange={(v) => {
            setMemoryErrorMessage(getMemoryLimitError(v) ?? undefined);

            setGameServerState((s) => ({
              ...s,
              docker_hardware_limits: {
                ...s.docker_hardware_limits,
                docker_memory_limit: v && v !== "" ? v : undefined,
              },
            }));
          }}
          optional={memoryLimit === null}
          onValidationChange={(hasError) => setMemoryError(hasError ? "error" : undefined)}
        />
      </div>
    </fieldset>
  );
};

export default HardwareLimitFields;
