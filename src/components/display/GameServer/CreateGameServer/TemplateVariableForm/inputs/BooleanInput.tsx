import { FieldError, FieldLabel } from "@/components/ui/field";
import RequiredMark from "@/components/ui/RequiredMark.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TemplateInputDescription from "../TemplateInputDescription";
import type { VariableInputProps } from "./types";

export default function BooleanInput({
  variable,
  value,
  showError,
  errorMessage,
  onValueChange,
  t,
  isRequired,
}: VariableInputProps) {
  const placeholder = variable.placeholder ?? "";

  return (
    <div key={placeholder} className="space-y-2">
      <FieldLabel htmlFor={placeholder} className="text-lg">
        {variable.name} {isRequired && <RequiredMark />}
      </FieldLabel>
      <Select
        value={String(value ?? "false")}
        onValueChange={(val) => onValueChange(variable, val)}
      >
        <SelectTrigger id={placeholder} className={showError ? "border-red-500" : ""}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">{t("booleanTrue")}</SelectItem>
          <SelectItem value="false">{t("booleanFalse")}</SelectItem>
        </SelectContent>
      </Select>
      <TemplateInputDescription htmlFor={placeholder} description={variable.description} />
      {variable.example != null && variable.example !== "" && (
        <FieldLabel htmlFor={placeholder} className="text-muted-foreground text-sm">
          {t("example")}: {String(variable.example)}
        </FieldLabel>
      )}
      {showError && (
        <FieldError>{errorMessage ? t(errorMessage) : t("validationError")}</FieldError>
      )}
    </div>
  );
}
