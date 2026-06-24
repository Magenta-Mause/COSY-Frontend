import type { GameDto, TemplateEntity } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer.ts";

const useTemplateGames = (): GameDto[] => useTypedSelector((state) => state.gameSliceReducer.data);

export default useTemplateGames;

/**
 * Resolves whether a template's `game_id` references a given game.
 *
 * Mirrors the backend `resolveGameForTemplate` numeric-fallback logic:
 *  - `game_id` is matched against the game's `slug` first (the new slug-filename reference),
 *  - if `game_id` is numeric, it falls back to matching the game's `external_game_id`.
 *
 * `game_id` is now a string (slug or numeric-as-string) on the v3 template wire contract.
 */
export const templateMatchesGame = (template: TemplateEntity, game: GameDto): boolean => {
  const gameId = template.game_id;
  if (gameId == null || gameId === "") return false;

  // Primary: slug match.
  if (game.slug != null && game.slug === gameId) return true;

  // Fallback: numeric game_id → match external_game_id.
  if (game.external_game_id != null && /^\d+$/.test(String(gameId))) {
    return Number(gameId) === game.external_game_id;
  }

  return false;
};

/**
 * Finds the game a template belongs to (slug-first, numeric fallback). Returns undefined for the
 * generic/blank template or when no game matches.
 */
export const findGameForTemplate = (
  template: TemplateEntity,
  games: GameDto[],
): GameDto | undefined => games.find((game) => templateMatchesGame(template, game));
