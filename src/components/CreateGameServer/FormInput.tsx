import { Field, FieldDescription, FieldError, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import type {
  FormAsyncValidateOrFn,
  FormValidateOrFn,
  ReactFormExtendedApi,
} from "@tanstack/react-form";

interface Props<FormData> {
  form: ReactFormExtendedApi<
    FormData,
    FormValidateOrFn<FormData> | undefined,
    FormValidateOrFn<FormData> | undefined,
    FormAsyncValidateOrFn<FormData> | undefined,
    FormValidateOrFn<FormData> | undefined,
    FormAsyncValidateOrFn<FormData> | undefined,
    FormValidateOrFn<FormData> | undefined,
    FormAsyncValidateOrFn<FormData> | undefined,
    FormValidateOrFn<FormData> | undefined,
    FormAsyncValidateOrFn<FormData> | undefined,
    FormAsyncValidateOrFn<FormData> | undefined,
    unknown
  >;
  placeholder: string;
  title: string;
  description: string;
  fieldName: string;
}

export default function FormInput<T>({
  form,
  placeholder,
  title,
  description,
  fieldName,
}: Props<T>) {
  return (
    <form.Field name={fieldName}>
      {(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field>
            <FieldLabel htmlFor={field.name}>{title}</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder={placeholder}
            />
            <FieldDescription>{description}</FieldDescription>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
