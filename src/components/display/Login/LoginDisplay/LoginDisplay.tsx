import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/dialog";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { login } from "@/api/generated/backend-api";
import LoginBanner from "../LoginBanner/LoginBanner";
import LoginForm from "../LoginDialog/LoginForm";

const LoginDisplay = () => {
  const { t } = useTranslation();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    !authorized && (
      <div>
        <div className="w-full flex justify-center absolute bottom-10 right-10">
          <LoginBanner setOpen={setOpen} />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-primary-modal-background text- w-100">
            <DialogTitle className="text-3xl">{t("signIn.signIn")}</DialogTitle>
            <DialogDescription className="text-lg -my-5">{t("signIn.desc")}</DialogDescription>
            <LoginForm loginCallback={handleLogin} error={error} isLoading={isLoggingIn} />
          </DialogContent>
        </Dialog>
      </div>
    )
  );
};

export default LoginDisplay;
