import GenericGameServerCreationInputField from "@components/CreateGameServer/GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "@components/CreateGameServer/GenericGameServerCreationPage.tsx";
import { DialogTitle } from "@components/ui/dialog.tsx";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const GameServerCreationGameNamePage = () => {
  const { t } = useTranslation(undefined, { keyPrefix: "components.CreateGameServer.steps.step1" });

  return (
    <GenericGameServerCreationPage>
      <DialogTitle>{t("title")}</DialogTitle>
      <GenericGameServerCreationInputField
        attribute="gameUuid"
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
