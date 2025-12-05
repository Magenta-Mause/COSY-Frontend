import GenericGameServerCreationInputField from "@components/CreateGameServer/GenericGameServerCreationInputField.tsx";
import GenericGameServerCreationPage from "@components/CreateGameServer/GenericGameServerCreationPage.tsx";
import {DialogTitle} from "@components/ui/dialog.tsx";
import {useTranslation} from "react-i18next";
import * as z from "zod";

const GameServerCreationGameNamePage = () => {
    const {t} = useTranslation();
    console.log("Rerendering");

    return (
        <GenericGameServerCreationPage>
            <DialogTitle>{t("components.CreateGameServer.steps.step1.title")}</DialogTitle>{" "}
            <GenericGameServerCreationInputField
                attribute={"serverName"}
                validator={z.string().min(1)}
                placeholder={"Minecraft Server"}
                label={"Server Name"}
            />
        </GenericGameServerCreationPage>
    );
};

export default GameServerCreationGameNamePage;
