import { useFileBrowser } from "@components/display/GameServer/FileBrowser/FileBrowserContext.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import Icon from "@components/ui/Icon.tsx";
import TooltipWrapper from "@components/ui/TooltipWrapper";
import type { FileSystemObjectDto } from "@/api/generated/model";
import dotsIcon from "@/assets/icons/dots.webp";
import downloadIcon from "@/assets/icons/download.webp";
import fileIcon from "@/assets/icons/file.webp";
import folderIcon from "@/assets/icons/folder.webp";
import pencilWriteIcon from "@/assets/icons/pencilWrite.webp";
import settingsIcon from "@/assets/icons/settings.webp";
import trashIcon from "@/assets/icons/trash.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatBytes, formatUnixPerms, isDirectory, isTextEditable, joinRemotePath } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";

type Props = {
  obj: FileSystemObjectDto;
  loading?: boolean;

  canWrite: boolean;
  volumeUuid?: string;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onRename?: (obj: FileSystemObjectDto) => void;
  onDelete?: (obj: FileSystemObjectDto) => void;
  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
  onEdit?: (obj: FileSystemObjectDto) => void;
  onChangePermissions?: (obj: FileSystemObjectDto) => void;
};

export const FileBrowserRow = ({
  obj,
  loading,
  canWrite,
  volumeUuid,
  onEntryClick,
  onRename,
  onDelete,
  onDownload,
  onEdit,
  onChangePermissions,
}: Props) => {
  const dir = isDirectory(obj);
  const editable = isTextEditable(obj);
  const perms = formatUnixPerms(obj.permissions);
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserList");
  const { downloadingFiles, downloadProgress, currentPath } = useFileBrowser();
  const filePath = joinRemotePath(currentPath, obj.name);
  const isBeingDownloaded = downloadingFiles.includes(filePath);

  const hasMenu =
    onDownload || (onEdit && editable) || onRename || onChangePermissions || onDelete;

  return (
    // biome-ignore lint/a11y/useSemanticElements: <button> cannot be used here — DropdownMenuTrigger is also a <button> and nested buttons are invalid HTML
    <div
      role="button"
      tabIndex={onEntryClick ? 0 : -1}
      aria-disabled={!onEntryClick || undefined}
      onClick={onEntryClick ? () => onEntryClick(obj) : undefined}
      onKeyDown={onEntryClick ? (e) => { if (e.key === "Enter" || e.key === " ") onEntryClick(obj); } : undefined}
      className={cn(
        "w-full flex items-center gap-3 rounded-md px-2 py-2",
        onEntryClick && "hover:bg-black/5 cursor-pointer",
      )}
    >
      {/* Icon + name + meta */}
      <div className="flex min-w-0 flex-1 items-center gap-2 text-left pl-1">
        {dir ? (
          <Icon src={folderIcon} variant="foreground" className="size-4 shrink-0" />
        ) : (
          <Icon src={fileIcon} variant="foreground" className="size-4 shrink-0" />
        )}

        <div className="flex items-center gap-3 min-w-0 ml-2 grow">
          <span className="truncate text-sm">{obj.name}</span>
          {volumeUuid && (
            <TooltipWrapper tooltip={t("volumeMountTooltip", { uuid: volumeUuid })}>
              <span className="font-mono text-[11px] leading-5 shrink-0 px-1.5 rounded bg-foreground/10 text-foreground/55">
                {volumeUuid.slice(0, 8)}
              </span>
            </TooltipWrapper>
          )}
        </div>

        {/* Size + perms — hidden on small screens */}
        <div className="ml-auto shrink-0 hidden md:inline-flex items-center gap-6 text-muted-foreground">
          <TooltipWrapper
            tooltip={
              obj.type === "FILE"
                ? t("fileSizeTooltip", { size: obj.size ?? "?" })
                : t("directoryType")
            }
          >
            <span className="tabular-nums hidden md:inline-flex justify-end">
              {obj.type === "FILE" ? formatBytes(obj.size) : "—"}
            </span>
          </TooltipWrapper>

          <TooltipWrapper tooltip={t("fileModeTooltip", { octal: perms.octal, rwx: perms.rwx })}>
            <span className="hidden md:inline-flex items-center gap-4">
              <span>{perms.rwx}</span>
              <span>{perms.octal}</span>
            </span>
          </TooltipWrapper>
        </div>
      </div>

      {/* Download progress badge while exporting */}
      {isBeingDownloaded && downloadProgress && (
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {formatBytes(downloadProgress.done)} / {formatBytes(downloadProgress.total)}
        </span>
      )}

      {/* Single dots menu — all actions */}
      {hasMenu && (
        // biome-ignore lint/a11y/noStaticElementInteractions: stop-propagation wrapper only — Radix portal events bubble through the React tree
        // biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper only — Radix portal events bubble through the React tree
        <div className="self-center shrink-0" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "inline-flex items-center justify-center rounded-md p-1.5 shrink-0",
                "border border-border/60 bg-background/60",
                "hover:bg-muted hover:border-border",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                "transition-colors",
              )}
              disabled={loading}
              aria-label={t("moreActions")}
            >
              <Icon src={dotsIcon} variant="foreground" className="size-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {/* Read / edit actions */}
            {onEdit && editable && (
              <DropdownMenuItem onClick={() => onEdit(obj)}>
                <Icon src={pencilWriteIcon} variant="foreground" className="size-4 mr-2" />
                {t("editAction")}
              </DropdownMenuItem>
            )}
            {onDownload && !dir && (
              <DropdownMenuItem
                onClick={() => onDownload(obj)}
                disabled={isBeingDownloaded}
              >
                <Icon src={downloadIcon} variant="foreground" className="size-4 mr-2" />
                {isBeingDownloaded ? t("loading") : t("downloadAction")}
              </DropdownMenuItem>
            )}
            {onDownload && dir && (
              <DropdownMenuItem
                onClick={() => onDownload(obj)}
                disabled={isBeingDownloaded}
              >
                <Icon src={downloadIcon} variant="foreground" className="size-4 mr-2" />
                {isBeingDownloaded ? t("loading") : t("exportAction")}
              </DropdownMenuItem>
            )}

            {/* Write actions */}
            {canWrite && (onRename || onChangePermissions) && (
              <DropdownMenuSeparator />
            )}
            {onRename && (
              <DropdownMenuItem onClick={() => onRename(obj)}>
                <Icon src={pencilWriteIcon} variant="foreground" className="size-4 mr-2" />
                {t("renameAction")}
              </DropdownMenuItem>
            )}
            {onChangePermissions && (
              <DropdownMenuItem onClick={() => onChangePermissions(obj)}>
                <Icon src={settingsIcon} variant="foreground" className="size-4 mr-2" />
                {t("changePermissionsAction")}
              </DropdownMenuItem>
            )}

            {/* Destructive */}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(obj)}
                  disabled={isBeingDownloaded}
                  className="text-destructive focus:text-destructive"
                >
                  <Icon src={trashIcon} variant="foreground" className="size-4 mr-2" />
                  {t("deleteAction")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      )}
    </div>
  );
};
