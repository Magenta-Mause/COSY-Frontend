import { useMemo } from "react";
import type { TemplateEntity } from "@/api/generated/model";

interface TagFilterProps {
  templates: TemplateEntity[];
  activeTags: Set<string>;
  onToggle: (tag: string) => void;
}

const TagFilter = ({ templates, activeTags, onToggle }: TagFilterProps) => {
  const sortedTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const tmpl of templates) {
      for (const tag of tmpl.tags ?? []) {
        freq.set(tag, (freq.get(tag) ?? 0) + 1);
      }
    }
    for (const tag of activeTags) {
      if (!freq.has(tag)) freq.set(tag, 0);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
  }, [templates, activeTags]);

  if (sortedTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 shrink-0">
      {sortedTags.map(({ tag, count }) => {
        const isActive = activeTags.has(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`text-xs px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
              isActive
                ? "bg-primary/20 border-primary text-foreground font-medium"
                : "bg-foreground/10 border-border text-foreground hover:border-primary/60 hover:bg-foreground/[0.15]"
            }`}
          >
            {tag} <span className="ml-1 opacity-70">({count})</span>
          </button>
        );
      })}
    </div>
  );
};

export default TagFilter;
