import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import RequiredMark from "@/components/ui/RequiredMark.tsx";

interface CpuLimitInputProps {
  id?: string;
  header?: React.ReactNode;
  isRequired?: boolean;
  description?: string;
  value?: number | string | null;
  onChange: (value: string) => void; // Emits numeric string (e.g. "0.5" or "2")
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
}

export const CpuLimitInput = ({
  id,
  header,
  isRequired,
  description,
  value,
  onChange,
  placeholder,
  className,
  onKeyDown,
  error,
}: CpuLimitInputProps) => {
  const [localInputValue, setLocalInputValue] = useState("");

  const updateParent = useCallback(
    (inputValue: string) => {
      if (inputValue === "") {
        onChange("");
        return;
      }

      const numericValue = parseFloat(inputValue);
      if (Number.isNaN(numericValue)) {
        onChange(inputValue); // Let parent validation handle NaN if needed
        return;
      }

      onChange(numericValue.toString());
    },
    [onChange],
  );

  const handleInputChange = (inputValue: string) => {
    setLocalInputValue(inputValue);
    updateParent(inputValue);
  };

  // Sync with external value changes (e.g. initial load or reset)
  useEffect(() => {
    if (value === undefined || value === null || value === "") {
      if (localInputValue !== "") {
        setLocalInputValue("");
      }
      return;
    }

    const stringVal = value.toString();
    const numericPart = parseFloat(stringVal);

    if (Number.isNaN(numericPart)) return;

    // Avoid loops: check if effectively same
    if (localInputValue === numericPart.toString()) {
      return;
    }

    setLocalInputValue(numericPart.toString());
  }, [value, localInputValue]);

  return (
    <Input
      header={
        isRequired ? (
          <>
            {header} <RequiredMark />
          </>
        ) : (
          header
        )
      }
      description={description}
      className={className}
      error={error}
      placeholder={placeholder}
      onChange={(e) => handleInputChange(e.target.value)}
      id={id}
      value={localInputValue}
      type="number"
      inputMode="decimal"
      step="any"
      endDecorator="CPUs"
      onKeyDown={onKeyDown}
    />
  );
};
