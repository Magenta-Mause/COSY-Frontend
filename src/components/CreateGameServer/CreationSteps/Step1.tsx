import GenericGameServerCreationInputField from "@components/CreateGameServer/GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "@components/CreateGameServer/GenericGameServerCreationPage.tsx";
import { DialogTitle } from "@components/ui/dialog.tsx";
import * as z from "zod";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";

const GameServerCreationGameNamePage = () => {
  const { t } = useTranslationPrefix("components.CreateGameServer.steps.step1");

  return (
    <GenericGameServerCreationPage>
      <DialogTitle>{t("title")}</DialogTitle>
      <GenericGameServerCreationInputField
        attribute="game_uuid"
        validator={z.string().min(1)}
        placeholder="Minecraft Server"
        label={t("gameSelection.title")}
        description={t("gameSelection.description")}
        errorLabel={t("gameSelection.errorLabel")}
      />
    </GenericGameServerCreationPage>
  );
};

export default GameServerCreationGameNamePage;
