import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import type { ZodType } from "zod";
import { CpuLimitInput } from "@/components/display/CpuLimit/CpuLimitInput.tsx";

const CpuLimitInputField = (props: {
  id: string;
  value?: string | number | null;
  onChange: (value: string | null) => void;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onValidityChange?: (isValid: boolean) => void;
  onTouchedChange?: (touched: boolean) => void;
  customErrorMessage?: string;
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const isError = touched && !isValid;
  const displayError = props.customErrorMessage || props.errorLabel;

  const validate = useCallback(
    (value: unknown) => {
      if (props.optional && (value === null || value === undefined || value === "")) return true;
      return props.validator.safeParse(value).success;
    },
    [props.optional, props.validator],
  );

  const reportValidity = useCallback(
    (valid: boolean, isTouched: boolean) => {
      props.onValidityChange?.(valid);
      props.onTouchedChange?.(isTouched);
    },
    [props.onTouchedChange, props.onValidityChange],
  );

  const changeCallback = useCallback(
    (value: string) => {
      setTouched(true);

      if (value === "" && props.defaultValue !== undefined) {
        props.onChange(props.defaultValue);
        const valid = validate(props.defaultValue);
        setIsValid(valid);
        reportValidity(valid, true);
        return;
      }

      const valToSend = value === "" ? null : value;
      props.onChange(valToSend);
      const valid = validate(valToSend);
      setIsValid(valid);
      reportValidity(valid, true);
    },
    [props.defaultValue, props.onChange, reportValidity, validate],
  );

  useEffect(() => {
    if (props.defaultValue !== undefined && (props.value === undefined || props.value === null)) {
      props.onChange(props.defaultValue);
      const valid = validate(props.defaultValue);
      setIsValid(valid);
      reportValidity(valid, touched);
    }
  }, [props.defaultValue, props.onChange, props.value, reportValidity, touched, validate]);

  useEffect(() => {
    if (props.optional) {
      setIsValid(true);
      setTouched(true);
      reportValidity(true, true);
    }
  }, [props.optional, reportValidity]);

  useEffect(() => {
    if (!props.onTouchedChange && !props.onValidityChange) return;

    const isEmpty = props.value === null || props.value === undefined || props.value === "";
    const isTouched = props.optional ? true : !isEmpty;
    const valid = isEmpty ? !!props.optional : validate(props.value);
    reportValidity(valid, isTouched);
  }, [
    props.value,
    props.optional,
    validate,
    reportValidity,
    props.onTouchedChange,
    props.onValidityChange,
  ]);

  return (
    <div className="py-2">
      <CpuLimitInput
        id={props.id}
        header={props.label}
        error={isError ? displayError : undefined}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(val) => changeCallback(val)}
        onKeyDown={props.onKeyDown}
        description={props.description}
      />
    </div>
  );
};

export default CpuLimitInputField;
