import { useCallback, useEffect, useState } from "react";
import { CpuLimitInput } from "@/components/display/CpuLimit/CpuLimitInput.tsx";
import { CPU_LIMIT_POSITIVE_ERROR, cpuLimitValidator } from "@/lib/validators/cpuLimitValidator.ts";

interface CpuLimitInputFieldEditProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
  value: number | undefined;
  onChange: (value: string | null) => void;
  onValidationChange?: (hasError: boolean) => void;
}

const CpuLimitInputFieldEdit = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
  value,
  onChange,
  onValidationChange,
}: CpuLimitInputFieldEditProps) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>(errorLabel);

  const isError = touched && !isValid;

  const validate = useCallback(
    (value: unknown): { isValid: boolean; errorMessage: string } => {
      // If optional and empty, it's valid
      if (optional && (value === null || value === undefined || value === "")) {
        return { isValid: true, errorMessage: errorLabel };
      }

      const validationResult = cpuLimitValidator.safeParse(value);
      let error = errorLabel;

      if (!validationResult.success) {
        error = CPU_LIMIT_POSITIVE_ERROR;
      }

      return {
        isValid: validationResult.success,
        errorMessage: error,
      };
    },
    [optional, errorLabel],
  );

  const changeCallback = useCallback(
    (inputValue: string) => {
      setTouched(true);

      if (inputValue === "") {
        onChange(null);
        const result = validate(null);
        setIsValid(result.isValid);
        setErrorMessage(result.errorMessage);
        onValidationChange?.(!result.isValid);
      } else {
        onChange(inputValue);
        const result = validate(inputValue);
        setIsValid(result.isValid);
        setErrorMessage(result.errorMessage);
        onValidationChange?.(!result.isValid);
      }
    },
    [onChange, validate, onValidationChange],
  );

  useEffect(() => {
    if (value !== undefined) {
      const result = validate(value);
      setIsValid(result.isValid);
      setErrorMessage(result.errorMessage);
      onValidationChange?.(!result.isValid);
    }
  }, [value, validate, onValidationChange]);

  useEffect(() => {
    if (optional) {
      setIsValid(true);
      setTouched(true);
    }
  }, [optional]);

  return (
    <div className="py-2">
      <CpuLimitInput
        id="cpu_limit"
        header={label}
        error={isError ? errorMessage : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(val) => changeCallback(val)}
        description={description}
      />
    </div>
  );
};

export default CpuLimitInputFieldEdit;
