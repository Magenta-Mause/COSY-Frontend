import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import GenericGameServerCreationInputField from "../GenericGameServerCreationInputField.tsx";

const DockerImageSection = () => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step3");

  return (
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
        defaultValue="latest"
        optional
      />
    </div>
  );
};

export default DockerImageSection;
