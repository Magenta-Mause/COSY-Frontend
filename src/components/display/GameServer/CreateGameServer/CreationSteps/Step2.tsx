import {
  GameServerCreationContext,
  GENERIC_GAME_PLACEHOLDER_VALUE,
} from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import TemplateList from "@components/display/GameServer/CreateGameServer/TemplateList/TemplateList.tsx";
import TemplateVariableForm from "@components/display/GameServer/CreateGameServer/TemplateVariableForm";
import { validateTemplateVariables } from "@components/display/GameServer/CreateGameServer/utils/templateSubstitution";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input.tsx";
import { useContext, useEffect, useState } from "react";
import type { TemplateEntity } from "@/api/generated/model";
import searchIcon from "@/assets/icons/search.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import GenericGameServerCreationPage from "../GenericGameServerCreationPage.tsx";

export default function Step2() {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const { creationState, setUtilState, setCurrentPageValid } =
    useContext(GameServerCreationContext);
  const templates = useTypedSelector((state) => state.templateSliceReducer.data);
  const templatesForGame = templates.filter(
    (template) => template.game_id === creationState.gameServerState.external_game_id,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const selectedTemplate = creationState.utilState.selectedTemplate ?? null;
  const templateVariables = creationState.utilState.templateVariables ?? {};

  const handleTemplateVariableChange = (placeholder: string, value: string | number | boolean) => {
    setUtilState("templateVariables")({
      ...templateVariables,
      [placeholder]: value,
    });
  };

  const handleCardClick = (template: TemplateEntity) => {
    if (template.uuid === selectedTemplate?.uuid) {
      setUtilState("selectedTemplate")(null);
      setUtilState("templateVariables")({});
      setUtilState("templateApplied")(false);
    } else {
      setUtilState("selectedTemplate")(template);
      // Initialize templateVariables with default values so they are available
      // when applying the template even if the user doesn't touch the inputs
      const defaults: Record<string, string | number | boolean> = {};
      template.variables?.forEach((variable) => {
        if (!variable.placeholder) return;
        if (variable.default_value != null) {
          const raw = variable.default_value;
          if (variable.type === "number" && !Number.isNaN(Number(raw))) {
            defaults[variable.placeholder] = Number(raw);
          } else if (variable.type === "boolean") {
            defaults[variable.placeholder] = String(raw) === "true";
          } else {
            defaults[variable.placeholder] = String(raw);
          }
        } else {
          defaults[variable.placeholder] = "";
        }
      });
      setUtilState("templateVariables")(defaults);
      setUtilState("templateApplied")(false);
    }
  };

  useEffect(() => {
    const isValid = validateTemplateVariables(selectedTemplate, templateVariables);
    setCurrentPageValid(isValid);
  }, [selectedTemplate, templateVariables, setCurrentPageValid]);

  const filtered = templatesForGame.filter(
    (tmpl) =>
      searchQuery === "" ||
      tmpl.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hasSpecificGame =
    creationState.gameServerState.external_game_id !== undefined &&
    creationState.gameServerState.external_game_id !== GENERIC_GAME_PLACEHOLDER_VALUE;

  if (templatesForGame.length === 0) {
    return (
      <GenericGameServerCreationPage>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t("noTemplatesAvailable")}</p>
          {hasSpecificGame && (
            <p className="text-sm text-muted-foreground">
              {t("requestTemplateText")}{" "}
              <a
                href="https://github.com/Magenta-Mause/Cosy-Templates/issues/new?template=01-template-request.yaml"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                {t("requestTemplateLinkLabel")}
              </a>
              .
            </p>
          )}
        </div>
      </GenericGameServerCreationPage>
    );
  }

  return (
    <GenericGameServerCreationPage>
      <div className="flex flex-col gap-4">
        {templatesForGame.length > 1 && (
          <Input
            startDecorator={<Icon src={searchIcon} variant="foreground" className="size-4" />}
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}

        <TemplateList
          templates={filtered}
          selectedTemplate={selectedTemplate}
          handleCardClick={handleCardClick}
        />

        <TemplateVariableForm
          key={selectedTemplate?.uuid ?? "no-template"}
          template={selectedTemplate}
          onValueChange={handleTemplateVariableChange}
          initialValues={templateVariables}
        />
      </div>
    </GenericGameServerCreationPage>
  );
}
