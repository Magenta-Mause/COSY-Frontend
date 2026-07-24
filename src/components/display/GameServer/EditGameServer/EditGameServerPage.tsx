import SettingsActionButtons from "@/components/display/GameServer/GameServerSettings/SettingsActionButtons.tsx";
import UnsavedModal from "@/components/ui/UnsavedModal";
import {
  type GameServerDto,
  GameServerDtoStatus,
  type GameServerUpdateDto,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import AdvancedServerFields from "./AdvancedServerFields";
import CoreServerFields from "./CoreServerFields";
import HardwareLimitFields from "./HardwareLimitFields";
import { useEditGameServerForm } from "./useEditGameServerForm.ts";

const EditGameServerPage = (props: {
  serverName: string;
  gameServer: GameServerDto;
  onConfirm: (updatedState: GameServerUpdateDto) => Promise<void>;
}) => {
  const { t } = useTranslationPrefix("components.editGameServer");
  const {
    cpuLimit,
    memoryLimit,
    loading,
    gameServerState,
    setGameServerState,
    executionCommandRaw,
    setExecutionCommandRaw,
    annotationEntries,
    setAnnotationEntries,
    setMemoryErrorMessage,
    setCpuError,
    setMemoryError,
    allFieldsValid,
    isChanged,
    handleRevert,
    handleConfirm,
  } = useEditGameServerForm({ gameServer: props.gameServer, onConfirm: props.onConfirm });

  const isServerActive =
    props.gameServer.status !== GameServerDtoStatus.STOPPED &&
    props.gameServer.status !== GameServerDtoStatus.FAILED;
  const isConfirmButtonDisabled = loading || !isChanged || !allFieldsValid;
  const onEnterPress = isConfirmButtonDisabled ? undefined : handleConfirm;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ lineHeight: "initial" }}>{t("title")}</h2>
        <p className="text-sm text-muted-foreground leading-none">{t("description")}</p>
        {isServerActive && (
          <span className={"text-button-destructive-default text-sm"}>
            {t("serverNeedsToBeStopped")}
          </span>
        )}
      </div>

      <CoreServerFields
        gameServerState={gameServerState}
        setGameServerState={setGameServerState}
        createdOn={props.gameServer.created_on}
        originalVolumeMounts={props.gameServer.volume_mounts}
        isServerActive={isServerActive}
        loading={loading}
        onEnterPress={onEnterPress}
      />

      <AdvancedServerFields
        executionCommandRaw={executionCommandRaw}
        setExecutionCommandRaw={setExecutionCommandRaw}
        annotationEntries={annotationEntries}
        setAnnotationEntries={setAnnotationEntries}
        hostVolumeMounts={gameServerState.host_volume_mounts}
        setGameServerState={setGameServerState}
        disabled={isServerActive || loading}
        onEnterPress={onEnterPress}
      />

      <HardwareLimitFields
        cpuLimit={cpuLimit}
        memoryLimit={memoryLimit}
        cpuCores={gameServerState.docker_hardware_limits?.docker_max_cpu_cores}
        memoryLimitValue={gameServerState.docker_hardware_limits?.docker_memory_limit}
        setGameServerState={setGameServerState}
        setCpuError={setCpuError}
        setMemoryError={setMemoryError}
        setMemoryErrorMessage={setMemoryErrorMessage}
        disabled={isServerActive || loading}
      />

      <SettingsActionButtons
        onRevert={handleRevert}
        onConfirm={handleConfirm}
        revertDisabled={loading || !isChanged}
        confirmDisabled={isConfirmButtonDisabled || isServerActive}
        loading={loading}
        confirmTooltip={isServerActive && t("serverNeedsToBeStopped")}
      />
      <UnsavedModal isChanged={isChanged} onSave={handleConfirm} />
    </div>
  );
};

export default EditGameServerPage;
