import { Input } from "@/components/ui/input.tsx";
import { useCallback, useEffect, useState } from "react";
import type { ZodType } from "zod";

const InputFieldEditGameServer = (props: {
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  validator: ZodType;
  placeholder: string;
  errorLabel: string;
  label?: string;
  description?: string;
  optional?: boolean;
  disabled?: boolean;
  inputType?: React.ComponentProps<"input">["type"];
  inputMode?: React.ComponentProps<"input">["inputMode"];
  step?: React.ComponentProps<"input">["step"];
  onEnterPress?: () => void;
  submitButtonLabel?: string;
  onSubmit?: () => void;
  isError?: boolean;
  submitDisabled?: boolean;
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const isError = (touched && !isValid) || props.isError === true;

  const validate = useCallback(
    (value: unknown) => {
      // If optional and empty, it's valid
      if (props.optional && (value === null || value === undefined || value === "")) {
        return true;
      }
      // If value is provided, it must pass validation (even when optional)
      return props.validator.safeParse(value).success;
    },
    [props.optional, props.validator],
  );

  const changeCallback = useCallback(
    (value: string) => {
      setTouched(true);

      props.onChange(value);
      setIsValid(validate(value));
    },
    [props, validate],
  );

  useEffect(() => {
    if (props.value !== undefined) {
      setIsValid(validate(props.value));
    }
  }, [props.value, validate]);

  useEffect(() => {
    if (props.optional) {
      setIsValid(true);
      setTouched(true);
    }
  }, [props.optional]);

  return (
    <div className="py-2">
      <Input
        header={props.label}
        description={props.description}
        error={isError ? props.errorLabel : undefined}
        placeholder={props.placeholder}
        value={props.value ?? ""}
        onChange={(e) => changeCallback(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && props.onEnterPress) {
            e.preventDefault();
            props.onEnterPress();
          }
        }}
        disabled={props.disabled}
        type={props.inputType}
        inputMode={props.inputMode}
        step={props.step}
        submitButtonLabel={props.submitButtonLabel}
        onSubmit={props.onSubmit}
        submitDisabled={props.submitDisabled}
      />
    </div>
  );
};

export default InputFieldEditGameServer;
