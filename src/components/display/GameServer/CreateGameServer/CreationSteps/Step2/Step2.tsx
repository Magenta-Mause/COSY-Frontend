import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import TemplateVariableForm from "@components/display/GameServer/CreateGameServer/TemplateVariableForm";
import { validateTemplateVariables } from "@components/display/GameServer/CreateGameServer/utils/templateSubstitution";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import GenericGameServerCreationPage from "../../GenericGameServerCreationPage.tsx";
import TemplateHeader from "./TemplateHeader.tsx";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const { t: t_root } = useTranslation();
  const { creationState, setUtilState, setCurrentPageValid } =
    useContext(GameServerCreationContext);

  const selectedTemplate = creationState.utilState.selectedTemplate ?? null;
  const templateVariables = creationState.utilState.templateVariables ?? {};

  const handleTemplateVariableChange = (placeholder: string, value: string | number | boolean) => {
    setUtilState("templateVariables")({ ...templateVariables, [placeholder]: value });
  };

  useEffect(() => {
    setCurrentPageValid(validateTemplateVariables(selectedTemplate, templateVariables));
  }, [selectedTemplate, templateVariables, setCurrentPageValid]);

  if (!selectedTemplate) {
    return (
      <GenericGameServerCreationPage>
        <p className="text-sm text-muted-foreground">{t("noTemplatesAvailable")}</p>
      </GenericGameServerCreationPage>
    );
  }

  const hasVariables = (selectedTemplate.variables?.length ?? 0) > 0;

  return (
    <GenericGameServerCreationPage>
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
          {t("noVariablesHintPrefix")}{" "}
          <span className="text-foreground font-medium">
            {t_root("components.CreateGameServer.useTemplate")}
          </span>{" "}
          {t("noVariablesHintSuffix")}
        </p>
      )}
    </GenericGameServerCreationPage>
  );
}
