import TemplateList from "./TemplateList/TemplateList.tsx";
import Icon from "@/components/ui/Icon.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useCallback, useMemo, useState } from "react";

import type { TemplateEntity } from "@/api/generated/model";
import closeIcon from "@/assets/icons/close.webp";
import searchIcon from "@/assets/icons/search.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import TagFilter from "./TagFilter.tsx";

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
      <TagFilter templates={filteredTemplates} activeTags={activeTags} onToggle={toggleTag} />
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
