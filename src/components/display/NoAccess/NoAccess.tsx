import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

interface NoAccessProps {
  element: string;
}

export default function NoAccess({ element }: NoAccessProps) {
  const { t } = useTranslationPrefix("settings");

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">{t("noAccessFor", { element })}</div>
        <div className="text-muted-foreground">{t("noAccessDescription")}</div>
      </div>
    </div>
  );
}
