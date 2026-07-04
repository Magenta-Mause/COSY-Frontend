import { useCallback, useEffect, useMemo, useState } from "react";
import type { TemplateEntity } from "@/api/generated/model";
import {
  type CreationState,
  type GameServerCreationContext,
  GENERIC_SIDEBAR_SELECTION,
} from "./context.ts";
import { applyTemplate } from "./utils/templateSubstitution.ts";

const makeRandomDesign = () => (Math.random() < 0.5 ? "HOUSE" : "CASTLE") as "HOUSE" | "CASTLE";

export const makeEmptyCreationState = (): CreationState => ({
  gameServerState: { design: makeRandomDesign() },
  utilState: {},
});

interface UseCreationFormStateReturn {
  creationState: CreationState;
  hasUnsavedChanges: boolean;
  setGameServerState: GameServerCreationContext["setGameServerState"];
  setUtilState: GameServerCreationContext["setUtilState"];
  resetCreationState: () => void;
  applyTemplateToState: () => void;
  selectTemplate: (
    template: TemplateEntity,
    defaults: Record<string, string | number | boolean>,
    applyNow: boolean,
  ) => void;
  clearTemplate: () => void;
}

const useCreationFormState = (isOpen: boolean): UseCreationFormStateReturn => {
  const [creationState, setCreationState] = useState<CreationState>(makeEmptyCreationState);

  useEffect(() => {
    if (!isOpen) return;
    setCreationState((prev) => ({
      ...prev,
      gameServerState: { ...prev.gameServerState, design: makeRandomDesign() },
    }));
  }, [isOpen]);

  const hasUnsavedChanges = useMemo(() => {
    const { design: _design, external_game_id: _gameId, ...rest } = creationState.gameServerState;
    const hasFormData = Object.values(rest).some(
      (v) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0),
    );
    const hasGameSelected =
      creationState.utilState.selectedGameId != null &&
      creationState.utilState.selectedGameId !== GENERIC_SIDEBAR_SELECTION;
    return hasFormData || creationState.utilState.selectedTemplate != null || hasGameSelected;
  }, [creationState]);

  const setGameServerState: GameServerCreationContext["setGameServerState"] = useCallback(
    (gameStateKey) => (value) =>
      setCreationState((prev) => ({
        ...prev,
        gameServerState: { ...prev.gameServerState, [gameStateKey]: value },
      })),
    [],
  );

  const setUtilState: GameServerCreationContext["setUtilState"] = useCallback(
    (utilStateKey) => (value) =>
      setCreationState((prev) => ({
        ...prev,
        utilState: { ...prev.utilState, [utilStateKey]: value },
      })),
    [],
  );

  const resetCreationState = useCallback(() => {
    setCreationState(makeEmptyCreationState());
  }, []);

  const applyTemplateToState = useCallback(() => {
    const { selectedTemplate, templateVariables } = creationState.utilState;
    if (!selectedTemplate || !templateVariables) return;

    const updatedState = applyTemplate(
      selectedTemplate,
      templateVariables,
      creationState.gameServerState,
    );
    setCreationState((prev) => ({
      ...prev,
      gameServerState: updatedState,
      utilState: { ...prev.utilState, templateApplied: true },
    }));
  }, [creationState.utilState, creationState.gameServerState]);

  const selectTemplate = useCallback(
    (
      template: TemplateEntity,
      defaults: Record<string, string | number | boolean>,
      applyNow: boolean,
    ) => {
      setCreationState((prev) => {
        const gameServerState = applyNow
          ? applyTemplate(template, defaults, prev.gameServerState)
          : prev.gameServerState;
        return {
          ...prev,
          gameServerState,
          utilState: {
            ...prev.utilState,
            selectedTemplate: template,
            templateVariables: defaults,
            templateApplied: applyNow,
          },
        };
      });
    },
    [],
  );

  const clearTemplate = useCallback(() => {
    setCreationState((prev) => ({
      ...prev,
      utilState: {
        ...prev.utilState,
        selectedTemplate: null,
        templateVariables: {},
        templateApplied: false,
      },
    }));
  }, []);

  return {
    creationState,
    hasUnsavedChanges,
    setGameServerState,
    setUtilState,
    resetCreationState,
    applyTemplateToState,
    selectTemplate,
    clearTemplate,
  };
};

export default useCreationFormState;
