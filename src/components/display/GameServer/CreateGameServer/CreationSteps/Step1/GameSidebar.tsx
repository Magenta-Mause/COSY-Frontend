import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input.tsx";
import { useMemo, useState } from "react";
import type { GameDto, TemplateEntity } from "@/api/generated/model";
import closeIcon from "@/assets/icons/close.webp";
import serverIcon from "@/assets/icons/console.webp";
import searchIcon from "@/assets/icons/search.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { GENERIC_GAME_PLACEHOLDER_VALUE } from "../../CreateGameServerModal";

interface GameSidebarProps {
  selectedGameId: number;
  templates: TemplateEntity[];
  sidebarGames: GameDto[];
  onGameSelect: (gameId: number) => void;
}

const GameSidebar = ({ selectedGameId, templates, sidebarGames, onGameSelect }: GameSidebarProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step1");
  const [gameSearchQuery, setGameSearchQuery] = useState("");

  const genericTemplateCount =
    templates.filter((tmpl) => tmpl.game_id === GENERIC_GAME_PLACEHOLDER_VALUE).length + 1;
  const genericServerLabel = t("genericServer");
  const showGenericServer =
    gameSearchQuery === "" ||
    genericServerLabel.toLowerCase().includes(gameSearchQuery.toLowerCase());

  const filteredSidebarGames = useMemo(
    () =>
      gameSearchQuery === ""
        ? sidebarGames
        : sidebarGames.filter((g) => g.name.toLowerCase().includes(gameSearchQuery.toLowerCase())),
    [sidebarGames, gameSearchQuery],
  );

  return (
    <nav className="flex flex-col gap-2 w-56 shrink-0 bg-foreground/[0.04] rounded-xl px-3 py-3">
      <Input
        startDecorator={<Icon src={searchIcon} variant="foreground" className="size-3.5" />}
        endDecorator={
          gameSearchQuery && (
            <button
              type="button"
              onClick={() => setGameSearchQuery("")}
              className="pointer-events-auto flex items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            >
              <Icon src={closeIcon} variant="foreground" className="size-3.5" />
            </button>
          )
        }
        placeholder={t("searchGamesPlaceholder")}
        value={gameSearchQuery}
        onChange={(e) => setGameSearchQuery(e.target.value)}
        className="shrink-0 text-sm"
      />
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 min-h-0 px-1.5 -mx-1.5">
        {showGenericServer && (
          <SidebarItem
            label={genericServerLabel}
            logoUrl={undefined}
            isSelected={selectedGameId === GENERIC_GAME_PLACEHOLDER_VALUE}
            onClick={() => onGameSelect(GENERIC_GAME_PLACEHOLDER_VALUE)}
            countLabel={t("templateCount", { count: genericTemplateCount })}
          />
        )}
        {filteredSidebarGames.map((game) => {
          const count = templates.filter((tmpl) => tmpl.game_id === game.external_game_id).length;
          return (
            <SidebarItem
              key={game.game_uuid}
              label={game.name}
              logoUrl={game.logo_url}
              isSelected={selectedGameId === game.external_game_id}
              onClick={() =>
                game.external_game_id !== undefined && onGameSelect(game.external_game_id)
              }
              countLabel={count > 0 ? t("templateCount", { count }) : undefined}
            />
          );
        })}
      </div>
    </nav>
  );
};

const SidebarItem = ({
  label,
  logoUrl,
  isSelected,
  onClick,
  countLabel,
}: {
  label: string;
  logoUrl?: string;
  isSelected: boolean;
  onClick: () => void;
  countLabel?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all cursor-pointer ${
      isSelected
        ? "bg-primary/20 text-primary font-medium shadow-sm"
        : "hover:bg-foreground/[0.06] text-foreground"
    }`}
  >
    <span className="size-9 shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
      {logoUrl ? (
        <img src={logoUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className="size-full flex items-center justify-center bg-primary/10">
          <Icon src={serverIcon} variant="foreground" className="size-5" />
        </span>
      )}
    </span>
    <span className="flex flex-col min-w-0 text-left">
      <span className="truncate leading-snug text-sm">{label}</span>
      {countLabel && (
        <span className="text-xs text-muted-foreground leading-snug">{countLabel}</span>
      )}
    </span>
  </button>
);

export default GameSidebar;
