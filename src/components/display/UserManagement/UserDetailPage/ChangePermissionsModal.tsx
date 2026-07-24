import { CpuLimitInput } from "@/components/display/CpuLimit/CpuLimitInput";
import { MemoryLimitInput } from "@/components/display/MemoryLimit/MemoryLimitInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import type { UserEntityDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { CPU_LIMIT_POSITIVE_ERROR, cpuLimitValidator } from "@/lib/validators/cpuLimitValidator";
import {
  MEMORY_LIMIT_MIN_ERROR,
  memoryLimitValidator,
} from "@/lib/validators/memoryLimitValidator";

const ChangePermissionsModal = (props: {
  user: UserEntityDto;
  open: boolean;
  onClose: () => void;
  showCanCreateGameServers: boolean;
}) => {
  const { t } = useTranslationPrefix("components.userManagement.admin.changePermissionsDialog");
  const { updateDockerLimits, setCanCreateGameServers } = useDataInteractions();

  const [cpu, setCpu] = useState(
    props.user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "",
  );
  const [memory, setMemory] = useState(
    props.user.docker_hardware_limits?.docker_memory_limit ?? "",
  );
  const [canCreate, setCanCreate] = useState(props.user.can_create_game_servers ?? false);
  const [cpuError, setCpuError] = useState<string | undefined>(undefined);
  const [memoryError, setMemoryError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (props.open) {
      setCpu(props.user.docker_hardware_limits?.docker_max_cpu_cores?.toString() ?? "");
      setMemory(props.user.docker_hardware_limits?.docker_memory_limit ?? "");
      setCanCreate(props.user.can_create_game_servers ?? false);
      setCpuError(undefined);
      setMemoryError(undefined);
      setSubmitError(null);
    }
  }, [props.open, props.user]);

  const handleCpuChange = (val: string) => {
    setCpu(val);
    if (val === "") {
      setCpuError(undefined);
      return;
    }
    setCpuError(cpuLimitValidator.safeParse(val).success ? undefined : CPU_LIMIT_POSITIVE_ERROR);
  };

  const handleMemoryChange = (val: string) => {
    setMemory(val);
    if (val === "") {
      setMemoryError(undefined);
      return;
    }
    setMemoryError(
      memoryLimitValidator.safeParse(val).success ? undefined : MEMORY_LIMIT_MIN_ERROR,
    );
  };

  const handleClose = () => {
    setSubmitError(null);
    props.onClose();
  };

  const handleSubmit = async () => {
    if (!props.user.uuid) return;

    const cpuValue = cpu !== "" ? parseFloat(cpu) : undefined;
    if (cpu !== "" && (Number.isNaN(cpuValue) || cpuValue === undefined)) {
      setCpuError(CPU_LIMIT_POSITIVE_ERROR);
      return;
    }
    if (cpuError || memoryError) return;

    setSubmitError(null);
    setIsPending(true);
    try {
      await updateDockerLimits(props.user.uuid, {
        docker_hardware_limits: {
          docker_max_cpu_cores: cpuValue,
          docker_memory_limit: memory !== "" ? memory : undefined,
        },
      });
      if (props.showCanCreateGameServers) {
        await setCanCreateGameServers(props.user.uuid, canCreate);
      }
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
        <DialogMain className="flex flex-col gap-4">
          <div className="flex justify-between gap-5">
            <div className="w-[45%]">
              <CpuLimitInput
                header={t("cpuLabel")}
                description={t("cpuDescription")}
                id="permissions-cpu-limit"
                placeholder={t("placeholder")}
                value={cpu}
                onChange={handleCpuChange}
                error={cpuError}
                className="no-spinner"
              />
            </div>
            <div className="w-[50%]">
              <MemoryLimitInput
                id="permissions-memory-limit"
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
          {props.showCanCreateGameServers && (
            <div className="flex items-center gap-3">
              <Checkbox
                id="permissions-can-create-game-servers"
                checked={canCreate}
                onCheckedChange={(checked) => setCanCreate(checked === true)}
              />
              <Label
                htmlFor="permissions-can-create-game-servers"
                className="text-sm font-medium cursor-pointer"
              >
                {t("canCreateGameServersLabel")}
              </Label>
            </div>
          )}
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

export default ChangePermissionsModal;
