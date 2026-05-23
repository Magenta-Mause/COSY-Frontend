import CpuLimitInputField from "@components/display/GameServer/CreateGameServer/CpuLimitInputField.tsx";
import KeyValueInput from "@components/display/GameServer/CreateGameServer/KeyValueInput.tsx";
import MemoryLimitInputFieldCreation from "@components/display/GameServer/CreateGameServer/MemoryLimitInputFieldCreation.tsx";
import PortInput from "@components/display/GameServer/CreateGameServer/PortInput.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider.tsx";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { formatMemoryLimit } from "@/lib/memoryFormatUtil.ts";
import GenericGameServerCreationInputField from "../GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";
import VolumeMountInput from "../VolumeMountInput.tsx";

export default function Step3() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");
  const { t: t_root } = useTranslation();
  const { cpuLimit, memoryLimit } = useContext(AuthContext);

  return (
    <GenericGameServerCreationPage>
      <GenericGameServerCreationInputField
        attribute="server_name"
        validator={z.string().min(1)}
        placeholder={t("serverNameSelection.placeholder")}
        label={t("serverNameSelection.title")}
        description={t("serverNameSelection.description")}
        errorLabel={t("serverNameSelection.errorLabel")}
      />

      <div className="grid grid-cols-2 gap-4">
        <GenericGameServerCreationInputField
          attribute="docker_image_name"
          validator={z.string().min(1)}
          placeholder={t("dockerImageSelection.placeholder")}
          label={t("dockerImageSelection.title")}
          description={t("dockerImageSelection.description")}
          errorLabel={t("dockerImageSelection.errorLabel")}
        />

        <GenericGameServerCreationInputField
          attribute="docker_image_tag"
          validator={z.string().min(1)}
          placeholder={t("imageTagSelection.placeholder")}
          label={t("imageTagSelection.title")}
          description={t("imageTagSelection.description")}
          errorLabel={t("imageTagSelection.errorLabel")}
          defaultValue={"latest"}
          optional
        />
      </div>

      <PortInput
        attribute="port_mappings"
        fieldLabel={t("portSelection.title")}
        fieldDescription={t("portSelection.description")}
        errorLabel={t("portSelection.errorLabel")}
        placeHolderKeyInput="4433"
        placeHolderValueInput="4433"
        keyValidator={z.number().min(1).max(65535)}
        valueValidator={z.number().min(1).max(65535)}
      />

      <KeyValueInput
        attribute="environment_variables"
        fieldLabel={t("environmentVariablesSelection.title")}
        fieldDescription={t("environmentVariablesSelection.description")}
        errorLabel={t("environmentVariablesSelection.errorLabel")}
        placeHolderKeyInput="KEY"
        placeHolderValueInput="VALUE"
        keyValidator={z.string().min(1)}
        valueValidator={z.string().min(1)}
        inputType={"text"}
        objectKey="key"
        objectValue="value"
        processEscapeSequences={true}
      />

      <GenericGameServerCreationInputField
        attribute="execution_command"
        validator={z.string().min(1)}
        placeholder={t("executionCommandSelection.placeholder")}
        optional
        label={t("executionCommandSelection.title")}
        description={t("executionCommandSelection.description")}
        errorLabel={t("executionCommandSelection.errorLabel")}
      />

      <VolumeMountInput
        attribute="volume_mounts"
        label={t("hostPathSelection.title")}
        description={t("hostPathSelection.description")}
        errorLabel={t("hostPathSelection.errorLabel")}
        placeholder={t("hostPathSelection.placeholder")}
      />

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
    </GenericGameServerCreationPage>
  );
}
