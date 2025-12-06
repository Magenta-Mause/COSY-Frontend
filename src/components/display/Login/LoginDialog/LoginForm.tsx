import { Form, FormControl, FormLabel, FormMessage, FormSubmit } from "@components/ui/form";
import { Input } from "@components/ui/input";
import { FormField } from "@radix-ui/react-form";
import { useTranslation } from "react-i18next";

interface FormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const LoginForm = (props: {
  loginCallback: (formValues: { username: string; password: string }) => void;
  error: string | null;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Form
      onSubmit={(event: React.FormEvent<SignInElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = {
          username: form.elements.username.value,
          password: form.elements.password.value,
        };
        props.loginCallback(data);
      }}
    >
      <FormField name="username">
        <FormLabel
          htmlFor="username"
          className={`text-button-accent ${props.error ? "text-red-700" : ""}`}
        >
          {t("signIn.username")}
        </FormLabel>
        <FormControl asChild className="text-2xl">
          <Input
            type="text"
            id="username"
            name="username"
            className={`bg-primary-banner [box-shadow:inset_0_1_2_2px_rgba(132,66,57,0.4)] ${props.error ? "border-red-700" : ""}`}
            required
          />
        </FormControl>

        <FormField name="password">
          <FormLabel
            htmlFor="password"
            className={`text-button-accent ${props.error ? "text-red-700" : ""}`}
          >
            {t("signIn.password")}
          </FormLabel>
          <FormControl asChild className="text-2xl">
            <Input
              type="password"
              id="password"
              name="password"
              className={`bg-primary-banner [box-shadow:inset_0_1_2_2px_rgba(132,66,57,0.4)] ${props.error ? "border-red-700" : ""}`}
              required
            />
          </FormControl>
          {props.error && (
            <FormMessage className="text-error text-red-700 mt-1">{props.error}</FormMessage>
          )}
        </FormField>

        <div className="flex flex-col gap-4 mt-4">
          <FormMessage className="underline flex justify-end text-link -my-2">
            {t("signIn.resetPassword")}
          </FormMessage>
          <FormSubmit type="submit" disabled={props.isLoading}>
            {props.isLoading ? t("signIn.loading") : t("signIn.signIn")}
          </FormSubmit>
          <FormMessage className="text-button-accent leading-none">
            {t("signIn.continueMeansAccept")}{" "}
            <span className="underline text-link">{t("signIn.legal")}</span>
          </FormMessage>
        </div>
      </FormField>
    </Form>
  );
};

export default LoginForm;
