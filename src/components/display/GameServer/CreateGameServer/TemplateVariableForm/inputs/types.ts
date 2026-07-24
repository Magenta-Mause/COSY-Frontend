import type { TFunction } from "i18next";
import type { TemplateVariable } from "@/api/generated/model";

export interface VariableInputProps {
  variable: TemplateVariable;
  value: string | number | boolean;
  showError: boolean;
  errorMessage?: string;
  onValueChange: (variable: TemplateVariable, value: string | number | boolean) => void;
  onEnterKey: () => void;
  t: TFunction<"translation", "components.TemplateVariableForm">;
  isRequired?: boolean;
}
