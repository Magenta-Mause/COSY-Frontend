import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameServerDto, RCONConfiguration } from "@/api/generated/model";
import InputFieldEditGameServer from "@/components/display/GameServer/EditGameServer/InputFieldEditGameServer.tsx";
import SettingsActionButtons from "@/components/display/GameServer/GameServerSettings/SettingsActionButtons.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import UnsavedModal from "@/components/ui/UnsavedModal";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import { coercedPortValidator } from "@/lib/validators/portValidator.ts";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";

const RconSettings = (props: {
  gameServer: GameServerDto;
  onConfirm: (updatedState: RCONConfiguration) => Promise<void>;
}) => {
  const { t } = useTranslationPrefix("components.gameServerSettings.rconSettings");
  const [loading, setLoading] = useState(false);
  const [rconState, setRconState] = useState<RCONConfiguration | undefined>(
    () => props.gameServer.rcon_configuration,
  );
  const [rconEnabled, setRconEnabled] = useState(rconState?.enabled ?? false);
  const [rconPort, setRconPort] = useState<string | undefined>(rconState?.port?.toString() ?? "");
  const [rconPassword, setRconPassword] = useState<string | undefined>(rconState?.password);

  useEffect(() => {
    const newRconConfig = props.gameServer.rcon_configuration;
    setRconState(newRconConfig);
    setRconEnabled(newRconConfig?.enabled ?? false);
    setRconPort(
      newRconConfig?.port !== undefined && newRconConfig?.port !== null
        ? newRconConfig.port.toString()
        : "",
    );
    setRconPassword(newRconConfig?.password);
  }, [props.gameServer]);

  const allFieldsValid = useMemo(() => {
    const rconPortValid = coercedPortValidator.safeParse(rconPort).success;
    const rconPasswordValid = requiredStringValidator.safeParse(rconPassword).success;

    return (rconPasswordValid && rconPortValid) || !rconEnabled;
  }, [rconPassword, rconPort, rconEnabled]);

  const isChanged = useMemo(() => {
    const rconEnabledChanged = rconEnabled !== (rconState?.enabled ?? false);
    const rconPasswordChanged = rconPassword !== rconState?.password;
    const rconPortChanged = !(
      (rconPort === "" && (rconState?.port === undefined || rconState?.port === null)) ||
      Number(rconPort) === rconState?.port
    );

    return rconPasswordChanged || rconPortChanged || rconEnabledChanged;
  }, [
    rconPassword,
    rconPort,
    rconState?.password,
    rconState?.port,
    rconEnabled,
    rconState?.enabled,
  ]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await props.onConfirm({
        enabled: rconEnabled,
        password: rconPassword,
        ...(rconPort !== "" && { port: Number(rconPort) }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = useCallback(() => {
    setRconEnabled(rconState?.enabled ?? false);
    setRconPort(rconState?.port?.toString() ?? "");
    setRconPassword(rconState?.password);
  }, [rconState]);

  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ lineHeight: "initial" }}>{t("title")}</h2>
        <p className={"text-sm text-muted-foreground leading-none"}>
          {t("description.part1")} <br />
          {t("description.part2")}{" "}
          <a
            href={"https://developer.valvesoftware.com/wiki/Source_RCON_Protocol"}
            className={"text-button-primary-active/80 underline"}
            target={"_blank"}
            rel="noopener"
          >
            {t("description.rcon")}
          </a>{" "}
          {t("description.part3")}
        </p>
      </div>

      <div className="flex flex-col gap-4" style={{ maxHeight: "calc(100vh - 20rem)" }}>
        {/* biome-ignore lint/a11y/useSemanticElements: Checkbox wrapper needs to be clickable */}
        <div
          className={"cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"}
          onClick={() => setRconEnabled((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setRconEnabled((prev) => !prev);
            }
          }}
          role={"button"}
          tabIndex={0}
        >
          <Checkbox checked={rconEnabled} className={"size-5"} tabIndex={-1} />
          <span className={"text-sm"}>{t("enableRcon")}</span>
        </div>
        <InputFieldEditGameServer
          label={t("rconPort.title")}
          value={rconPort}
          onChange={(v) => setRconPort((v as string) ?? "")}
          validator={coercedPortValidator}
          placeholder="25575"
          description={t("rconPort.description")}
          errorLabel={t("rconPort.errorLabel")}
          optional={!rconEnabled}
          disabled={!rconEnabled}
          onEnterPress={isConfirmButtonDisabled ? undefined : handleConfirm}
        />

        <InputFieldEditGameServer
          label={t("rconPassword.title")}
          value={rconPassword === undefined ? "" : String(rconPassword)}
          onChange={(v) => setRconPassword(v as string)}
          validator={requiredStringValidator}
          placeholder="mysecretpassword"
          description={t("rconPassword.description")}
          errorLabel={t("rconPassword.errorLabel")}
          optional={!rconEnabled}
          disabled={!rconEnabled}
          onEnterPress={isConfirmButtonDisabled ? undefined : handleConfirm}
        />
      </div>

      <SettingsActionButtons
        onRevert={handleRevert}
        onConfirm={handleConfirm}
        revertDisabled={loading || !isChanged}
        confirmDisabled={isConfirmButtonDisabled}
        loading={loading}
      />
      <UnsavedModal isChanged={isChanged} onSave={handleConfirm} />
    </div>
  );
};

export default RconSettings;
