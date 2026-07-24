import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useGetDirectorySize } from "@/api/generated/backend-api";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatBytes } from "@/lib/fileSystemUtils";
import { supportsFilePicker } from "@/lib/zipDownload";
import { cn } from "@/lib/utils";

const FIREFOX_WARNING_THRESHOLD_BYTES = 500 * 1024 * 1024; // 500 MB

type Props = {
  open: boolean;
  onClose: () => void;
  serverUuid: string;
  path: string;
  isDownloading: boolean;
  onDownloadSingle: (totalBytes: number) => void;
  onDownloadSplit: (chunkSizeMb: number) => void;
};

export const DownloadOptionsModal = ({
  open,
  onClose,
  serverUuid,
  path,
  isDownloading,
  onDownloadSingle,
  onDownloadSplit,
}: Props) => {
  const [chunkSizeMb, setChunkSizeMb] = useState("1024");
  const { t } = useTranslationPrefix("components.fileBrowser.downloadModal");

  const { data, isLoading } = useGetDirectorySize(
    serverUuid,
    { path: path === "/" ? "" : path },
    { query: { enabled: open } },
  );

  const totalBytes = data?.total_bytes ?? null;
  const showFirefoxWarning =
    !supportsFilePicker &&
    totalBytes !== null &&
    totalBytes > FIREFOX_WARNING_THRESHOLD_BYTES;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Prominent size display */}
          <div className="rounded-lg border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">{t("sizeLabel")}</p>
            {isLoading ? (
              <p className="text-2xl font-semibold text-muted-foreground animate-pulse">
                {t("calculatingSize")}
              </p>
            ) : (
              <p className="text-2xl font-semibold">
                {totalBytes !== null ? formatBytes(totalBytes) : "—"}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{t("sizeNote")}</p>
          </div>

          {showFirefoxWarning && (
            <div
              className={cn(
                "rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2",
                "text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-600",
              )}
            >
              {t("firefoxWarning")}
            </div>
          )}

          {/* Download as single file */}
          <Button
            onClick={() => {
              onClose();
              onDownloadSingle(totalBytes ?? 0);
            }}
            disabled={isDownloading}
            className="w-full"
          >
            {t("downloadSingle")}
          </Button>

          {/* Download as split chunks */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label htmlFor="chunk-size" className="text-sm font-medium">{t("chunkSizeLabel")}</label>
                <div className="flex items-center gap-2">
                  <Input
                    id="chunk-size"
                    type="number"
                    value={chunkSizeMb}
                    onChange={(e) => setChunkSizeMb(e.target.value)}
                    min={1}
                    className="w-28"
                  />
                  <span className="text-sm text-muted-foreground">{t("mbPerChunk")}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                onClose();
                onDownloadSplit(Math.max(1, parseInt(chunkSizeMb, 10) || 1024));
              }}
              disabled={isDownloading || isLoading || totalBytes === null}
              variant="secondary"
              className="w-full"
            >
              {t("downloadSplit")}
            </Button>

            <p className="text-xs text-muted-foreground">{t("splitNote")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
