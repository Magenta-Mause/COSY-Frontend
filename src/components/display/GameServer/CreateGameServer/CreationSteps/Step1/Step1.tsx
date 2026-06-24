import { useCallback, useContext, useEffect, useMemo } from "react";
import type { TemplateEntity } from "@/api/generated/model";
import useTemplateGames, {
  templateMatchesGame,
} from "@/hooks/useTemplateGames/useTemplateGames.ts";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import {
  GameServerCreationContext,
  GENERIC_GAME_PLACEHOLDER_VALUE,
  GENERIC_SERVER_TEMPLATE,
} from "../../CreateGameServerModal";
import GameSidebar from "./GameSidebar.tsx";
import TemplateBrowser from "./TemplateBrowser.tsx";

const Step1 = () => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step1");
  const {
    creationState,
    setUtilState,
    setGameServerState,
    setCurrentPageValid,
    handleTemplateSelected,
  } = useContext(GameServerCreationContext);

  const templates = useTypedSelector((state) => state.templateSliceReducer.data);
  const sidebarGames = useTemplateGames();
  const selectedGameId = creationState.utilState.selectedGameId ?? GENERIC_GAME_PLACEHOLDER_VALUE;
  const selectedTemplate = creationState.utilState.selectedTemplate ?? null;

  // Templates are optional — page is always valid
  useEffect(() => {
    setCurrentPageValid(true);
  }, [setCurrentPageValid]);

  const templatesForSelected = useMemo(() => {
    if (selectedGameId === GENERIC_GAME_PLACEHOLDER_VALUE) {
      const localizedGenericTemplate = {
        ...GENERIC_SERVER_TEMPLATE,
        name: t("genericTemplateName"),
        description: t("genericTemplateDescription"),
      };
      // Templates that don't resolve to any known game still surface under the generic server.
      const orphanTemplates = templates.filter(
        (tmpl) => !sidebarGames.some((game) => templateMatchesGame(tmpl, game)),
      );
      return [localizedGenericTemplate, ...orphanTemplates];
    }
    const selectedGame = sidebarGames.find((game) => game.external_game_id === selectedGameId);
    if (!selectedGame) return [];
    return templates.filter((tmpl) => templateMatchesGame(tmpl, selectedGame));
  }, [templates, sidebarGames, selectedGameId, t]);

  const handleGameSelect = useCallback(
    (gameId: number) => {
      if (gameId === selectedGameId) return;
      setGameServerState("external_game_id")(gameId);
      setUtilState("selectedGameId")(gameId);
      setUtilState("selectedTemplate")(null);
      setUtilState("templateVariables")({});
      setUtilState("templateApplied")(false);
      setUtilState("gameEntity")(undefined);
    },
    [selectedGameId, setGameServerState, setUtilState],
  );

  const handleTemplateClick = useCallback(
    (template: TemplateEntity) => handleTemplateSelected(template),
    [handleTemplateSelected],
  );

  return (
    <div className="flex h-full min-h-0 gap-5">
      <GameSidebar
        selectedGameId={selectedGameId}
        templates={templates}
        sidebarGames={sidebarGames}
        onGameSelect={handleGameSelect}
      />
      <TemplateBrowser
        templatesForSelected={templatesForSelected}
        selectedTemplate={selectedTemplate}
        onTemplateClick={handleTemplateClick}
      />
    </div>
  );
};

export default Step1;
