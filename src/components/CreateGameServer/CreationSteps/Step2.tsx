import { DialogDescription, DialogTitle } from "@components/ui/dialog";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import GenericGameServerCreationInputField from "../GenericGameServerCreationInputField";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");

  return (
    <GenericGameServerCreationPage>
      <DialogTitle>{t("title")}</DialogTitle>
      <DialogDescription>{t("description")}</DialogDescription>

      <GenericGameServerCreationInputField
        attribute="template"
        validator={z.string().min(1)}
        placeholder="Select a template"
        label={t("templateSelection.title")}
        description={t("templateSelection.description")}
        errorLabel={t("templateSelection.errorLabel")}
      />
      <GenericGameServerCreationInputField
        attribute="server_name"
        validator={z.string().min(1)}
        placeholder="My Game Server"
        label={t("serverNameSelection.title")}
        description={t("serverNameSelection.description")}
        errorLabel={t("serverNameSelection.errorLabel")}
      />
    </GenericGameServerCreationPage>
  );
}
