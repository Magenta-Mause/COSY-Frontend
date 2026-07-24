import type { ReactNode } from "react";
import { useMemo } from "react";
import type { FileSystemObjectDto, VolumeMountConfiguration } from "@/api/generated/model";
import type { FileBrowserContextValue } from "../FileBrowserContext";
import type { useFileBrowserActions } from "./useFileBrowserActions";

interface UseFileBrowserContextValueArgs {
  currentPath: string;
  filteredObjects: FileSystemObjectDto[];
  loading?: boolean;
  error?: string | null;
  fetchDepth: number;
  previewNode: ReactNode;
  hasSelection: boolean;
  selectedFilePath?: string | null;
  closePreview: () => void;
  isSynthetic: boolean;
  canChangeFiles: boolean;
  navigating: boolean;
  volumes?: VolumeMountConfiguration[];
  ensurePathFetched: (path: string, depth: number, force?: boolean) => Promise<void>;
  onEntryClick: (obj: FileSystemObjectDto) => void;
  onCrumbClick: (path: string) => void;
  actions: ReturnType<typeof useFileBrowserActions>;
}

/**
 * Builds the memoized FileBrowser context value from the dialog's view state and the
 * action handlers, keeping the dependency array narrow so the provider only re-memos when
 * something it actually renders changes.
 */
export const useFileBrowserContextValue = ({
  currentPath,
  filteredObjects,
  loading,
  error,
  fetchDepth,
  previewNode,
  hasSelection,
  selectedFilePath,
  closePreview,
  isSynthetic,
  canChangeFiles,
  navigating,
  volumes,
  ensurePathFetched,
  onEntryClick,
  onCrumbClick,
  actions,
}: UseFileBrowserContextValueArgs): FileBrowserContextValue => {
  const {
    downloading,
    downloadProgress,
    onMkdir,
    onRename,
    onDelete,
    onDownload,
    openEditModal,
    setPermissionsObj,
  } = actions;

  return useMemo(
    () => ({
      currentPath,
      objects: filteredObjects,
      loading,
      error,
      fetchDepth,

      preview: previewNode,
      showPreview: hasSelection,
      previewedPath: selectedFilePath,
      onClosePreview: closePreview,
      isSynthetic,
      readOnly: !canChangeFiles,
      navigating,
      downloadingFiles: downloading,
      downloadProgress,
      volumes,

      onEntryClick: (obj) => {
        onEntryClick(obj);
      },
      onCrumbClick,
      onRefresh: () => ensurePathFetched(currentPath, fetchDepth, true),

      onMkdir,
      onRename,
      onDelete,
      onDownload,

      onEditFile: (obj) => openEditModal(obj),
      onChangePermissions: (obj) => setPermissionsObj(obj),
    }),
    [
      currentPath,
      filteredObjects,
      loading,
      error,
      fetchDepth,
      previewNode,
      hasSelection,
      selectedFilePath,
      closePreview,
      ensurePathFetched,
      onMkdir,
      onRename,
      onDelete,
      onDownload,
      onCrumbClick,
      onEntryClick,
      isSynthetic,
      canChangeFiles,
      navigating,
      downloading,
      downloadProgress,
      openEditModal,
      setPermissionsObj,
      volumes,
    ],
  );
};
