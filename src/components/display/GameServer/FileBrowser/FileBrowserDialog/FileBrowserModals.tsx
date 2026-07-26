import { ChangePermissionsModal } from "./ChangePermissionsModal/ChangePermissionsModal";
import { DownloadOptionsModal } from "./DownloadOptionsModal/DownloadOptionsModal";
import { EditFileModal } from "./EditFileModal/EditFileModal";
import { UploadArchiveModal } from "./UploadArchiveModal/UploadArchiveModal";
import type { useFileBrowserActions } from "./hooks/useFileBrowserActions";

interface FileBrowserModalsProps {
  readonly serverUuid: string;
  readonly currentPath: string;
  readonly actions: ReturnType<typeof useFileBrowserActions>;
}

export const FileBrowserModals = ({ serverUuid, currentPath, actions }: FileBrowserModalsProps) => {
  const {
    permissionsObj,
    setPermissionsObj,
    savePermissions,
    editingFile,
    setEditingFile,
    saveEditedFile,
    pendingArchives,
    setPendingArchives,
    extractArchive,
    downloadModalPath,
    setDownloadModalPath,
    downloading,
    startZipDownload,
    startZipChunkDownload,
  } = actions;

  return (
    <>
      <ChangePermissionsModal
        open={permissionsObj !== null}
        obj={permissionsObj}
        onClose={() => setPermissionsObj(null)}
        onSave={(mode, uid) =>
          permissionsObj ? savePermissions(permissionsObj, mode, uid) : Promise.resolve()
        }
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
        serverUuid={serverUuid}
        path={downloadModalPath ?? currentPath}
        isDownloading={downloading.includes(downloadModalPath ?? "")}
        onDownloadSingle={(totalBytes) =>
          startZipDownload(downloadModalPath ?? currentPath, totalBytes)
        }
        onDownloadSplit={(chunkSizeMb) =>
          startZipChunkDownload(downloadModalPath ?? currentPath, chunkSizeMb)
        }
      />
    </>
  );
};
