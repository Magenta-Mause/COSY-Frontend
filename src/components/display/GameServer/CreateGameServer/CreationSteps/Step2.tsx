import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import TemplateVariableForm from "@components/display/GameServer/CreateGameServer/TemplateVariableForm";
import { validateTemplateVariables } from "@components/display/GameServer/CreateGameServer/utils/templateSubstitution";
import { useContext, useEffect } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const { creationState, setUtilState, setCurrentPageValid } =
    useContext(GameServerCreationContext);

  const selectedTemplate = creationState.utilState.selectedTemplate ?? null;
  const templateVariables = creationState.utilState.templateVariables ?? {};

  const handleTemplateVariableChange = (placeholder: string, value: string | number | boolean) => {
    setUtilState("templateVariables")({
      ...templateVariables,
      [placeholder]: value,
    });
  };

  useEffect(() => {
    const isValid = validateTemplateVariables(selectedTemplate, templateVariables);
    setCurrentPageValid(isValid);
  }, [selectedTemplate, templateVariables, setCurrentPageValid]);

  if (!selectedTemplate) {
    return (
      <GenericGameServerCreationPage>
        <p className="text-sm text-muted-foreground">{t("noTemplatesAvailable")}</p>
      </GenericGameServerCreationPage>
    );
  }

  return (
    <GenericGameServerCreationPage>
      <TemplateVariableForm
        key={selectedTemplate.uuid}
        template={selectedTemplate}
        onValueChange={handleTemplateVariableChange}
        initialValues={templateVariables}
      />
    </GenericGameServerCreationPage>
  );
}
