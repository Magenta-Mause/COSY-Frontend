import { useRef, useState } from "react";
import { Card } from "@components/ui/card.tsx";
import Icon from "@components/ui/Icon.tsx";
import type { TemplateEntity } from "@/api/generated/model";
import checkIcon from "@/assets/icons/check.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const TemplateList = ({
  templates,
  selectedTemplate,
  handleCardClick,
}: {
  templates: TemplateEntity[];
  selectedTemplate: TemplateEntity | null;
  handleCardClick: (template: TemplateEntity) => void;
}) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % templates.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + templates.length) % templates.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = templates.length - 1;
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(templates[index]);
      return;
    }

    if (nextIndex !== null) {
      setFocusedIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus();
      itemRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  };

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(10rem,13rem))] gap-3 content-start"
      tabIndex={-1}
      role="listbox"
      aria-label={t("templateSelection.title")}
    >
      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("templateSelection.noResultsLabel")}</p>
      ) : (
        templates.map((template, index) => {
          const isSelected = template.uuid === selectedTemplate?.uuid;
          return (
            <Card
              key={template.uuid}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              tabIndex={index === focusedIndex ? 0 : -1}
              role="option"
              aria-selected={isSelected}
              className={`relative cursor-pointer transition-all select-none p-4 gap-1.5 min-h-28 flex flex-col outline-none focus-visible:border-amber-600 focus-visible:shadow-amber-500 focus-visible:bg-primary/10 ${
                isSelected ? "border-primary bg-primary/8 shadow-sm" : "hover:border-border/80 hover:bg-foreground/[0.02]"
              }`}
              onClick={() => handleCardClick(template)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold leading-snug">{template.name}</span>
                {isSelected && (
                  <Icon src={checkIcon} className="size-4 shrink-0 text-primary mt-0.5" />
                )}
              </div>
              {template.description && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-snug">
                  {template.description}
                </p>
              )}
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto pt-1.5">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/[0.06] text-muted-foreground leading-none"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

export default TemplateList;
