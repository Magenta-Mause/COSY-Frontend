import TemplateList from "@components/display/GameServer/CreateGameServer/TemplateList/TemplateList.tsx";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input.tsx";
import { useCallback, useMemo, useState } from "react";
import type { TemplateEntity } from "@/api/generated/model";
import closeIcon from "@/assets/icons/close.webp";
import searchIcon from "@/assets/icons/search.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface TemplateBrowserProps {
  templatesForSelected: TemplateEntity[];
  selectedTemplate: TemplateEntity | null;
  onTemplateClick: (template: TemplateEntity) => void;
}

const TemplateBrowser = ({
  templatesForSelected,
  selectedTemplate,
  onTemplateClick,
}: TemplateBrowserProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

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
      result = result.filter((tmpl) => [...activeTags].every((tag) => tmpl.tags?.includes(tag)));
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
    for (const tag of activeTags) {
      if (!freq.has(tag)) freq.set(tag, 0);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
  }, [filteredTemplates, activeTags]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }, []);

  return (
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
                onClick={() => toggleTag(tag)}
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
            handleCardClick={onTemplateClick}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateBrowser;
