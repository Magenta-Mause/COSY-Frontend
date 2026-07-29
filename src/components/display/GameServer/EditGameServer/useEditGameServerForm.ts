import { useContext, useEffect, useMemo, useState } from "react";
import { quote } from "shell-quote";
import type { GameServerDto, GameServerUpdateDto } from "@/api/generated/model";
import { AuthContext } from "@/components/technical/Providers/AuthProvider/AuthProvider.tsx";
import {
  annotationsToEntries,
  areEditFieldsValid,
  buildUpdatePayload,
  isGameServerChanged,
  toEditFormState,
} from "./editGameServerFormLib.ts";

interface UseEditGameServerFormArgs {
  gameServer: GameServerDto;
  onConfirm: (updatedState: GameServerUpdateDto) => Promise<void>;
}

export const useEditGameServerForm = ({ gameServer, onConfirm }: UseEditGameServerFormArgs) => {
  const { cpuLimit, memoryLimit } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [gameServerState, setGameServerState] = useState<GameServerUpdateDto>(() =>
    toEditFormState(gameServer),
  );
  const [executionCommandRaw, setExecutionCommandRaw] = useState(
    quote(gameServerState.execution_command ?? []),
  );
  const [annotationEntries, setAnnotationEntries] = useState<{ key: string; value: string }[]>(() =>
    annotationsToEntries(gameServerState.annotations),
  );
  const [_memoryErrorMessage, setMemoryErrorMessage] = useState<string | undefined>(undefined);
  const [cpuError, setCpuError] = useState<string | undefined>(undefined);
  const [memoryError, setMemoryError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const updatedState = toEditFormState(gameServer);
    setGameServerState(updatedState);
    setExecutionCommandRaw(quote(updatedState.execution_command ?? []));
    setAnnotationEntries(annotationsToEntries(updatedState.annotations));
  }, [gameServer]);

  const allFieldsValid = useMemo(
    () =>
      areEditFieldsValid(gameServerState, { cpuLimit, memoryLimit }) && !cpuError && !memoryError,
    [gameServerState, cpuLimit, memoryLimit, cpuError, memoryError],
  );

  const isChanged = useMemo(
    () => isGameServerChanged(gameServerState, gameServer, executionCommandRaw, annotationEntries),
    [gameServerState, gameServer, executionCommandRaw, annotationEntries],
  );

  const handleRevert = () => {
    const reverted = toEditFormState(gameServer);
    setGameServerState(reverted);
    setExecutionCommandRaw(quote(gameServer.execution_command ?? []));
    setAnnotationEntries(annotationsToEntries(reverted.annotations));
  };

  const handleConfirm = async () => {
    const payload = buildUpdatePayload(gameServerState, executionCommandRaw, annotationEntries);
    setLoading(true);
    try {
      await onConfirm(payload);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
