import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import downloadIcon from "@/assets/icons/download.webp";
import uploadIcon from "@/assets/icons/upload.webp";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatBytes } from "@/lib/fileSystemUtils";

interface FileBrowserActionBarProps {
  readonly currentPath: string;
  readonly loading?: boolean;
  readonly isSynthetic: boolean;
  readonly canReadFiles: boolean;
  readonly canChangeFiles: boolean;
  readonly downloading: string[];
  readonly downloadProgress: { done: number; total: number } | null;
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>;
  readonly archiveInputRef: React.RefObject<HTMLInputElement | null>;
  readonly onFilePicked: React.ChangeEventHandler<HTMLInputElement>;
  readonly onArchivePicked: React.ChangeEventHandler<HTMLInputElement>;
  readonly onDownloadAll: () => void;
}

export const FileBrowserActionBar = ({
  currentPath,
  loading,
  isSynthetic,
  canReadFiles,
  canChangeFiles,
  downloading,
  downloadProgress,
  fileInputRef,
  archiveInputRef,
  onFilePicked,
  onArchivePicked,
  onDownloadAll,
}: FileBrowserActionBarProps) => {
  const { t } = useTranslationPrefix("components.fileBrowser.fileBrowserDialog");

  const downloadIconNode = <Icon src={downloadIcon} className="size-5" />;
  const isDownloading = downloading.includes(currentPath);
  const downloadingLabel = downloadProgress
    ? t("downloadingFile", {
        done: formatBytes(downloadProgress.done),
        total: formatBytes(downloadProgress.total),
      })
    : t("preparing");

  return (
    <div className="flex gap-4">
      <TooltipWrapper
        tooltip={
          isSynthetic ? t("uploadInSyntheticDir") : !canChangeFiles ? t("uploadNoPermission") : null
        }
        side="top"
        align="center"
      >
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isSynthetic || !canChangeFiles}
          className="transition-all duration-300"
        >
          <Icon src={uploadIcon} className="size-5" />
          {t("uploadFile")}
        </Button>
      </TooltipWrapper>

      <Button
        onClick={onDownloadAll}
        loading={isDownloading}
        loadingLabel={
          <>
            {downloadIconNode}
            {downloadingLabel}
          </>
        }
        // A directory listing fetch (`loading`) is not this button's own async
        // operation, so it only gates the button — it must not relabel it.
        disabled={!canReadFiles || isSynthetic || loading}
      >
        {downloadIconNode}
        {t("downloadAllAction")}
      </Button>

      <TooltipWrapper
        tooltip={
          isSynthetic ? t("uploadInSyntheticDir") : !canChangeFiles ? t("uploadNoPermission") : null
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
  );
};
