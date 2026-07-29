import { useCallback, useEffect, useState } from "react";
import { MemoryLimitInput } from "@/components/display/MemoryLimit/MemoryLimitInput.tsx";
import {
  MEMORY_LIMIT_MIN_ERROR,
  memoryLimitValidator,
} from "@/lib/validators/memoryLimitValidator.ts";

interface MemoryLimitInputFieldEditProps {
  label: string;
  description: string;
  errorLabel: string;
  placeholder: string;
  optional: boolean;
  value: string | undefined;
  onChange: (value: string | null) => void;
  onValidationChange?: (hasError: boolean) => void;
}

const MemoryLimitInputFieldEdit = ({
  label,
  description,
  errorLabel,
  placeholder,
  optional,
  value,
  onChange,
  onValidationChange,
}: MemoryLimitInputFieldEditProps) => {
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

      const validationResult = memoryLimitValidator.safeParse(value);
      let error = errorLabel;

      if (!validationResult.success && typeof value === "string") {
        error = MEMORY_LIMIT_MIN_ERROR;
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
      <MemoryLimitInput
        id="memory_limit"
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

export default MemoryLimitInputFieldEdit;
