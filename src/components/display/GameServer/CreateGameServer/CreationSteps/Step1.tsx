import TemplateList from "@components/display/GameServer/CreateGameServer/TemplateList/TemplateList.tsx";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input.tsx";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { TemplateEntity } from "@/api/generated/model";
import searchIcon from "@/assets/icons/search.webp";
import closeIcon from "@/assets/icons/close.webp";
import serverIcon from "@/assets/icons/console.webp";
import useTemplateGames from "@/hooks/useTemplateGames/useTemplateGames.ts";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";
import {
  GameServerCreationContext,
  GENERIC_GAME_PLACEHOLDER_VALUE,
  GENERIC_SERVER_TEMPLATE,
} from "../CreateGameServerModal";

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

  const selectedGameId = creationState.utilState.selectedGameId ?? GENERIC_GAME_PLACEHOLDER_VALUE;
  const sidebarGames = useTemplateGames();
  const [searchQuery, setSearchQuery] = useState("");
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  // Templates are optional — page is always valid
  useEffect(() => {
    setCurrentPageValid(true);
  }, [setCurrentPageValid]);

  const templatesForSelected = useMemo(() => {
    const backendTemplates = templates.filter((tmpl) => tmpl.game_id === selectedGameId);
    if (selectedGameId === GENERIC_GAME_PLACEHOLDER_VALUE) {
      return [GENERIC_SERVER_TEMPLATE, ...backendTemplates];
    }
    return backendTemplates;
  }, [templates, selectedGameId]);

  const filteredTemplates = useMemo(() => {
    let result =
      searchQuery === ""
        ? templatesForSelected
        : templatesForSelected.filter(
            (tmpl) =>
              tmpl.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tmpl.description?.toLowerCase().includes(searchQuery.toLowerCase()),
          );
    if (activeTags.size > 0) {
      result = result.filter((tmpl) =>
        [...activeTags].every((tag) => tmpl.tags?.includes(tag)),
      );
    }
    return result;
  }, [templatesForSelected, searchQuery, activeTags]);

  const sortedTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const tmpl of filteredTemplates) {
      for (const tag of tmpl.tags ?? []) {
        freq.set(tag, (freq.get(tag) ?? 0) + 1);
      }
    }
    // Always include active tags so they remain visible for deselection
    for (const tag of activeTags) {
      if (!freq.has(tag)) freq.set(tag, 0);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
  }, [filteredTemplates, activeTags]);

  const selectedTemplate = creationState.utilState.selectedTemplate ?? null;

  const handleGameSelect = useCallback(
    (gameId: number) => {
      if (gameId === selectedGameId) return;
      setSearchQuery("");
      setGameServerState("external_game_id")(gameId);
      setUtilState("selectedGameId")(gameId);
      setUtilState("selectedTemplate")(null);
      setUtilState("templateVariables")({});
      setUtilState("templateApplied")(false);
      setUtilState("gameEntity")(undefined);
      setActiveTags(new Set());
    },
    [selectedGameId, setGameServerState, setUtilState],
  );

  const handleCardClick = useCallback(
    (template: TemplateEntity) => {
      handleTemplateSelected(template);
    },
    [handleTemplateSelected],
  );

  // +1 for the injected GENERIC_SERVER_TEMPLATE
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
        : sidebarGames.filter((g) =>
            g.name.toLowerCase().includes(gameSearchQuery.toLowerCase()),
          ),
    [sidebarGames, gameSearchQuery],
  );

  return (
    <div className="flex h-full min-h-0 gap-5">
      {/* Left sidebar — game list */}
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
              onClick={() => handleGameSelect(GENERIC_GAME_PLACEHOLDER_VALUE)}
              countLabel={t("templateCount_other", { count: genericTemplateCount })}
            />
          )}
          {filteredSidebarGames.map((game) => {
            const count = templates.filter(
              (tmpl) => tmpl.game_id === game.external_game_id,
            ).length;
            return (
              <SidebarItem
                key={game.game_uuid}
                label={game.name}
                logoUrl={game.logo_url}
                isSelected={selectedGameId === game.external_game_id}
                onClick={() =>
                  game.external_game_id !== undefined && handleGameSelect(game.external_game_id)
                }
                countLabel={count > 0 ? t("templateCount_other", { count }) : undefined}
              />
            );
          })}
        </div>
      </nav>

      {/* Right panel — search pinned, list scrolls independently */}
      <div className="flex flex-col gap-3 flex-1 min-w-0 min-h-0">
        <Input
          startDecorator={<Icon src={searchIcon} variant="foreground" className="size-3.5" />}
          endDecorator={
            searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="pointer-events-auto flex items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
              >
                <Icon src={closeIcon} variant="foreground" className="size-3.5" />
              </button>
            )
          }
          placeholder={t("searchTemplatesPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="shrink-0 text-sm"
        />
        {sortedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {sortedTags.map(({ tag, count }) => {
              const isActive = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTags((prev) => {
                      const next = new Set(prev);
                      isActive ? next.delete(tag) : next.add(tag);
                      return next;
                    })
                  }
                  className={`text-xs px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary/20 border-primary text-primary font-medium"
                      : "bg-foreground/[0.04] border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {tag} <span className="opacity-60 ml-1">({count})</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="overflow-y-auto flex-1 min-h-0">
          {templatesForSelected.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noTemplatesAvailable")}</p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noTemplatesMatchFilter")}</p>
          ) : (
            <TemplateList
              templates={filteredTemplates}
              selectedTemplate={selectedTemplate}
              handleCardClick={handleCardClick}
            />
          )}
        </div>
      </div>
    </div>
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

export default Step1;
