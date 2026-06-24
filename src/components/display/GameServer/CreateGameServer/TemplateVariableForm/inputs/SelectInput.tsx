import { FieldError, FieldLabel } from "@components/ui/field";
import RequiredMark from "@components/ui/RequiredMark.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { cn } from "@/lib/utils.ts";
import TemplateInputDescription from "../TemplateInputDescription";
import type { VariableInputProps } from "./types";

export default function SelectInput({
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
      <Select value={String(value ?? "")} onValueChange={(val) => onValueChange(variable, val)}>
        <SelectTrigger id={placeholder} className={cn(showError ? "border-red-500" : "")}>
          <SelectValue placeholder={t("selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent className={"z-600"}>
          {variable.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
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
