import { createContext } from "react";
import type { GameDto, GameServerCreationDto, TemplateEntity } from "@/api/generated/model";

export const GENERIC_GAME_PLACEHOLDER_VALUE = -1;
/** Sentinel `game_id` (string, since template game_id is now a slug-or-numeric string) for the generic blank template. */
export const GENERIC_GAME_PLACEHOLDER_GAME_ID = String(GENERIC_GAME_PLACEHOLDER_VALUE);

export const GENERIC_SERVER_TEMPLATE: TemplateEntity = {
  uuid: "__generic-server-template__",
  name: "Generic Server",
  description: "Start with a blank configuration — no values are pre-filled.",
  game_id: GENERIC_GAME_PLACEHOLDER_GAME_ID,
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

/** Editor-side key/value entry (used by KeyValueInput for the annotations record). */
export type AnnotationEntry = { key: string; value: string };

export type GameServerCreationFormState = Omit<
  Partial<GameServerCreationDto>,
  "docker_hardware_limits" | "annotations"
> & {
  docker_max_cpu?: string;
  docker_max_memory?: string;
  /**
   * Annotations are edited as an array of key/value pairs (KeyValueInput) and converted to the
   * DTO's `Record<string,string>` at submit time.
   */
  annotations?: AnnotationEntry[];
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
