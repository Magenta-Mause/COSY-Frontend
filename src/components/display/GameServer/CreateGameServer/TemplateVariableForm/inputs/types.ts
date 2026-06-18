import type { TemplateVariable } from "@/api/generated/model";

export interface VariableInputProps {
  variable: TemplateVariable;
  value: string | number | boolean;
  showError: boolean;
  errorMessage?: string;
  onValueChange: (variable: TemplateVariable, value: string | number | boolean) => void;
  onEnterKey: () => void;
  t: (key: string) => string;
  isRequired?: boolean;
}
