import CpuLimitInputField from "@components/display/GameServer/CreateGameServer/CpuLimitInputField.tsx";
import MemoryLimitInputFieldCreation from "@components/display/GameServer/CreateGameServer/MemoryLimitInputFieldCreation.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil.ts";

const HardwareLimitsSection = () => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");
  const { t: t_root } = useTranslation();
  const { cpuLimit, memoryLimit } = useContext(AuthContext);

  return (
    <div className="grid grid-cols-2 gap-4">
      <CpuLimitInputField
        placeholder={t("cpuLimitSelection.placeholder")}
        optional={cpuLimit === null}
        label={
          cpuLimit === null
            ? `${t("cpuLimitSelection.title")} (${t_root("common.optional")})`
            : t("cpuLimitSelection.title")
        }
        description={
          cpuLimit !== null
            ? `${t("cpuLimitSelection.description")} (${t_root("common.yourLimit")}: ${cpuLimit} Cores)`
            : t("cpuLimitSelection.description")
        }
        errorLabel={t("cpuLimitSelection.errorLabel")}
      />
      <MemoryLimitInputFieldCreation
        placeholder={t("memoryLimitSelection.placeholder")}
        optional={memoryLimit === null}
        label={
          memoryLimit === null
            ? `${t("memoryLimitSelection.title")} (${t_root("common.optional")})`
            : t("memoryLimitSelection.title")
        }
        description={
          memoryLimit !== null
            ? `${t("memoryLimitSelection.description")} (${t_root("common.yourLimit")}: ${formatMemoryLimit(memoryLimit)})`
            : t("memoryLimitSelection.description")
        }
        errorLabel={t("memoryLimitSelection.errorLabel")}
      />
    </div>
  );
};

export default HardwareLimitsSection;
