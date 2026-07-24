import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon.tsx";
import { Input } from "@/components/ui/input";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FILE_TRANSFER_OPTIONS } from "@/api/axiosInstance";
import {
  readFileFromVolume,
  setPermissions,
  uploadArchiveToVolume,
  uploadFileToVolume,
  useCreateDirectoryInVolume,
  useDeleteInVolume,
  useReadFileFromVolume,
  useRenameInVolume,
} from "@/api/generated/backend-api";
import type { FileSystemObjectDto, VolumeMountConfiguration } from "@/api/generated/model";
import closeIcon from "@/assets/icons/close.webp";
import downloadIcon from "@/assets/icons/download.webp";
import searchIcon from "@/assets/icons/search.webp";
import uploadIcon from "@/assets/icons/upload.webp";
import { useFileBrowserCache } from "@/hooks/useFileBrowserCache/useFileBrowserCache";
import { useFileSelection } from "@/hooks/useFileSelection/useFileSelection";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { downloadSingleFile, formatBytes, joinDir, joinRemotePath, normalizePath } from "@/lib/fileSystemUtils";
import { notificationModal } from "@/lib/notificationModal";
import { cn } from "@/lib/utils";
import { zipAndDownload, zipAndDownloadChunked } from "@/lib/zipDownload";
import { ChangePermissionsModal } from "../ChangePermissionsModal/ChangePermissionsModal";
import { DownloadOptionsModal } from "../DownloadOptionsModal/DownloadOptionsModal";
import { EditFileModal } from "../EditFileModal/EditFileModal";
import { UploadArchiveModal } from "../UploadArchiveModal/UploadArchiveModal";
import { type FileBrowserContextValue, FileBrowserProvider } from "../FileBrowserContext";
import { FileBrowserList } from "../FileBrowserList/FileBrowserList";
import { FilePreview } from "../FilePreview/FilePreview";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const archiveInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingArchives, setPendingArchives] = useState<File[] | null>(null);

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
  const [navigating, setNavigating] = useState(false);

  const [downloadModalPath, setDownloadModalPath] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number } | null>(null);

  const [editingFile, setEditingFile] = useState<{
    obj: FileSystemObjectDto | null;
    content: string | null;
    fetching: boolean;
  } | null>(null);

  const [permissionsObj, setPermissionsObj] = useState<FileSystemObjectDto | null>(null);

  const renameMutation = useRenameInVolume();
  const mkdirMutation = useCreateDirectoryInVolume();
  const deleteMutation = useDeleteInVolume();

  const isSynthetic = useMemo(() => {
    return !props.volumes?.some(
      (v) => v.container_path && currentPath.startsWith(v.container_path),
    );
  }, [props.volumes, currentPath]);

  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserDialog");

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

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const uploadSelectedFile = async (file: File) => {
    const path = joinRemotePath(currentPath, file.name);
    const apiPath = path === "/" ? "" : path;

    await uploadFileToVolume(props.serverUuid, file, { path: apiPath }, FILE_TRANSFER_OPTIONS);
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadSelectedFile(file);
    } catch (_err) {
      notificationModal.error({ message: t("fileUploadError") });
    } finally {
      e.target.value = "";
    }
  };

  const onArchivePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    setPendingArchives(picked);
    e.target.value = "";
  };

  const extractArchive = async (subdirectory: string, clear: boolean) => {
    if (!pendingArchives?.length) return;
    const base = currentPath === "/" ? "" : currentPath;
    const targetPath = subdirectory ? `${base}/${subdirectory}` : base;
    const sorted = [...pendingArchives].sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i < sorted.length; i++) {
      await uploadArchiveToVolume(
        props.serverUuid,
        sorted[i] as unknown as Blob,
        {
          path: targetPath,
          clear: i === 0 && clear,
        },
        FILE_TRANSFER_OPTIONS,
      );
    }
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const onEntryClick = useCallback(
    async (obj: FileSystemObjectDto) => {
      if (obj.type === "DIRECTORY") {
        const nextPath = joinDir(currentPath, obj.name);
        setNavigating(true);
        try {
          await prefetchPath(nextPath, fetchDepth);
        } catch {
          // prefetch failed — navigate anyway, ensurePathFetched will retry
        }
        setCurrentPath(nextPath);
        setNavigating(false);
        return;
      }

      const fullPath = joinRemotePath(currentPath, obj.name);
      setSelectedFilePath(fullPath);
      setSelectedFileName(obj.name);
      setSelectedObj(obj);
    },
    [
      currentPath,
      setCurrentPath,
      prefetchPath,
      fetchDepth,
      setSelectedFilePath,
      setSelectedFileName,
      setSelectedObj,
    ],
  );

  const onCrumbClick = useCallback(
    (path: string) => setCurrentPath(normalizePath(path)),
    [setCurrentPath],
  );

  const openDownloadModal = useCallback(
    (path: string) => setDownloadModalPath(path),
    [],
  );

  const startZipDownload = async (path: string, totalBytes: number) => {
    setDownloading((prev) => [...prev, path]);
    setDownloadProgress(null);
    try {
      await zipAndDownload({
        serverUuid: props.serverUuid,
        startPath: path,
        onProgress: (done) => setDownloadProgress({ done, total: totalBytes }),
      });
    } catch (e) {
      console.error(e);
      notificationModal.error({ message: t("downloadZipFailure") });
    } finally {
      setDownloading((prev) => prev.filter((p) => p !== path));
      setDownloadProgress(null);
    }
  };

  const startZipChunkDownload = async (path: string, chunkSizeMb: number) => {
    setDownloading((prev) => [...prev, path]);
    setDownloadProgress(null);
    try {
      await zipAndDownloadChunked({
        serverUuid: props.serverUuid,
        startPath: path,
        chunkSizeMb,
        onProgress: (done, total) => setDownloadProgress({ done, total }),
      });
    } catch (e) {
      console.error(e);
      notificationModal.error({ message: t("downloadZipFailure") });
    } finally {
      setDownloading((prev) => prev.filter((p) => p !== path));
      setDownloadProgress(null);
    }
  };

  const openEditModal = useCallback(
    async (obj: FileSystemObjectDto) => {
      const path = joinRemotePath(currentPath, obj.name);
      const apiPath = path === "/" ? "" : path;
      setEditingFile({ obj, content: null, fetching: true });
      try {
        const blob = await readFileFromVolume(props.serverUuid, { path: apiPath }, FILE_TRANSFER_OPTIONS) as unknown as Blob;
        const text = await blob.text();
        setEditingFile({ obj, content: text, fetching: false });
      } catch {
        notificationModal.error({ message: t("editFileFetchError") });
        setEditingFile(null);
      }
    },
    [currentPath, props.serverUuid, t],
  );

  const saveEditedFile = async (content: string) => {
    if (!editingFile?.obj) return;
    const path = joinRemotePath(currentPath, editingFile.obj.name);
    const apiPath = path === "/" ? "" : path;
    await uploadFileToVolume(
      props.serverUuid,
      new Blob([content], { type: "text/plain" }),
      { path: apiPath },
      FILE_TRANSFER_OPTIONS,
    );
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const savePermissions = async (obj: FileSystemObjectDto, mode: number, uid: number | null) => {
    const path = joinRemotePath(currentPath, obj.name);
    const apiPath = path === "/" ? "" : path;
    await setPermissions(props.serverUuid, {
      path: apiPath,
      mode,
      ...(uid !== null ? { uid } : {}),
    });
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const readParams = selectedFilePath
    ? { path: selectedFilePath === "/" ? "" : selectedFilePath }
    : null;

  const fileQuery = useReadFileFromVolume(props.serverUuid, readParams ?? { path: "" }, {
    query: {
      enabled: !!readParams,
      staleTime: 30_000,
    },
  });

  const previewNode = useMemo(() => {
    return (
      <div className="min-w-0 h-full flex flex-col overflow-hidden">
        <div className="px-2 py-2 border-b border-b-border flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm truncate">{selectedFileName || "Preview"}</div>
            {selectedFilePath ? (
              <TooltipWrapper tooltip={selectedFilePath}>
                <div className="text-xs text-muted-foreground truncate">{selectedFilePath}</div>
              </TooltipWrapper>
            ) : null}
          </div>

          <TooltipWrapper tooltip={t("closePreview")}>
            <Button size="icon" onClick={closePreview} aria-label={t("closePreview")}>
              <Icon src={closeIcon} className="size-4" />
            </Button>
          </TooltipWrapper>
        </div>

        <FilePreview
          fileName={selectedFileName}
          blob={(fileQuery.data as Blob) ?? null}
          loading={fileQuery.isLoading}
          error={fileQuery.error}
        />
      </div>
    );
  }, [
    selectedFileName,
    selectedFilePath,
    closePreview,
    fileQuery.data,
    fileQuery.isLoading,
    fileQuery.error,
    t,
  ]);

  const ctxValue: FileBrowserContextValue = useMemo(
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
      volumes: props.volumes,

      onEntryClick: (obj) => {
        onEntryClick(obj);
      },
      onCrumbClick,
      onRefresh: () => ensurePathFetched(currentPath, fetchDepth, true),

      onMkdir: async ({ parentPath, name }) => {
        const apiParent = parentPath === "/" ? "" : parentPath;
        const newPath = `${apiParent}/${name}`;

        await mkdirMutation.mutateAsync({
          uuid: props.serverUuid,
          params: { path: newPath },
        });

        await ensurePathFetched(parentPath, fetchDepth, true);
      },

      onRename: async ({ parentPath, oldName, newName }) => {
        const apiParent = parentPath === "/" ? "" : parentPath;

        await renameMutation.mutateAsync({
          uuid: props.serverUuid,
          params: {
            oldPath: `${apiParent}/${oldName}`,
            newPath: `${apiParent}/${newName}`,
          },
        });

        if (selectedFilePath === joinRemotePath(parentPath, oldName)) {
          const newFull = joinRemotePath(parentPath, newName);
          setSelectedFilePath(newFull);
          setSelectedFileName(newName);
        }

        await ensurePathFetched(parentPath, fetchDepth, true);
      },

      onDelete: async ({ parentPath, name }) => {
        const apiParent = parentPath === "/" ? "" : parentPath;

        await deleteMutation.mutateAsync({
          uuid: props.serverUuid,
          params: { path: `${apiParent}/${name}` },
        });

        if (selectedFilePath === joinRemotePath(parentPath, name)) {
          closePreview();
        }

        await ensurePathFetched(parentPath, fetchDepth, true);
      },

      onDownload: async (obj) => {
        const fullPath = joinRemotePath(currentPath, obj.name);

        if (obj.type === "DIRECTORY") {
          openDownloadModal(fullPath);
          return;
        }
        setDownloading((prev) => [...prev, fullPath]);
        try {
          await downloadSingleFile({
            serverUuid: props.serverUuid,
            parentPath: currentPath,
            name: obj.name,
          });
        } catch (_err) {
          notificationModal.error({ message: t("errorWhileDownload") });
        } finally {
          setDownloading((prev) => prev.filter((p) => p !== fullPath));
        }
      },

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
      mkdirMutation,
      renameMutation,
      deleteMutation,
      props.serverUuid,
      setSelectedFilePath,
      setSelectedFileName,
      onCrumbClick,
      onEntryClick,
      isSynthetic,
      canChangeFiles,
      navigating,
      t,
      downloading,
      downloadProgress,
      openEditModal,
      openDownloadModal,
      props.volumes,
    ],
  );

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

      <div className="flex gap-4">
        <TooltipWrapper
          tooltip={
            isSynthetic
              ? t("uploadInSyntheticDir")
              : !canChangeFiles
                ? t("uploadNoPermission")
                : null
          }
          side="top"
          align="center"
        >
          <Button
            onClick={openFileDialog}
            disabled={isSynthetic || !canChangeFiles}
            className="transition-all duration-300"
          >
            <Icon src={uploadIcon} className="size-5" />
            {t("uploadFile")}
          </Button>
        </TooltipWrapper>

        <Button
          onClick={() => openDownloadModal(currentPath)}
          data-loading={downloading.includes(currentPath) || loading}
          disabled={downloading.includes(currentPath) || loading || !canReadFiles || isSynthetic}
        >
          <Icon src={downloadIcon} className="size-5" />
          {downloading.includes(currentPath)
            ? downloadProgress
              ? t("downloadingFile", { done: formatBytes(downloadProgress.done), total: formatBytes(downloadProgress.total) })
              : t("preparing")
            : t("downloadAllAction")}
        </Button>

        <TooltipWrapper
          tooltip={
            isSynthetic
              ? t("uploadInSyntheticDir")
              : !canChangeFiles
                ? t("uploadNoPermission")
                : null
          }
          side="top"
          align="center"
        >
          <Button
            onClick={() => archiveInputRef.current?.click()}
            disabled={isSynthetic || !canChangeFiles}
            variant="secondary"
          >
            <Icon src={uploadIcon} variant="foreground" className="size-5" />
            {t("uploadArchive")}
          </Button>
        </TooltipWrapper>

        <input ref={fileInputRef} type="file" className="hidden" onChange={onFilePicked} />
        <input
          ref={archiveInputRef}
          type="file"
          accept=".zip"
          multiple
          className="hidden"
          onChange={onArchivePicked}
        />
      </div>

      <ChangePermissionsModal
        open={permissionsObj !== null}
        obj={permissionsObj}
        onClose={() => setPermissionsObj(null)}
        onSave={(mode, uid) => permissionsObj ? savePermissions(permissionsObj, mode, uid) : Promise.resolve()}
      />

      <EditFileModal
        open={editingFile !== null}
        fileName={editingFile?.obj?.name ?? ""}
        initialContent={editingFile?.content ?? null}
        fetching={editingFile?.fetching ?? false}
        onClose={() => setEditingFile(null)}
        onSave={saveEditedFile}
      />

      <UploadArchiveModal
        open={pendingArchives !== null}
        files={pendingArchives}
        onClose={() => setPendingArchives(null)}
        onExtract={extractArchive}
      />

      <DownloadOptionsModal
        open={downloadModalPath !== null}
        onClose={() => setDownloadModalPath(null)}
        serverUuid={props.serverUuid}
        path={downloadModalPath ?? currentPath}
        isDownloading={downloading.includes(downloadModalPath ?? "")}
        onDownloadSingle={(totalBytes) => startZipDownload(downloadModalPath ?? currentPath, totalBytes)}
        onDownloadSplit={(chunkSizeMb) => startZipChunkDownload(downloadModalPath ?? currentPath, chunkSizeMb)}
      />

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
