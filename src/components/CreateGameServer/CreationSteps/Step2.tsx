import { DialogDescription, DialogTitle } from "@components/ui/dialog";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import GenericGameServerCreationInputField from "../GenericGameServerCreationInputField";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage";

export default function Step2() {
  const { t } = useTranslation();

  return (
    <GenericGameServerCreationPage>
      <DialogTitle>{t("components.CreateGameServer.steps.step2.title")}</DialogTitle>
      <DialogDescription>
        {t("components.CreateGameServer.steps.step2.description")}
      </DialogDescription>

      <GenericGameServerCreationInputField
        attribute="template"
        validator={z.string().min(1)}
        placeholder="Select a template"
        label={t("components.CreateGameServer.steps.step2.templateSelection.title")}
        description={t("components.CreateGameServer.steps.step2.templateSelection.description")}
        errorLabel={t("components.CreateGameServer.steps.step2.templateSelection.errorLabel")}
      />
      <GenericGameServerCreationInputField
        attribute="serverName"
        validator={z.string().min(1)}
        placeholder="My Game Server"
        label={t("components.CreateGameServer.steps.step2.serverNameSelection.title")}
        description={t("components.CreateGameServer.steps.step2.serverNameSelection.description")}
        errorLabel={t("components.CreateGameServer.steps.step2.serverNameSelection.errorLabel")}
      />
    </GenericGameServerCreationPage>
  );
}
