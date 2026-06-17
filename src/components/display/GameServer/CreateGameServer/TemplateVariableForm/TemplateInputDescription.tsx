import { FieldLabel } from "@components/ui/field";
import LinkedText from "@components/ui/LinkedText";

interface TemplateInputDescriptionProps {
  htmlFor?: string;
  description?: string;
}

export default function TemplateInputDescription({
  htmlFor,
  description,
}: TemplateInputDescriptionProps) {
  if (!description) return null;

  return (
    <FieldLabel
      htmlFor={htmlFor}
      className="text-muted-foreground text-sm block w-full break-words"
    >
      <LinkedText text={description} />
    </FieldLabel>
  );
}
