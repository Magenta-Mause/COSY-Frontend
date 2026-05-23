import KeyValueInput from "@components/display/GameServer/CreateGameServer/KeyValueInput.tsx";
import PortInput from "@components/display/GameServer/CreateGameServer/PortInput.tsx";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import GenericGameServerCreationInputField from "../../GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "../../GenericGameServerCreationPage.tsx";
import VolumeMountInput from "../../VolumeMountInput.tsx";
import DockerImageSection from "./DockerImageSection.tsx";
import HardwareLimitsSection from "./HardwareLimitsSection.tsx";

export default function Step3() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");

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

      <DockerImageSection />

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
        inputType="text"
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

      <HardwareLimitsSection />
    </GenericGameServerCreationPage>
  );
}
