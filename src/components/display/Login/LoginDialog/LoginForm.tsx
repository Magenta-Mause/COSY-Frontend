import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
    <form
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
      <FieldGroup>
        <div className="-mb-5">
          <FieldLabel
            htmlFor="username"
            className={`text-button-accent text-2xl ${props.error ? "text-red-700" : ""}`}
          >
            {t("signIn.username")}
          </FieldLabel>
          <Input
            type="text"
            id="username"
            name="username"
            className={`text-xl ${props.error ? "border-red-700" : ""}`}
            required
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="password"
            className={`text-button-accent text-2xl ${props.error ? "text-red-700" : ""}`}
          >
            {t("signIn.password")}
          </FieldLabel>
          <Input
            type="password"
            id="password"
            name="password"
            className={`text-xl ${props.error ? "border-red-700" : ""}`}
            required
          />
          {props.error && <FieldError className="text-red-700 mt-1">{props.error}</FieldError>}
        </div>

        <a href="#test" className="underline flex justify-end text-link text-xl -my-4">
          {t("signIn.resetPassword")}
        </a>

        <Button type="submit" disabled={props.isLoading} variant={"stardewDark"} className="w-full">
          {props.isLoading ? t("signIn.loading") : t("signIn.signIn")}
        </Button>

        <p className="text-button-accent leading-none text-xl -mt-5 -mb-2">
          {t("signIn.continueMeansAccept")}{" "}
          <a href="#test" className="underline text-link text-xl">
            {t("signIn.legal")}
          </a>
        </p>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
