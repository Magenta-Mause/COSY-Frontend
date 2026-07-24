import type { Dispatch, SetStateAction } from "react";
import { useCallback, useState } from "react";
import { parse as parseCommand } from "shell-quote";
import type { GameServerCreationDto, GameServerDto, TemplateEntity } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions.tsx";
import type { GameServerCreationContext } from "./context.ts";
import { processEscapeSequences } from "./utils/inputValue";
import useCreationFormState from "./useCreationFormState.ts";
import { GENERIC_GAME_PLACEHOLDER_VALUE } from "./context.ts";

const TOTAL_PAGES = 3;

interface UseGameServerCreationProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}

interface UseGameServerCreationReturn {
  creationState: ReturnType<typeof useCreationFormState>["creationState"];
  isPageValid: { [key: number]: boolean };
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  showReapplyDialog: boolean;
  showConfirmDialog: boolean;
  showUnsavedChangesDialog: boolean;
  isCreating: boolean;
  showSuccessDialog: boolean;
  setShowSuccessDialog: Dispatch<SetStateAction<boolean>>;
  successInfo: { server: GameServerDto } | null;
  isLastPage: boolean;
  setGameServerState: GameServerCreationContext["setGameServerState"];
  setUtilState: GameServerCreationContext["setUtilState"];
  setCurrentPageValid: GameServerCreationContext["setCurrentPageValid"];
  triggerNextPage: GameServerCreationContext["triggerNextPage"];
  handleTemplateSelected: GameServerCreationContext["handleTemplateSelected"];
  handleBack: () => void;
  handleCloseAttempt: (open: boolean) => void;
  handleDiscardChanges: () => void;
  handleCancelClose: () => void;
  handleConfirmReapply: () => void;
  handleCancelReapply: () => void;
  handleConfirmCreate: () => Promise<void>;
  handleCancelConfirm: () => void;
}

const useGameServerCreation = ({
  setOpen,
  isOpen,
}: UseGameServerCreationProps): UseGameServerCreationReturn => {
  const { createGameServer } = useDataInteractions();

  const {
    creationState,
    hasUnsavedChanges,
    setGameServerState,
    setUtilState,
    resetCreationState,
    applyTemplateToState,
    selectTemplate,
    clearTemplate,
  } = useCreationFormState(isOpen);

  const [isPageValid, setPageValid] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pendingPageChange, setPendingPageChange] = useState<number | null>(null);
  const [showReapplyDialog, setShowReapplyDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ server: GameServerDto } | null>(null);

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  const setCurrentPageValid = useCallback(
    (isValid: boolean) => {
      setPageValid((prev) => ({ ...prev, [currentPage]: isValid }));
    },
    [currentPage],
  );

  const handleTemplateSelected = useCallback(
    (template: TemplateEntity) => {
      const defaults: Record<string, string | number | boolean> = {};
      template.variables?.forEach((variable) => {
        if (!variable.placeholder) return;
        if (variable.default != null) {
          const raw = variable.default;
          if (variable.type === "number" && !Number.isNaN(Number(raw))) {
            defaults[variable.placeholder] = Number(raw);
          } else if (variable.type === "boolean") {
            defaults[variable.placeholder] = String(raw) === "true";
          } else {
            defaults[variable.placeholder] = String(raw);
          }
        } else {
          defaults[variable.placeholder] = "";
        }
      });

      const hasVariables = (template.variables?.length ?? 0) > 0;
      selectTemplate(template, defaults, !hasVariables);
      setCurrentPage(1);
    },
    [selectTemplate],
  );

  const handleNextPage = useCallback(async () => {
    if (isLastPage) {
      setShowConfirmDialog(true);
      return;
    }

    if (currentPage === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage === 1) {
      const { selectedTemplate, templateApplied } = creationState.utilState;

      if (selectedTemplate) {
        const hasVariables = (selectedTemplate.variables?.length ?? 0) > 0;

        if (templateApplied && hasVariables) {
          setShowReapplyDialog(true);
          setPendingPageChange(currentPage + 1);
          return;
        }

        if (!templateApplied) {
          applyTemplateToState();
        }
      }
    }

    setCurrentPage((p) => p + 1);
  }, [currentPage, applyTemplateToState, creationState.utilState, isLastPage]);

  const triggerNextPage = useCallback(() => {
    if (isPageValid[currentPage]) {
      handleNextPage();
    }
  }, [handleNextPage, isPageValid, currentPage]);

  const handleBack = useCallback(() => {
    if (currentPage === 1) {
      clearTemplate();
    }
    setCurrentPage((p) => p - 1);
  }, [currentPage, clearTemplate]);

  const handleConfirmReapply = useCallback(() => {
    applyTemplateToState();
    setShowReapplyDialog(false);
    if (pendingPageChange !== null) {
      setCurrentPage(pendingPageChange);
      setPendingPageChange(null);
    }
  }, [applyTemplateToState, pendingPageChange]);

  const handleCancelReapply = useCallback(() => {
    setShowReapplyDialog(false);
    if (pendingPageChange !== null) {
      setCurrentPage(pendingPageChange);
      setPendingPageChange(null);
    }
  }, [pendingPageChange]);

  const handleConfirmCreate = useCallback(async () => {
    const formState = creationState.gameServerState;

    const annotationsRecord = (formState.annotations ?? []).reduce<Record<string, string>>(
      (acc, entry) => {
        const key = entry.key?.trim();
        if (key) acc[key] = processEscapeSequences(entry.value ?? "");
        return acc;
      },
      {},
    );

    const gameServerCreationObject: GameServerCreationDto = {
      server_name: formState.server_name ?? "",
      docker_image_name: formState.docker_image_name ?? "",
      docker_image_tag: formState.docker_image_tag ?? "",
      external_game_id:
        formState.external_game_id !== GENERIC_GAME_PLACEHOLDER_VALUE
          ? formState.external_game_id
          : undefined,
      execution_command: formState.execution_command
        ? (parseCommand(formState.execution_command as unknown as string) as string[])
        : undefined,
      port_mappings: formState.port_mappings,
      environment_variables: formState.environment_variables?.map((env) => ({
        ...env,
        value: processEscapeSequences(env.value),
      })),
      volume_mounts: formState.volume_mounts,
      host_volume_mounts: formState.host_volume_mounts?.filter(
        (m) => m.host_path?.trim() && m.container_path?.trim(),
      ),
      annotations: Object.keys(annotationsRecord).length > 0 ? annotationsRecord : undefined,
      docker_hardware_limits:
        formState.docker_max_cpu || formState.docker_max_memory
          ? {
              docker_max_cpu_cores: formState.docker_max_cpu
                ? parseFloat(formState.docker_max_cpu)
                : undefined,
              docker_memory_limit: formState.docker_max_memory || undefined,
            }
          : undefined,
      design: formState.design,
    };

    setIsCreating(true);
    try {
      const createdGameServer = await createGameServer(gameServerCreationObject);
      setShowConfirmDialog(false);
      setIsCreating(false);
      resetCreationState();
      setPageValid({});
      setCurrentPage(0);
      setOpen(false);
      setSuccessInfo({ server: createdGameServer });
      setShowSuccessDialog(true);
    } catch {
      setIsCreating(false);
    }
  }, [createGameServer, setOpen, creationState.gameServerState, resetCreationState]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  const handleCloseAttempt = useCallback(
    (open: boolean) => {
      if (!open && hasUnsavedChanges) {
        setShowUnsavedChangesDialog(true);
      } else if (!open) {
        setOpen(false);
      }
    },
    [hasUnsavedChanges, setOpen],
  );

  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedChangesDialog(false);
    resetCreationState();
    setPageValid({});
    setCurrentPage(0);
    setOpen(false);
  }, [setOpen, resetCreationState]);

  const handleCancelClose = useCallback(() => {
    setShowUnsavedChangesDialog(false);
  }, []);

  return {
    creationState,
    isPageValid,
    currentPage,
    setCurrentPage,
    showReapplyDialog,
    showConfirmDialog,
    showUnsavedChangesDialog,
    isCreating,
    showSuccessDialog,
    setShowSuccessDialog,
    successInfo,
    isLastPage,
    setGameServerState,
    setUtilState,
    setCurrentPageValid,
    triggerNextPage,
    handleTemplateSelected,
    handleBack,
    handleCloseAttempt,
    handleDiscardChanges,
    handleCancelClose,
    handleConfirmReapply,
    handleCancelReapply,
    handleConfirmCreate,
    handleCancelConfirm,
  };
};

export default useGameServerCreation;
