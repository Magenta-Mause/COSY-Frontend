import KeyValueInput from "./KeyValueInput.tsx";
import PortInput from "./PortInput.tsx";
import Collapsible from "@/components/ui/Collapsible.tsx";
import settingsIcon from "@/assets/icons/settings.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { portValidator } from "@/lib/validators/portValidator.ts";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";
import Icon from "@/components/ui/Icon.tsx";
import GenericGameServerCreationInputField from "../../GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "../../GenericGameServerCreationPage.tsx";
import HostVolumeMountInput from "./HostVolumeMountInput.tsx";
import VolumeMountInput from "./VolumeMountInput.tsx";
import DockerImageSection from "./DockerImageSection.tsx";
import HardwareLimitsSection from "./HardwareLimitsSection.tsx";

export default function Step3() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");

  return (
    <GenericGameServerCreationPage>
      <DockerImageSection />

      <PortInput
        attribute="port_mappings"
        fieldLabel={t("portSelection.title")}
        fieldDescription={t("portSelection.description")}
        errorLabel={t("portSelection.errorLabel")}
        placeHolderKeyInput="4433"
        placeHolderValueInput="4433"
        keyValidator={portValidator}
        valueValidator={portValidator}
      />

      <KeyValueInput
        attribute="environment_variables"
        fieldLabel={t("environmentVariablesSelection.title")}
        fieldDescription={t("environmentVariablesSelection.description")}
        errorLabel={t("environmentVariablesSelection.errorLabel")}
        placeHolderKeyInput="KEY"
        placeHolderValueInput="VALUE"
        keyValidator={requiredStringValidator}
        valueValidator={requiredStringValidator}
        inputType="text"
        objectKey="key"
        objectValue="value"
        processEscapeSequences={true}
      />

      <VolumeMountInput
        attribute="volume_mounts"
        label={t("hostPathSelection.title")}
        description={t("hostPathSelection.description")}
        errorLabel={t("hostPathSelection.errorLabel")}
        placeholder={t("hostPathSelection.placeholder")}
      />

      <HardwareLimitsSection />

      <Collapsible
        title={t("advancedSettings.title")}
        description={t("advancedSettings.description")}
        startDecorator={<Icon src={settingsIcon} variant="foreground" className="size-5" />}
      >
        <GenericGameServerCreationInputField
          attribute="execution_command"
          validator={requiredStringValidator}
          placeholder={t("executionCommandSelection.placeholder")}
          optional
          label={t("executionCommandSelection.title")}
          description={t("executionCommandSelection.description")}
          errorLabel={t("executionCommandSelection.errorLabel")}
        />

        <KeyValueInput
          attribute="annotations"
          fieldLabel={t("annotationsSelection.title")}
          fieldDescription={t("annotationsSelection.description")}
          errorLabel={t("annotationsSelection.errorLabel")}
          placeHolderKeyInput="com.example.label"
          placeHolderValueInput="value"
          keyValidator={requiredStringValidator}
          valueValidator={requiredStringValidator}
          inputType="text"
          objectKey="key"
          objectValue="value"
        />

        <HostVolumeMountInput
          attribute="host_volume_mounts"
          label={t("hostVolumeMountSelection.title")}
          description={t("hostVolumeMountSelection.description")}
          errorLabel={t("hostVolumeMountSelection.errorLabel")}
          hostPathPlaceholder={t("hostVolumeMountSelection.hostPathPlaceholder")}
          containerPathPlaceholder={t("hostVolumeMountSelection.containerPathPlaceholder")}
          readOnlyLabel={t("hostVolumeMountSelection.readOnlyLabel")}
        />
      </Collapsible>
    </GenericGameServerCreationPage>
  );
}
