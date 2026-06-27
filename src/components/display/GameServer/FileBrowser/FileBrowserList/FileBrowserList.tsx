import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import {
  buildPathCrumbs,
  joinRemotePath,
  normalizePath,
  sortDirsFirst,
  validateName,
} from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";
import { DeleteDialog } from "../dialogs/DeleteDialog";
import { MkdirDialog } from "../dialogs/MkdirDialog";
import { RenameDialog } from "../dialogs/RenameDialog";
import { FileBrowserBody } from "../FileBrowserBody/FileBrowserBody";
import { useFileBrowser } from "../FileBrowserContext";
import { FileBrowserHeader } from "../FileBrowserHeader/FileBrowserHeader";
import { FileBrowserPreviewPane } from "../FileBrowserPreviewPane/FileBrowserPreviewPane";

export const FileBrowserList = () => {
  const {
    currentPath,
    objects,
    loading,
    error,
    preview,
    showPreview,
    previewedPath,
    isSynthetic,
    onClosePreview,
    onEntryClick,
    onCrumbClick,
    onRefresh,
    onMkdir,
    onRename,
    onDelete,
    onDownload,
    onEditFile,
    onChangePermissions,
    readOnly,
  } = useFileBrowser();

  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserList");

  const crumbs = buildPathCrumbs(currentPath);
  const effectiveShowPreview = Boolean(showPreview && preview);
  const sorted = useMemo(() => [...objects].sort(sortDirsFirst), [objects]);
  const canWrite = !readOnly && Boolean(onMkdir || onRename || onDelete);

  const [mkdirOpen, setMkdirOpen] = useState(false);
  const [mkdirName, setMkdirName] = useState("");

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameObj, setRenameObj] = useState<FileSystemObjectDto | null>(null);
  const [renameName, setRenameName] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteObj, setDeleteObj] = useState<FileSystemObjectDto | null>(null);

  const mkdirMutation = useMutation({
    mutationKey: ["fileBrowser", "mkdir", currentPath],
    mutationFn: async (name: string) => {
      if (!onMkdir) return;
      await onMkdir({ parentPath: currentPath || "/", name });
    },
    onSuccess: () => {
      setMkdirOpen(false);
      onRefresh?.();
    },
  });

  const renameMutation = useMutation({
    mutationKey: ["fileBrowser", "rename", currentPath],
    mutationFn: async (args: { obj: FileSystemObjectDto; newName: string }) => {
      if (!onRename) return;
      await onRename({
        parentPath: currentPath || "/",
        oldName: args.obj.name,
        newName: args.newName,
        obj: args.obj,
      });
    },
    onSuccess: (_data, variables) => {
      const oldPath =
        variables.obj.name != null ? joinRemotePath(currentPath || "/", variables.obj.name) : null;

      if (oldPath && previewedPath && normalizePath(previewedPath) === oldPath) {
        onClosePreview?.();
      }

      setRenameOpen(false);
      onRefresh?.();
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["fileBrowser", "delete", currentPath],
    mutationFn: async (obj: FileSystemObjectDto) => {
      if (!onDelete) return;
      await onDelete({
        parentPath: currentPath || "/",
        name: obj.name,
        obj,
      });
    },
    onSuccess: (_data, obj) => {
      const delPath = obj.name != null ? joinRemotePath(currentPath || "/", obj.name) : null;

      if (delPath && previewedPath && normalizePath(previewedPath) === delPath) {
        onClosePreview?.();
      }

      setDeleteOpen(false);
      onRefresh?.();
    },
  });

  const openMkdir = () => {
    mkdirMutation.reset();
    setMkdirName("");
    setMkdirOpen(true);
  };

  const openRename = (obj: FileSystemObjectDto) => {
    renameMutation.reset();
    setRenameObj(obj);
    setRenameName(obj.name ?? "");
    setRenameOpen(true);
  };

  const openDelete = (obj: FileSystemObjectDto) => {
    deleteMutation.reset();
    setDeleteObj(obj);
    setDeleteOpen(true);
  };

  const submitMkdir = () => {
    if (!onMkdir) return;
    const err = validateName(mkdirName);
    if (err) return;
    mkdirMutation.mutate(mkdirName.trim());
  };

  const submitRename = () => {
    if (!onRename || !renameObj) return;
    const err = validateName(renameName);
    if (err) return;
    const newName = renameName.trim();
    if (newName === renameObj.name) {
      setRenameOpen(false);
      return;
    }
    renameMutation.mutate({ obj: renameObj, newName });
  };

  const submitDelete = () => {
    if (!onDelete || !deleteObj) return;
    deleteMutation.mutate(deleteObj);
  };

  const mkdirError =
    validateName(mkdirName) || (mkdirMutation.isError ? t("failedToCreateFolder") : null);

  const renameError =
    validateName(renameName) || (renameMutation.isError ? t("failedToRename") : null);

  const deleteError = deleteMutation.isError ? t("failedToDelete") : null;

  return (
    <>
      <div className="border-border border rounded-lg bg-primary-banner h-full flex overflow-hidden">
        <div
          className={cn(
            "flex flex-col flex-1 min-w-0",
            effectiveShowPreview && "border-r border-r-border",
          )}
        >
          <FileBrowserHeader
            crumbs={crumbs}
            loading={loading}
            canWrite={canWrite && !isSynthetic}
            canMkdir={Boolean(onMkdir) && canWrite && !isSynthetic}
            onHome={() => onCrumbClick?.("/")}
            onCrumbClick={(p) => onCrumbClick?.(p)}
            onRefresh={onRefresh}
            onNewFolder={openMkdir}
          />

          <FileBrowserBody
            loading={loading}
            error={error}
            emptyText={t("noFiles")}
            objects={sorted}
            canWrite={canWrite && !isSynthetic}
            onEntryClick={onEntryClick}
            onRename={onRename && !isSynthetic ? openRename : undefined}
            onDelete={onDelete && !isSynthetic ? openDelete : undefined}
            onDownload={onDownload}
            onEdit={onEditFile}
            onChangePermissions={onChangePermissions}
          />
        </div>

        <FileBrowserPreviewPane show={effectiveShowPreview}>{preview}</FileBrowserPreviewPane>
      </div>

      <MkdirDialog
        open={mkdirOpen}
        onOpenChange={setMkdirOpen}
        currentPath={currentPath}
        value={mkdirName}
        onChange={(v) => {
          setMkdirName(v);
          if (mkdirMutation.isError) mkdirMutation.reset();
        }}
        busy={mkdirMutation.isPending}
        error={mkdirError}
        t={t}
        onSubmit={submitMkdir}
      />

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentPath={currentPath}
        obj={renameObj}
        value={renameName}
        onChange={(v) => {
          setRenameName(v);
          if (renameMutation.isError) renameMutation.reset();
        }}
        busy={renameMutation.isPending}
        error={renameError}
        t={t}
        onSubmit={submitRename}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        obj={deleteObj}
        busy={deleteMutation.isPending}
        error={deleteError}
        t={t}
        onSubmit={submitDelete}
      />
    </>
  );
};
