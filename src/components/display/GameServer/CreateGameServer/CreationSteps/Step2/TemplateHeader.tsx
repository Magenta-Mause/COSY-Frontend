import LinkedText from "@/components/ui/LinkedText";
import type { TemplateEntity } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface TemplateHeaderProps {
  template: TemplateEntity;
}

const TemplateHeader = ({ template }: TemplateHeaderProps) => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step2");

  return (
    <div className="flex flex-col gap-2 px-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {t("selectedTemplateLabel")}
      </p>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold leading-tight">{template.name}</h3>
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5 shrink-0 pt-0.5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-lg bg-foreground/10 text-foreground/80 leading-none"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {template.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          <LinkedText text={template.description} />
        </p>
      )}
    </div>
  );
};

export default TemplateHeader;
