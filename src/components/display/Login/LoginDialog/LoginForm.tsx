import { useState } from "react";
import eyeClosed from "@/assets/icons/eyeClosed.webp";
import eyeOpen from "@/assets/icons/eyeOpen.webp";
import { FieldGroup } from "@/components/ui/field";
import Icon from "@/components/ui/Icon";
import { Input } from "@/components/ui/input";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

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
  const { t } = useTranslationPrefix("signIn");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      id="login-form"
      onSubmit={(event) => {
        event.preventDefault();
        // onSubmit is typed against HTMLFormElement, so narrow here to reach the named inputs.
        const form = event.currentTarget as SignInElement;
        const data = {
          username: form.elements.username.value,
          password: form.elements.password.value,
        };
        props.loginCallback(data);
      }}
    >
      <FieldGroup className="gap-2">
        <Input
          type="text"
          id="username"
          name="username"
          header={t("username")}
          data-testid="login-username-input"
          required
        />

        <Input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          header={t("password")}
          error={props.error}
          data-testid="login-password-input"
          required
          endDecorator={
            <button
              type="button"
              className="opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
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
