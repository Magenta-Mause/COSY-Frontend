import { Button } from "@components/ui/button";
import { useTranslation } from "react-i18next";
import papyrusScroll from "@/assets/MainPage/LoginPapyrusScroll.png";

const LoginBanner = (props: { setOpen: (open: boolean) => void }) => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed bottom-25 content-center"
      tabIndex={-1}
      style={{
        backgroundImage: `url(${papyrusScroll})`,
        backgroundSize: "100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        imageRendering: "pixelated",
        height: "7rem",
        width: "36rem",
      }}
    >
      <div className="flex items-center justify-center gap-9 pt-4">
        <p className="text-xl">{t("signIn.question")}</p>
        <Button className="h-15" data-testid="login-open-btn" onClick={() => props.setOpen(true)}>
          {t("signIn.signIn")}
        </Button>
      </div>
    </div>
  );
};

export default LoginBanner;
