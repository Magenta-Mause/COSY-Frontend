import { GameServerCreationContext } from "@components/display/GameServer/CreateGameServer/CreateGameServerModal.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { useCallback, useContext, useState } from "react";
import type { TemplateEntity, TemplateVariable } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { BooleanInput, NumberInput, SelectInput, TextInput } from "./inputs";

interface TemplateVariableFormProps {
  template: TemplateEntity | null;
  onValueChange: (placeholder: string, value: string | number | boolean) => void;
  initialValues?: Record<string, string | number | boolean>;
}

interface VariableState {
  value: string | number | boolean;
  isValid: boolean;
  touched: boolean;
  errorMessage?: string;
}

function validateValue(
  variable: TemplateVariable,
  value: string | number | boolean,
): { isValid: boolean; errorMessage?: string } {
  const stringValue = String(value);

  // All variables must have a non-empty value
  if (stringValue === "") {
    return { isValid: false, errorMessage: "validationErrorRequired" };
  }

  // Validate based on type
  switch (variable.type) {
    case "number":
      if (Number.isNaN(Number(stringValue))) {
        return { isValid: false, errorMessage: "validationErrorNumber" };
      }
      return { isValid: true };
    case "boolean":
      if (stringValue !== "true" && stringValue !== "false") {
        return { isValid: false, errorMessage: "validationErrorBoolean" };
      }
      return { isValid: true };
    case "select":
      if (!(variable.options?.includes(stringValue) ?? false)) {
        return { isValid: false, errorMessage: "validationErrorSelect" };
      }
      return { isValid: true };
    default:
      // Validate regex if provided (full match)
      if (variable.regex) {
        try {
          const regex = new RegExp(`^(?:${variable.regex})$`);
          if (!regex.test(stringValue)) {
            return { isValid: false, errorMessage: "validationErrorPattern" };
          }
        } catch {
          return { isValid: true }; // Invalid regex, skip validation
        }
      }
      return { isValid: true };
  }
}

export default function TemplateVariableForm({
  template,
  onValueChange,
  initialValues = {},
}: TemplateVariableFormProps) {
  const { t } = useTranslationPrefix("components.TemplateVariableForm");
  const { triggerNextPage } = useContext(GameServerCreationContext);

  // Initialize state for all variables, running validation on initial values
  const [variableStates, setVariableStates] = useState<Record<string, VariableState>>(() => {
    const states: Record<string, VariableState> = {};
    template?.variables?.forEach((variable) => {
      const placeholder = variable.placeholder ?? "";
      const initialValue = initialValues[placeholder] ?? variable.default_value ?? "";
      const validation = validateValue(variable, initialValue);
      states[placeholder] = {
        value: initialValue,
        isValid: validation.isValid,
        touched: false,
        errorMessage: validation.errorMessage,
      };
    });
    return states;
  });

  const handleValueChange = useCallback(
    (variable: TemplateVariable, newValue: string | number | boolean) => {
      const placeholder = variable.placeholder ?? "";
      const validation = validateValue(variable, newValue);

      setVariableStates((prev) => ({
        ...prev,
        [placeholder]: {
          value: newValue,
          isValid: validation.isValid,
          touched: true,
          errorMessage: validation.errorMessage,
        },
      }));

      // Always call onValueChange so parent can validate with current value
      let typedValue: string | number | boolean = newValue;
      if (variable.type === "number" && String(newValue) !== "" && !Number.isNaN(Number(newValue))) {
        typedValue = Number(newValue);
      } else if (variable.type === "boolean") {
        typedValue = String(newValue) === "true";
      }
      onValueChange(placeholder, typedValue);
    },
    [onValueChange],
  );

  const renderVariableInput = (variable: TemplateVariable) => {
    const placeholder = variable.placeholder ?? "";
    const state = variableStates[placeholder];
    const showError = state?.touched && !state?.isValid;

    const commonProps = {
      variable,
      value: placeholder in initialValues ? initialValues[placeholder] : (state?.value ?? ""),
      showError,
      errorMessage: state?.errorMessage,
      onValueChange: handleValueChange,
      onEnterKey: triggerNextPage,
      t,
    };

    switch (variable.type) {
      case "select":
        return <SelectInput key={placeholder} {...commonProps} />;
      case "boolean":
        return <BooleanInput key={placeholder} {...commonProps} />;
      case "number":
        return <NumberInput key={placeholder} {...commonProps} />;
      default:
        return <TextInput key={placeholder} {...commonProps} />;
    }
  };

  const hasVariables = template?.variables && template.variables.length > 0;

  return (
    <Card className={"py-5"}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {!template ? (
          <div className="text-[25px] text-muted-foreground text-center py-4">
            {t("noTemplateSelected")}
          </div>
        ) : !hasVariables ? (
          <div className="text-[25px] text-muted-foreground text-center py-8">
            {t("noVariables")}
          </div>
        ) : (
          <div className="space-y-6">
            {template.variables?.map((variable) => renderVariableInput(variable))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
