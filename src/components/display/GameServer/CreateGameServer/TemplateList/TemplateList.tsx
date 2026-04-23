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
      className="flex flex-row gap-2 overflow-x-auto pb-1"
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
              className={`relative shrink-0 cursor-pointer transition-colors select-none px-3 py-2 gap-0.5 max-w-50 outline-none focus-visible:border-amber-600 focus-visible:shadow-amber-500 focus-visible:bg-primary/10 ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleCardClick(template)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
            >
              <div className="flex items-center gap-2 pr-5">
                <span className="text-sm font-semibold leading-none">{template.name}</span>
                {isSelected && (
                  <Icon src={checkIcon} className="absolute top-2 right-2 size-4 text-primary" />
                )}
              </div>
              {template.description && (
                <p className="text-xs text-muted-foreground wrap-anywhere">
                  {template.description}
                </p>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};

export default TemplateList;
