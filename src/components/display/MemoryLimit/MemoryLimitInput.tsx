import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import RequiredMark from "@/components/ui/RequiredMark.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

interface MemoryLimitInputProps {
  id?: string;
  header?: React.ReactNode;
  isRequired?: boolean;
  description?: string;
  value?: number | string | null;
  onChange: (value: string) => void; // Emits string (e.g. "100MiB" or "1GiB")
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  "data-testid"?: string;
}

export const MemoryLimitInput = ({
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
  "data-testid": dataTestId,
}: MemoryLimitInputProps) => {
  const [unit, setUnit] = useState<"MiB" | "GiB">("MiB");
  const [localInputValue, setLocalInputValue] = useState("");

  const updateParent = useCallback(
    (inputValue: string, currentUnit: "MiB" | "GiB") => {
      if (inputValue === "") {
        onChange("");
        return;
      }

      const numericValue = parseFloat(inputValue);
      if (Number.isNaN(numericValue)) {
        onChange(inputValue); // Let parent validation handle NaN if needed
        return;
      }

      onChange(`${numericValue}${currentUnit}`);
    },
    [onChange],
  );

  const handleInputChange = (inputValue: string) => {
    setLocalInputValue(inputValue);
    updateParent(inputValue, unit);
  };

  const handleUnitChange = (newUnit: "MiB" | "GiB") => {
    setUnit(newUnit);
    updateParent(localInputValue, newUnit);
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
    const isGiB = stringVal.endsWith("GiB");
    const isMiB = stringVal.endsWith("MiB");

    const numericPart = parseFloat(stringVal);
    let detectedUnit: "MiB" | "GiB" = "MiB";

    if (isGiB) {
      detectedUnit = "GiB";
    } else if (isMiB) {
      detectedUnit = "MiB";
    }

    if (Number.isNaN(numericPart)) return;

    // Avoid loops: check if effectively same
    if (localInputValue === numericPart.toString() && unit === detectedUnit) {
      return;
    }

    setUnit(detectedUnit);
    setLocalInputValue(numericPart.toString());
  }, [value, localInputValue, unit]);

  const unitSelector = (
    <div className="pointer-events-auto h-full flex items-center">
      <Select value={unit} onValueChange={(v) => handleUnitChange(v as "MiB" | "GiB")}>
        <SelectTrigger className="text-base h-6 w-fit border-none shadow-none bg-transparent focus:ring-0 px-1 gap-1 text-muted-foreground hover:bg-transparent">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MiB">MiB</SelectItem>
          <SelectItem value="GiB">GiB</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

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
      className={`pr-16 ${className ?? ""}`}
      error={error}
      placeholder={placeholder}
      onChange={(e) => handleInputChange(e.target.value)}
      id={id}
      value={localInputValue}
      type="number"
      endDecorator={unitSelector}
      onKeyDown={onKeyDown}
      data-testid={dataTestId}
    />
  );
};
