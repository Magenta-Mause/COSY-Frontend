import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export const GameServerNotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslationPrefix("serverPage");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xl">{t("notFound")}</span>
        <Button
          onClick={() => {
            navigate({ to: "/" });
          }}
        >
          {t("notFoundGoBack")}
        </Button>
      </div>
    </div>
  );
};
