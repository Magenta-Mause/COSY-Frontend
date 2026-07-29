import { useContext, useState } from "react";
import { login } from "@/api/generated/backend-api";
import HerzIcon from "@/assets/deko/herz.webp";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import LoginBanner from "../LoginBanner/LoginBanner";
import LoginForm from "../LoginDialog/LoginForm";

const LoginDisplay = () => {
  const { t } = useTranslationPrefix("signIn");
  const { authorized, refreshIdentityToken } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      await login(credentials);

      await refreshIdentityToken();

      setOpen(false);
    } catch {
      setError(t("incorrectCredentials"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    !authorized && (
      <div>
        <div className="w-full flex justify-center">
          <LoginBanner setOpen={setOpen} />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-100">
            <DialogTitle>{t("signIn")}</DialogTitle>
            <DialogDescription>{t("desc")}</DialogDescription>
            <LoginForm loginCallback={handleLogin} error={error} />
            <DialogFooter>
              <Button
                type="submit"
                form="login-form"
                data-testid="login-submit-btn"
                loading={isLoggingIn}
                loadingLabel={t("loading")}
                className="w-full"
              >
                {t("signIn")}
              </Button>
              <p className="flex items-center gap-1">
                Made with{" "}
                <img
                  src={HerzIcon}
                  alt="love"
                  className="w-4 h-4 inline-block"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(17%) sepia(97%) saturate(7426%) hue-rotate(1deg) brightness(98%) contrast(114%)",
                  }}
                />{" "}
                by Medalheads
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  );
};

export default LoginDisplay;
