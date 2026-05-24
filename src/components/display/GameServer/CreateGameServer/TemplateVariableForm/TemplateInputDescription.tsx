import { FieldLabel } from "@components/ui/field";

interface TemplateInputDescriptionProps {
  htmlFor?: string;
  description?: string;
}

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_TEST_REGEX = /^https?:\/\//;

export default function TemplateInputDescription({
  htmlFor,
  description,
}: TemplateInputDescriptionProps) {
  if (!description) return null;

  const parts = description.split(URL_SPLIT_REGEX);

  return (
    <FieldLabel htmlFor={htmlFor} className="text-muted-foreground text-sm">
      {parts.map((part, i) =>
        URL_TEST_REGEX.test(part) ? (
          <a
            key={`${i}-${part}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            {part}
          </a>
        ) : (
          <span key={`${i}-${part}`}>{part}</span>
        ),
      )}
    </FieldLabel>
  );
}
