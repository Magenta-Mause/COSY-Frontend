import { useFileBrowser } from "@components/display/GameServer/FileBrowser/FileBrowserContext.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import trashIcon from "@/assets/icons/trash.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatBytes, formatUnixPerms, isDirectory, joinRemotePath } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";

type Props = {
  obj: FileSystemObjectDto;
  loading?: boolean;

  canWrite: boolean;

  onEntryClick?: (obj: FileSystemObjectDto) => void;
  onRename?: (obj: FileSystemObjectDto) => void;
  onDelete?: (obj: FileSystemObjectDto) => void;
  onDownload?: (obj: FileSystemObjectDto) => Promise<unknown>;
};

const actionButtonClass = cn(
  "inline-flex items-center rounded-md p-2 sm:w-22",
  "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 justify-center",
);

export const FileBrowserRow = ({
  obj,
  loading,
  canWrite,
  onEntryClick,
  onRename,
  onDelete,
  onDownload,
}: Props) => {
  const dir = isDirectory(obj);
  const perms = formatUnixPerms(obj.permissions);
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserList");
  const { downloadingFiles, currentPath } = useFileBrowser();
  const filePath = joinRemotePath(currentPath, obj.name);
  const isBeingDownloaded = downloadingFiles.includes(filePath);

  return (
    <button
      type={"button"}
      onClick={() => onEntryClick?.(obj)}
      disabled={!onEntryClick}
      className={cn(
        "@container w-full flex items-center gap-6 rounded-md px-2 py-2",
        onEntryClick && "hover:bg-black/5",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 text-left rounded-md pl-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        {dir ? (
          <Icon src={folderIcon} variant="foreground" className="size-4" />
        ) : (
          <Icon src={fileIcon} variant="foreground" className="size-4" />
        )}

        <span className="truncate text-sm ml-2 grow">{obj.name}</span>

        <div
          className={cn(
            "ml-auto shrink-0 text-s text-muted-foreground",
            "hidden md:inline-flex items-center gap-6",
          )}
        >
          <TooltipWrapper
            tooltip={
              obj.type === "FILE"
                ? t("fileSizeTooltip", { size: obj.size ?? "?" })
                : t("directoryType")
            }
          >
            <span
              className={cn(
                "shrink-0 text-muted-foreground tabular-nums",
                "hidden md:inline-flex justify-end",
              )}
            >
              {obj.type === "FILE" ? formatBytes(obj.size) : "—"}
            </span>
          </TooltipWrapper>

          <TooltipWrapper tooltip={t("fileModeTooltip", { octal: perms.octal, rwx: perms.rwx })}>
            <span
              className={cn(
                "ml-auto shrink-0 text-muted-foreground",
                "hidden md:inline-flex items-center gap-6",
              )}
            >
              <span>{perms.rwx}</span>
              <span>{perms.octal}</span>
            </span>
          </TooltipWrapper>
        </div>
      </div>

      <div className="hidden @[500px]:flex items-center gap-1 shrink-0">
        {canWrite && (
          <>
            {/* Inline buttons – visible when container >= 500px */}
            {onRename ? (
              <TooltipWrapper tooltip={t("renameAction")}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(obj);
                  }}
                  className={cn(
                    "inline-flex items-center rounded-md p-2",
                    "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                  disabled={loading}
                  data-loading={loading}
                  aria-label={`${t("renameAction")} ${obj.name}`}
                >
                  <Icon src={pencilWriteIcon} variant="foreground" className="size-4 mr-1" />
                  <span className="hidden sm:inline">{t("renameAction")}</span>
                </button>
              </TooltipWrapper>
            ) : null}

            {onDelete ? (
              <TooltipWrapper
                tooltip={!isBeingDownloaded ? t("deleteAction") : t("cantDeleteWhileDownloading")}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(obj);
                  }}
                  className={cn(
                    "inline-flex items-center rounded-md p-2",
                    "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                  disabled={loading || downloadingFiles.includes(filePath)}
                  data-loading={loading}
                  aria-label={`${t("deleteAction")} ${obj.name}`}
                >
                  <Icon src={trashIcon} variant="foreground" className="size-4 mr-1" />
                  <span className="hidden sm:inline">{t("deleteAction")}</span>
                </button>
              </TooltipWrapper>
            ) : null}
          </>
        )}

        {onDownload && !dir && (
          <TooltipWrapper tooltip={t("downloadAction")}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(obj);
              }}
              className={actionButtonClass}
              disabled={loading || downloadingFiles.includes(filePath)}
              data-loading={loading}
              aria-label={`${t("downloadAction")} ${obj.name}`}
            >
              <Icon src={downloadIcon} variant="foreground" className="size-4 mr-1" />
              <span className="hidden sm:inline">
                {!isBeingDownloaded ? t("downloadAction") : t("loading")}
              </span>
            </button>
          </TooltipWrapper>
        )}

        {onDownload && dir && (
          <TooltipWrapper tooltip={t("exportAction")}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(obj);
              }}
              className={actionButtonClass}
              disabled={loading || downloadingFiles.includes(filePath)}
              data-loading={loading}
              aria-label={`${t("exportAction")} ${obj.name}`}
            >
              <Icon src={downloadIcon} variant="foreground" className="size-4 mr-1" />
              {!isBeingDownloaded ? t("exportAction") : t("loading")}
            </button>
          </TooltipWrapper>
        )}
      </div>

      {canWrite && (
        <div className="@[500px]:hidden shrink-0">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "inline-flex items-center justify-center rounded-md p-2",
                  "hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
                disabled={loading}
                aria-label={t("renameAction")}
              >
                <Icon src={dotsIcon} variant="foreground" className="size-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {onRename ? (
                <DropdownMenuItem onClick={() => onRename(obj)}>
                  {t("renameAction")}
                </DropdownMenuItem>
              ) : null}
              {onDownload && !dir ? (
                <DropdownMenuItem onClick={() => onDownload(obj)}>
                  {t("downloadAction")}
                </DropdownMenuItem>
              ) : null}
              {onDownload && dir ? (
                <DropdownMenuItem onClick={() => onDownload(obj)}>
                  {t("exportAction")}
                </DropdownMenuItem>
              ) : null}
              {onDelete ? (
                <DropdownMenuItem
                  onClick={() => onDelete(obj)}
                  className="text-destructive focus:text-destructive"
                >
                  {t("deleteAction")}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </button>
  );
};
