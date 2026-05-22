import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import TemplateVariableForm from "@components/display/GameServer/CreateGameServer/TemplateVariableForm";
import { validateTemplateVariables } from "@components/display/GameServer/CreateGameServer/utils/templateSubstitution";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const { t: t_root } = useTranslation();
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

  const hasVariables = (selectedTemplate.variables?.length ?? 0) > 0;

  return (
    <GenericGameServerCreationPage>
      {/* Template info header — not a card, lives at page level */}
      <div className="flex flex-col gap-2 px-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("selectedTemplateLabel")}
        </p>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold leading-tight">{selectedTemplate.name}</h3>
          {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5 shrink-0 pt-0.5">
              {selectedTemplate.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-lg bg-foreground/[0.06] text-muted-foreground leading-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {selectedTemplate.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedTemplate.description}
          </p>
        )}
      </div>

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
          <span className="text-foreground font-medium">{t_root("components.CreateGameServer.useTemplate")}</span>{" "}
          {t("noVariablesHintSuffix")}
        </p>
      )}
    </GenericGameServerCreationPage>
  );
}
