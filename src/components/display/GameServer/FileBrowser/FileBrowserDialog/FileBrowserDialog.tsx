import Icon from "@/components/ui/Icon.tsx";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import type { VolumeMountConfiguration } from "@/api/generated/model";
import closeIcon from "@/assets/icons/close.webp";
import searchIcon from "@/assets/icons/search.webp";
import { useFileBrowserCache } from "@/hooks/useFileBrowserCache/useFileBrowserCache";
import { useFileSelection } from "@/hooks/useFileSelection/useFileSelection";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";
import { FileBrowserProvider } from "../FileBrowserContext";
import { FileBrowserList } from "../FileBrowserList/FileBrowserList";
import { FileBrowserActionBar } from "./FileBrowserActionBar";
import { FileBrowserModals } from "./FileBrowserModals";
import { useFileBrowserActions } from "./useFileBrowserActions";
import { useFileBrowserContextValue } from "./useFileBrowserContextValue";
import { useFileBrowserNavigation } from "./useFileBrowserNavigation";
import { useFilePreviewNode } from "./useFilePreviewNode";

type FileBrowserDialogProps = {
  width?: number;
  height?: number;
  padding?: number;
  path?: string;
  serverUuid: string;
  volumes: VolumeMountConfiguration[];
  canReadFiles?: boolean;
  canChangeFiles?: boolean;
};

export const FileBrowserDialog = (props: FileBrowserDialogProps) => {
  const {
    currentPath,
    setCurrentPath,
    fetchDepth,
    objects,
    loading,
    error,
    ensurePathFetched,
    prefetchPath,
  } = useFileBrowserCache({
    serverUuid: props.serverUuid,
    initialPath: props.path ?? "/",
    initialDepth: 1,
    volumes: props.volumes,
  });

  const {
    selectedFilePath,
    selectedFileName,
    closePreview,
    hasSelection,
    setSelectedFileName,
    setSelectedFilePath,
    setSelectedObj,
  } = useFileSelection();

  const canReadFiles = props.canReadFiles ?? true;
  const canChangeFiles = props.canChangeFiles ?? true;

  const [search, setSearch] = useState("");

  const isSynthetic = useMemo(() => {
    return !props.volumes?.some((v) => v.container_path && currentPath.startsWith(v.container_path));
  }, [props.volumes, currentPath]);

  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserDialog");

  const { navigating, onEntryClick, onCrumbClick } = useFileBrowserNavigation({
    currentPath,
    fetchDepth,
    setCurrentPath,
    prefetchPath,
    setSelectedFilePath,
    setSelectedFileName,
    setSelectedObj,
  });

  const actions = useFileBrowserActions({
    serverUuid: props.serverUuid,
    currentPath,
    fetchDepth,
    ensurePathFetched,
    selectedFilePath,
    setSelectedFilePath,
    setSelectedFileName,
    closePreview,
    t,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: remove search when changing directories
  useEffect(() => {
    setSearch("");
  }, [currentPath]);

  useEffect(() => {
    closePreview();
  }, [closePreview]);

  const filteredObjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return objects;
    return objects.filter((o) => (o.name ?? "").toLowerCase().includes(q));
  }, [objects, search]);

  useEffect(() => {
    ensurePathFetched(currentPath, fetchDepth);
  }, [currentPath, fetchDepth, ensurePathFetched]);

  const previewNode = useFilePreviewNode({
    serverUuid: props.serverUuid,
    selectedFileName,
    selectedFilePath,
    closePreview,
  });

  const ctxValue = useFileBrowserContextValue({
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
    volumes: props.volumes,
    ensurePathFetched,
    onEntryClick,
    onCrumbClick,
    actions,
  });

  return (
    <div
      className={cn("flex flex-col gap-2 h-full p-4 relative")}
      style={{
        width: props.width !== undefined ? `${props.width}px` : undefined,
        height: props.height !== undefined ? `${props.height}px` : undefined,
        padding: props.padding !== undefined ? `${props.padding}px` : undefined,
      }}
    >
      <Input
        startDecorator={<Icon src={searchIcon} variant="foreground" className="size-5" />}
        endDecorator={
          <button
            type="button"
            aria-label="clear search"
            className="pointer-events-auto cursor-pointer"
            onClick={() => {
              setSearch("");
            }}
          >
            <Icon src={closeIcon} variant="foreground" className="size-4" />
          </button>
        }
        type="text"
        placeholder="Search"
        className="h-12 pl-10 border-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <FileBrowserProvider value={ctxValue}>
        <FileBrowserList />
      </FileBrowserProvider>

      <FileBrowserActionBar
        currentPath={currentPath}
        loading={loading}
        isSynthetic={isSynthetic}
        canReadFiles={canReadFiles}
        canChangeFiles={canChangeFiles}
        downloading={actions.downloading}
        downloadProgress={actions.downloadProgress}
        fileInputRef={actions.fileInputRef}
        archiveInputRef={actions.archiveInputRef}
        onFilePicked={actions.onFilePicked}
        onArchivePicked={actions.onArchivePicked}
        onDownloadAll={() => actions.openDownloadModal(currentPath)}
      />

      <FileBrowserModals serverUuid={props.serverUuid} currentPath={currentPath} actions={actions} />

      {!canReadFiles && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-muted-foreground text-center">
            <div className="text-lg font-semibold mb-2">{t("noFilesPermission")}</div>
            <div className="text-sm">{t("noFilesPermissionDesc")}</div>
          </div>
        </div>
      )}
    </div>
  );
};
