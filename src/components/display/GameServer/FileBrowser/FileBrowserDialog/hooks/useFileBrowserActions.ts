import type { TFunction } from "i18next";
import { useCallback, useRef, useState } from "react";
import { FILE_TRANSFER_OPTIONS } from "@/api/axiosInstance";
import {
  readFileFromVolume,
  setPermissions,
  uploadArchiveToVolume,
  uploadFileToVolume,
  useCreateDirectoryInVolume,
  useDeleteInVolume,
  useRenameInVolume,
} from "@/api/generated/backend-api";
import type { FileSystemObjectDto } from "@/api/generated/model";
import { downloadSingleFile, joinRemotePath } from "@/lib/fileSystemUtils";
import { notificationModal } from "@/lib/notificationModal";
import { zipAndDownload, zipAndDownloadChunked } from "@/lib/zipDownload";

type FileBrowserT = TFunction<"translation", "components.fileBrowser.fileBrowserDialog">;

interface UseFileBrowserActionsArgs {
  serverUuid: string;
  currentPath: string;
  fetchDepth: number;
  ensurePathFetched: (path: string, depth: number, force?: boolean) => Promise<void>;
  selectedFilePath?: string | null;
  setSelectedFilePath: (path: string) => void;
  setSelectedFileName: (name: string) => void;
  closePreview: () => void;
  t: FileBrowserT;
}

export const useFileBrowserActions = ({
  serverUuid,
  currentPath,
  fetchDepth,
  ensurePathFetched,
  selectedFilePath,
  setSelectedFilePath,
  setSelectedFileName,
  closePreview,
  t,
}: UseFileBrowserActionsArgs) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const archiveInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingArchives, setPendingArchives] = useState<File[] | null>(null);

  const [downloadModalPath, setDownloadModalPath] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const [editingFile, setEditingFile] = useState<{
    obj: FileSystemObjectDto | null;
    content: string | null;
    fetching: boolean;
  } | null>(null);

  const [permissionsObj, setPermissionsObj] = useState<FileSystemObjectDto | null>(null);

  const renameMutation = useRenameInVolume();
  const mkdirMutation = useCreateDirectoryInVolume();
  const deleteMutation = useDeleteInVolume();

  const uploadSelectedFile = async (file: File) => {
    const path = joinRemotePath(currentPath, file.name);
    const apiPath = path === "/" ? "" : path;

    await uploadFileToVolume(serverUuid, file, { path: apiPath }, FILE_TRANSFER_OPTIONS);
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
        serverUuid,
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

  const openDownloadModal = useCallback((path: string) => setDownloadModalPath(path), []);

  const startZipDownload = async (path: string, totalBytes: number) => {
    setDownloading((prev) => [...prev, path]);
    setDownloadProgress(null);
    try {
      await zipAndDownload({
        serverUuid,
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
        serverUuid,
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
        const blob = (await readFileFromVolume(
          serverUuid,
          { path: apiPath },
          FILE_TRANSFER_OPTIONS,
        )) as unknown as Blob;
        const text = await blob.text();
        setEditingFile({ obj, content: text, fetching: false });
      } catch {
        notificationModal.error({ message: t("editFileFetchError") });
        setEditingFile(null);
      }
    },
    [currentPath, serverUuid, t],
  );

  const saveEditedFile = async (content: string) => {
    if (!editingFile?.obj) return;
    const path = joinRemotePath(currentPath, editingFile.obj.name);
    const apiPath = path === "/" ? "" : path;
    await uploadFileToVolume(
      serverUuid,
      new Blob([content], { type: "text/plain" }),
      { path: apiPath },
      FILE_TRANSFER_OPTIONS,
    );
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const savePermissions = async (obj: FileSystemObjectDto, mode: number, uid: number | null) => {
    const path = joinRemotePath(currentPath, obj.name);
    const apiPath = path === "/" ? "" : path;
    await setPermissions(serverUuid, {
      path: apiPath,
      mode,
      ...(uid !== null ? { uid } : {}),
    });
    await ensurePathFetched(currentPath, fetchDepth, true);
  };

  const onMkdir = useCallback(
    async ({ parentPath, name }: { parentPath: string; name: string }) => {
      const apiParent = parentPath === "/" ? "" : parentPath;
      const newPath = `${apiParent}/${name}`;

      await mkdirMutation.mutateAsync({
        uuid: serverUuid,
        params: { path: newPath },
      });

      await ensurePathFetched(parentPath, fetchDepth, true);
    },
    [serverUuid, fetchDepth, ensurePathFetched, mkdirMutation],
  );

  const onRename = useCallback(
    async ({
      parentPath,
      oldName,
      newName,
    }: {
      parentPath: string;
      oldName: string;
      newName: string;
    }) => {
      const apiParent = parentPath === "/" ? "" : parentPath;

      await renameMutation.mutateAsync({
        uuid: serverUuid,
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
    [
      serverUuid,
      fetchDepth,
      ensurePathFetched,
      renameMutation,
      selectedFilePath,
      setSelectedFilePath,
      setSelectedFileName,
    ],
  );

  const onDelete = useCallback(
    async ({ parentPath, name }: { parentPath: string; name: string }) => {
      const apiParent = parentPath === "/" ? "" : parentPath;

      await deleteMutation.mutateAsync({
        uuid: serverUuid,
        params: { path: `${apiParent}/${name}` },
      });

      if (selectedFilePath === joinRemotePath(parentPath, name)) {
        closePreview();
      }

      await ensurePathFetched(parentPath, fetchDepth, true);
    },
    [serverUuid, fetchDepth, ensurePathFetched, deleteMutation, selectedFilePath, closePreview],
  );

  const onDownload = useCallback(
    async (obj: FileSystemObjectDto) => {
      const fullPath = joinRemotePath(currentPath, obj.name);

      if (obj.type === "DIRECTORY") {
        openDownloadModal(fullPath);
        return;
      }
      setDownloading((prev) => [...prev, fullPath]);
      try {
        await downloadSingleFile({
          serverUuid,
          parentPath: currentPath,
          name: obj.name,
        });
      } catch (_err) {
        notificationModal.error({ message: t("errorWhileDownload") });
      } finally {
        setDownloading((prev) => prev.filter((p) => p !== fullPath));
      }
    },
    [serverUuid, currentPath, openDownloadModal, t],
  );

  return {
    fileInputRef,
    archiveInputRef,
    pendingArchives,
    setPendingArchives,
    onFilePicked,
    onArchivePicked,
    extractArchive,
    downloadModalPath,
    setDownloadModalPath,
    downloading,
    downloadProgress,
    openDownloadModal,
    startZipDownload,
    startZipChunkDownload,
    onDownload,
    editingFile,
    setEditingFile,
    openEditModal,
    saveEditedFile,
    permissionsObj,
    setPermissionsObj,
    savePermissions,
    onMkdir,
    onRename,
    onDelete,
  };
};
