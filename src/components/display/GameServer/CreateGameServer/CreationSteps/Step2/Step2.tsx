import { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { GameServerCreationContext } from "@/components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { validateTemplateVariables } from "@/components/display/GameServer/CreateGameServer/utils/templateSubstitution";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";
import GenericGameServerCreationInputField from "../../GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "../../GenericGameServerCreationPage.tsx";
import TemplateHeader from "./TemplateHeader.tsx";
import TemplateVariableForm from "./TemplateVariableForm";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const { t: tRoot } = useTranslation();
  const { creationState, setUtilState } = useContext(GameServerCreationContext);

  const selectedTemplate = creationState.utilState.selectedTemplate ?? null;
  const templateVariables = creationState.utilState.templateVariables ?? {};
  const hasVariables = (selectedTemplate?.variables?.length ?? 0) > 0;

  const handleTemplateVariableChange = (placeholder: string, value: string | number | boolean) => {
    setUtilState("templateVariables")({ ...templateVariables, [placeholder]: value });
  };

  return (
    <GenericGameServerCreationPage
      extraValid={validateTemplateVariables(selectedTemplate, templateVariables)}
    >
      <GenericGameServerCreationInputField
        attribute="server_name"
        validator={requiredStringValidator}
        placeholder={t("serverNameSelection.placeholder")}
        label={t("serverNameSelection.title")}
        description={t("serverNameSelection.description")}
        errorLabel={t("serverNameSelection.errorLabel")}
      />

      {selectedTemplate ? (
        <>
          <TemplateHeader template={selectedTemplate} />
          {hasVariables ? (
            <TemplateVariableForm
              key={selectedTemplate.uuid}
              template={selectedTemplate}
              onValueChange={handleTemplateVariableChange}
              initialValues={templateVariables}
            />
          ) : (
            <p className="text-sm text-muted-foreground px-1">
              <Trans
                i18nKey="components.CreateGameServer.steps.step2.noVariablesHint"
                values={{ action: tRoot("components.CreateGameServer.useTemplate") }}
                components={{ action: <span className="text-foreground font-medium" /> }}
              />
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground px-1">{t("noTemplatesAvailable")}</p>
      )}
    </GenericGameServerCreationPage>
  );
}
