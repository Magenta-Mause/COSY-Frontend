import { CpuLimitInput } from "@/components/display/CpuLimit/CpuLimitInput";
import { MemoryLimitInput } from "@/components/display/MemoryLimit/MemoryLimitInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { CPU_LIMIT_POSITIVE_ERROR, cpuLimitValidator } from "@/lib/validators/cpuLimitValidator";
import {
  MEMORY_LIMIT_MIN_ERROR,
  memoryLimitValidator,
} from "@/lib/validators/memoryLimitValidator";

const UpdateDockerLimitsModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.updateDockerLimitsDialog");
  const { updateDockerLimits } = useDataInteractions();

  const [cpu, setCpu] = useState<string>(
    props.user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "",
  );
  const [memory, setMemory] = useState<string>(
    props.user.docker_hardware_limits?.docker_memory_limit ?? "",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cpuError, setCpuError] = useState<string | undefined>(undefined);
  const [memoryError, setMemoryError] = useState<string | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (props.open) {
      setCpu(props.user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "");
      setMemory(props.user.docker_hardware_limits?.docker_memory_limit ?? "");
      setSubmitError(null);
      setCpuError(undefined);
      setMemoryError(undefined);
    }
  }, [props.open, props.user]);

  const handleClose = () => {
    setCpu(props.user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "");
    setMemory(props.user.docker_hardware_limits?.docker_memory_limit ?? "");
    setSubmitError(null);
    setCpuError(undefined);
    setMemoryError(undefined);
    props.onClose();
  };

  const handleCpuChange = (val: string) => {
    setCpu(val);
    if (val === "") {
      setCpuError(undefined);
      return;
    }
    const result = cpuLimitValidator.safeParse(val);
    setCpuError(result.success ? undefined : CPU_LIMIT_POSITIVE_ERROR);
  };

  const handleMemoryChange = (val: string) => {
    setMemory(val);
    if (val === "") {
      setMemoryError(undefined);
      return;
    }
    const result = memoryLimitValidator.safeParse(val);
    setMemoryError(result.success ? undefined : MEMORY_LIMIT_MIN_ERROR);
  };

  const handleSubmit = async () => {
    if (!props.user.uuid) return;

    const cpuValue = cpu !== "" ? parseFloat(cpu) : undefined;
    if (cpu !== "" && (Number.isNaN(cpuValue) || cpuValue === undefined)) {
      setCpuError(CPU_LIMIT_POSITIVE_ERROR);
      return;
    }

    setSubmitError(null);
    setIsPending(true);
    try {
      await updateDockerLimits(props.user.uuid, {
        docker_hardware_limits: {
          docker_max_cpu_cores: cpuValue,
          docker_memory_limit: memory !== "" ? memory : undefined,
        },
      });
      handleClose();
    } catch {
      setSubmitError(t("submitError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={handleClose}>
      <DialogContent className="min-w-172">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <div className="flex justify-between gap-5">
            <div className="w-[45%]">
              <CpuLimitInput
                header={t("cpuLabel")}
                description={t("cpuDescription")}
                id="docker-cpu-limit"
                placeholder={t("placeholder")}
                value={cpu}
                onChange={handleCpuChange}
                error={cpuError}
                className="no-spinner"
              />
            </div>
            <div className="w-[50%]">
              <MemoryLimitInput
                id="docker-memory-limit"
                header={t("memoryLabel")}
                description={t("memoryDescription")}
                placeholder={t("placeholder")}
                value={memory}
                onChange={handleMemoryChange}
                error={memoryError}
                className="no-spinner"
              />
            </div>
          </div>
        </DialogMain>
        <DialogFooter>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button variant="secondary" onClick={handleClose}>
            {t("cancelButton")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDockerLimitsModal;
