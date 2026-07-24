import AccessGroupEditComponent from "@/components/display/AccessGroups/AccessGroupEditComponent/AccessGroupEditComponent";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

export default function AccessManagementSettingsSection() {
  const { t } = useTranslationPrefix("components.GameServerSettings.accessManagement");
  const { gameServer } = useSelectedGameServer();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ lineHeight: "initial" }}>{t("title")}</h2>
        <p className={"text-sm text-muted-foreground leading-none"}>{t("description")}</p>
      </div>
      <AccessGroupEditComponent gameServer={gameServer} />
    </div>
  );
}
