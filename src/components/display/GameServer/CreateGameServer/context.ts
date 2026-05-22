import { createContext } from "react";
import type { GameDto, GameServerCreationDto, TemplateEntity } from "@/api/generated/model";

export const GENERIC_GAME_PLACEHOLDER_VALUE = -1;

export const GENERIC_SERVER_TEMPLATE: TemplateEntity = {
  uuid: "__generic-server-template__",
  name: "Generic Server",
  description: "Start with a blank configuration — no values are pre-filled.",
  game_id: GENERIC_GAME_PLACEHOLDER_VALUE,
  variables: [],
  tags: [],
};

export type AutoCompleteSelections = {
  [key: string]: {
    label: string;
    value: unknown;
    additionalInformation?: string;
    data?: unknown;
  };
};

export type UtilState = {
  gameEntity?: GameDto;
  selectedGameId?: number;
  selectedTemplate?: TemplateEntity | null;
  templateVariables?: Record<string, string | number | boolean>;
  templateApplied?: boolean;
  autoCompleteSelections?: AutoCompleteSelections;
};

export type GameServerCreationFormState = Omit<
  Partial<GameServerCreationDto>,
  "docker_hardware_limits"
> & {
  docker_max_cpu?: string;
  docker_max_memory?: string;
};

export interface CreationState {
  gameServerState: GameServerCreationFormState;
  utilState: UtilState;
}

export interface GameServerCreationContext {
  creationState: CreationState;
  setGameServerState: <K extends keyof GameServerCreationFormState>(
    gameStateKey: K,
  ) => (value: GameServerCreationFormState[K]) => void;
  setCurrentPageValid: (isValid: boolean) => void;
  triggerNextPage: () => void;
  handleTemplateSelected: (template: TemplateEntity) => void;
  setUtilState: <K extends keyof UtilState>(utilStateKey: K) => (value: UtilState[K]) => void;
  isLastPage: boolean;
  isPageValid: { [key: number]: boolean };
  currentPage: number;
}

export const GameServerCreationContext = createContext<GameServerCreationContext>({
  creationState: { gameServerState: {}, utilState: { gameEntity: undefined } },
  setGameServerState: () => () => {},
  setCurrentPageValid: () => {},
  triggerNextPage: () => {},
  handleTemplateSelected: () => {},
  setUtilState: () => () => {},
  isLastPage: false,
  isPageValid: {},
  currentPage: 0,
});
