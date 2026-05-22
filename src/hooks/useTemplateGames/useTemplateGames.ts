import type { GameDto } from "@/api/generated/model";
import { useTypedSelector } from "@/stores/rootReducer.ts";

const useTemplateGames = (): GameDto[] =>
  useTypedSelector((state) => state.gameSliceReducer.data);

export default useTemplateGames;
