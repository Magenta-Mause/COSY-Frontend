import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RequiredMark from "@/components/ui/RequiredMark.tsx";
import TemplateInputDescription from "../TemplateInputDescription";
import type { VariableInputProps } from "./types";

export default function NumberInput({
  variable,
  value,
  showError,
  errorMessage,
  onValueChange,
  onEnterKey,
  t,
  isRequired,
}: VariableInputProps) {
  const placeholder = variable.placeholder ?? "";

  return (
    <div key={placeholder} className="space-y-2">
      <FieldLabel htmlFor={placeholder} className="text-lg">
        {variable.name} {isRequired && <RequiredMark />}
      </FieldLabel>
      <Input
        id={placeholder}
        type="number"
        placeholder={
          variable.example ? `${t("examplePrefix")} ${String(variable.example)}` : variable.name
        }
        value={String(value ?? "")}
        onChange={(e) => onValueChange(variable, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnterKey();
          }
        }}
        error={showError ? (errorMessage ? t(errorMessage) : t("validationError")) : undefined}
      />
      <TemplateInputDescription htmlFor={placeholder} description={variable.description} />
    </div>
  );
}
