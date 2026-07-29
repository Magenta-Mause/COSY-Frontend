import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import {
  type EnvironmentVariableConfiguration,
  type GameServerUpdateDto,
  PortMappingProtocol,
  type VolumeMountConfiguration,
} from "@/api/generated/model";
import InputFieldEditGameServer from "@/components/display/GameServer/EditGameServer/InputFieldEditGameServer";
import EditVolumeMountConfigurationInput from "@/components/display/GameServer/EditGameServer/inputs/EditVolumeMountConfigurationInput";
import PortInputEditGameServer from "@/components/display/GameServer/EditGameServer/inputs/PortInputEditGameServer";
import EditKeyValueInput from "@/components/display/GameServer/EditGameServer/KeyValueInputEditGameServer";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { portValidator } from "@/lib/validators/portValidator.ts";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";

interface CoreServerFieldsProps {
  readonly gameServerState: GameServerUpdateDto;
  readonly setGameServerState: Dispatch<SetStateAction<GameServerUpdateDto>>;
  readonly createdOn?: string;
  readonly originalVolumeMounts?: VolumeMountConfiguration[];
  readonly isServerActive: boolean;
  readonly loading: boolean;
  readonly onEnterPress?: () => void;
}

const CoreServerFields = ({
  gameServerState,
  setGameServerState,
  createdOn,
  originalVolumeMounts,
  isServerActive,
  loading,
  onEnterPress,
}: CoreServerFieldsProps) => {
  const { t } = useTranslationPrefix("components.editGameServer");
  const { t: t_root } = useTranslation();

  return (
    <fieldset
      disabled={isServerActive || loading}
      data-disabled={isServerActive || undefined}
      data-loading={loading || undefined}
    >
      <InputFieldEditGameServer
        label={t("serverNameSelection.title")}
        value={gameServerState.server_name}
        onChange={(v) => setGameServerState((s) => ({ ...s, server_name: v as string }))}
        validator={requiredStringValidator}
        placeholder="My Game Server"
        description={t("serverNameSelection.description")}
        errorLabel={t("serverNameSelection.errorLabel")}
        onEnterPress={onEnterPress}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputFieldEditGameServer
          validator={z.number().int().positive()}
          placeholder="Game"
          label={t("gameSelection.title")}
          description={t("gameSelection.description")}
          errorLabel={t("gameSelection.errorLabel")}
          value={gameServerState.external_game_id}
          disabled={true}
          onChange={() => {}}
          optional={true}
        />
        {createdOn && (
          <InputFieldEditGameServer
            validator={z.string()}
            placeholder=""
            label={t("createdOn.title")}
            description={t("createdOn.description")}
            errorLabel=""
            value={new Date(createdOn).toLocaleString(t_root("timerange.localTime"), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            disabled={true}
            onChange={() => {}}
            optional={true}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputFieldEditGameServer
          validator={requiredStringValidator}
          placeholder="nginx"
          label={t("dockerImageSelection.title")}
          description={t("dockerImageSelection.description")}
          errorLabel={t("dockerImageSelection.errorLabel")}
          value={gameServerState.docker_image_name}
          onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_name: v as string }))}
          onEnterPress={onEnterPress}
        />
        <InputFieldEditGameServer
          validator={requiredStringValidator}
          placeholder="latest"
          label={t("imageTagSelection.title")}
          description={t("imageTagSelection.description")}
          errorLabel={t("imageTagSelection.errorLabel")}
          value={gameServerState.docker_image_tag}
          onChange={(v) => setGameServerState((s) => ({ ...s, docker_image_tag: v as string }))}
          onEnterPress={onEnterPress}
        />
      </div>

      <PortInputEditGameServer
        fieldLabel={t("portSelection.title")}
        fieldDescription={t("portSelection.description")}
        value={gameServerState.port_mappings}
        setValue={(vals) =>
          setGameServerState((s) => ({
            ...s,
            port_mappings: vals,
          }))
        }
        onChange={(ports) =>
          setGameServerState((s) => ({
            ...s,
            port_mappings: ports.map((p) => {
              const hasPorts = p.instance_port || p.container_port;

              return {
                ...p,
                protocol: hasPorts ? p.protocol || PortMappingProtocol.TCP : undefined,
              };
            }),
          }))
        }
        keyValidator={portValidator}
        valueValidator={portValidator}
        errorLabel={t("portSelection.errorLabel")}
        required={false}
      />

      <EditKeyValueInput<{
        key: string;
        value: string;
      }>
        fieldLabel={t("environmentVariablesSelection.title")}
        fieldDescription={t("environmentVariablesSelection.description")}
        value={gameServerState.environment_variables}
        setValue={(vals) =>
          setGameServerState((s) => ({
            ...s,
            environment_variables: vals as EnvironmentVariableConfiguration[] | undefined,
          }))
        }
        onChange={(envs) =>
          setGameServerState((s) => ({
            ...s,
            environment_variables: envs,
          }))
        }
        placeHolderKeyInput="KEY"
        placeHolderValueInput="VALUE"
        keyValidator={requiredStringValidator}
        valueValidator={requiredStringValidator}
        errorLabel={t("environmentVariablesSelection.errorLabel")}
        required={false}
        inputType="text"
        objectKey="key"
        objectValue="value"
        processEscapeSequences={true}
      />

      <EditVolumeMountConfigurationInput<{ container_path: string; uuid?: string }>
        fieldLabel={t("volumeMountSelection.title")}
        fieldDescription={t("volumeMountSelection.description")}
        value={gameServerState.volume_mounts}
        originalVolumeMounts={originalVolumeMounts}
        setValue={(vals) =>
          setGameServerState((s) => ({
            ...s,
            volume_mounts: vals,
          }))
        }
        onChange={(volumes) =>
          setGameServerState((s) => ({
            ...s,
            volume_mounts: volumes,
          }))
        }
        placeholder="/data"
        validator={requiredStringValidator}
        errorLabel={t("hostPathSelection.errorLabel")}
        required={false}
        inputType="text"
        objectKey="container_path"
      />
    </fieldset>
  );
};

export default CoreServerFields;
