import { useState } from "react";
import { useTranslation } from "react-i18next";
import eyeClosed from "@/assets/icons/eyeClosed.webp";
import eyeOpen from "@/assets/icons/eyeOpen.webp";
import { FieldGroup } from "@/components/ui/field";
import Icon from "@/components/ui/Icon";
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
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      id="login-form"
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
      <FieldGroup className="gap-2">
        <Input type="text" id="username" name="username" header={t("signIn.username")} required />

        <Input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          header={t("signIn.password")}
          error={props.error}
          required
          endDecorator={
            <button
              type="button"
              className="opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("signIn.hidePassword") : t("signIn.showPassword")}
            >
              <Icon
                src={showPassword ? eyeOpen : eyeClosed}
                variant="foreground"
                className="size-5"
              />
            </button>
          }
        />
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
