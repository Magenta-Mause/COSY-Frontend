import type { Dispatch, SetStateAction } from "react";
import * as z from "zod";
import type { GameServerUpdateDto, HostVolumeMountConfigurationDto } from "@/api/generated/model";
import Collapsible from "@/components/ui/Collapsible.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";
import EditHostVolumeMountConfigurationInput from "@/components/display/GameServer/EditGameServer/inputs/EditHostVolumeMountConfigurationInput";
import InputFieldEditGameServer from "@/components/display/GameServer/EditGameServer/InputFieldEditGameServer";
import EditKeyValueInput from "@/components/display/GameServer/EditGameServer/KeyValueInputEditGameServer";

interface AdvancedServerFieldsProps {
  readonly executionCommandRaw: string;
  readonly setExecutionCommandRaw: Dispatch<SetStateAction<string>>;
  readonly annotationEntries: { key: string; value: string }[];
  readonly setAnnotationEntries: Dispatch<SetStateAction<{ key: string; value: string }[]>>;
  readonly hostVolumeMounts?: HostVolumeMountConfigurationDto[];
  readonly setGameServerState: Dispatch<SetStateAction<GameServerUpdateDto>>;
  readonly disabled: boolean;
  readonly onEnterPress?: () => void;
}

const AdvancedServerFields = ({
  executionCommandRaw,
  setExecutionCommandRaw,
  annotationEntries,
  setAnnotationEntries,
  hostVolumeMounts,
  setGameServerState,
  disabled,
  onEnterPress,
}: AdvancedServerFieldsProps) => {
  const { t } = useTranslationPrefix("components.editGameServer");

  return (
    <Collapsible
      title={t("advancedSettings.title")}
      description={t("advancedSettings.description")}
      className="my-2"
    >
      <fieldset disabled={disabled}>
        <InputFieldEditGameServer
          validator={z.string()}
          placeholder="./start.sh"
          label={t("executionCommandSelection.title")}
          description={t("executionCommandSelection.description")}
          errorLabel={t("executionCommandSelection.errorLabel")}
          value={executionCommandRaw}
          onChange={(v) => setExecutionCommandRaw((v ?? "") as string)}
          onEnterPress={onEnterPress}
        />

        <EditKeyValueInput<{ key: string; value: string }>
          fieldLabel={t("annotationsSelection.title")}
          fieldDescription={t("annotationsSelection.description")}
          value={annotationEntries}
          setValue={(vals) => setAnnotationEntries(vals)}
          onChange={(vals) => setAnnotationEntries(vals)}
          placeHolderKeyInput="com.example.label"
          placeHolderValueInput="value"
          keyValidator={requiredStringValidator}
          valueValidator={requiredStringValidator}
          errorLabel={t("annotationsSelection.errorLabel")}
          required={false}
          inputType="text"
          objectKey="key"
          objectValue="value"
        />

        <EditHostVolumeMountConfigurationInput
          fieldLabel={t("hostVolumeMountSelection.title")}
          fieldDescription={t("hostVolumeMountSelection.description")}
          value={hostVolumeMounts}
          setValue={(vals) =>
            setGameServerState((s) => ({
              ...s,
              host_volume_mounts: vals,
            }))
          }
          onChange={(vals) =>
            setGameServerState((s) => ({
              ...s,
              host_volume_mounts: vals,
            }))
          }
          errorLabel={t("hostVolumeMountSelection.errorLabel")}
          hostPathPlaceholder={t("hostVolumeMountSelection.hostPathPlaceholder")}
          containerPathPlaceholder={t("hostVolumeMountSelection.containerPathPlaceholder")}
          readOnlyLabel={t("hostVolumeMountSelection.readOnlyLabel")}
        />
      </fieldset>
    </Collapsible>
  );
};

export default AdvancedServerFields;
