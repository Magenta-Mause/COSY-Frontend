import KeyValueInput from "@components/CreateGameServer/KeyValueInput";
import { DialogDescription, DialogTitle } from "@components/ui/dialog";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import GenericGameServerCreationInputField from "../GenericGameServerCreationInputField";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage";

export default function Step3() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");

  return (
    <GenericGameServerCreationPage>
      <DialogTitle>{t("title")}</DialogTitle>
      <DialogDescription>{t("description")}</DialogDescription>

      <div className="grid grid-cols-2 gap-4">
        <GenericGameServerCreationInputField
          attribute="docker_image_name"
          validator={z.string().min(1)}
          placeholder="nginx"
          label={t("dockerImageSelection.title")}
          description={t("dockerImageSelection.description")}
          errorLabel={t("dockerImageSelection.errorLabel")}
        />

        <GenericGameServerCreationInputField
          attribute="docker_image_tag"
          validator={z.string().min(1)}
          placeholder="latest"
          label={t("imageTagSelection.title")}
          description={t("imageTagSelection.description")}
          errorLabel={t("imageTagSelection.errorLabel")}
        />
      </div>

      <KeyValueInput
        attribute="port_mappings"
        fieldLabel={t("portSelection.title")}
        fieldDescription={t("portSelection.description")}
        errorLabel={t("portSelection.errorLabel")}
        placeHolderKeyInput="4433"
        placeHolderValueInput="4433"
        keyValidator={z.number().min(1).max(65535)}
        valueValidator={z.number().min(1).max(65535)}
        required
        inputType="number"
        objectKey="instance_port"
        objectValue="container_port"
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
      />

      <GenericGameServerCreationInputField
        attribute="execution_command"
        validator={z.string().min(1)}
        placeholder="./start.sh"
        label={t("executionCommandSelection.title")}
        description={t("executionCommandSelection.description")}
        errorLabel={t("executionCommandSelection.errorLabel")}
      />

      <KeyValueInput
        attribute="volume_mounts"
        fieldLabel={t("hostPathSelection.title")}
        fieldDescription={t("hostPathSelection.description")}
        errorLabel={t("hostPathSelection.errorLabel")}
        placeHolderKeyInput="Host Path"
        placeHolderValueInput="Container Path"
        keyValidator={z.string().min(1)}
        valueValidator={z.string().min(1)}
        inputType="text"
        objectKey="host_path"
        objectValue="container_path"
      />
    </GenericGameServerCreationPage>
  );
}
