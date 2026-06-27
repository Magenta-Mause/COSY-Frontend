import { Button, buttonVariants } from "@components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Checkbox } from "@components/ui/checkbox";
import { useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { formatBytes } from "@/lib/fileSystemUtils";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onExtract: (subdirectory: string, clear: boolean) => Promise<void>;
};

export const UploadArchiveModal = ({ open, file, onClose, onExtract }: Props) => {
  const [subdirectory, setSubdirectory] = useState("");
  const [clearExisting, setClearExisting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslationPrefix("components.fileBrowser.uploadArchiveModal");

  const doExtract = async (clear: boolean) => {
    setExtracting(true);
    setError(null);
    try {
      await onExtract(subdirectory.trim(), clear);
      setSubdirectory("");
      setClearExisting(false);
      onClose();
    } catch {
      setError(t("extractionFailed"));
    } finally {
      setExtracting(false);
    }
  };

  const handleExtract = () => {
    if (clearExisting) {
      setConfirmOpen(true);
    } else {
      doExtract(false);
    }
  };

  const handleClose = () => {
    if (extracting) return;
    setSubdirectory("");
    setClearExisting(false);
    setError(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {file && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">{t("selectedFile")}</p>
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="archive-subdir" className="text-sm font-medium">{t("subdirectoryLabel")}</label>
              <Input
                id="archive-subdir"
                placeholder={t("subdirectoryPlaceholder")}
                value={subdirectory}
                onChange={(e) => setSubdirectory(e.target.value)}
                disabled={extracting}
              />
              <p className="text-xs text-muted-foreground">{t("subdirectoryNote")}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="clear-existing"
                  checked={clearExisting}
                  onCheckedChange={(v) => setClearExisting(v === true)}
                  disabled={extracting}
                />
                <label htmlFor="clear-existing" className="text-sm font-medium cursor-pointer">
                  {t("clearExistingLabel")}
                </label>
              </div>
              {clearExisting && (
                <div className="rounded-md border border-yellow-600/60 bg-yellow-400/20 px-3 py-2">
                  <p className="text-sm text-foreground">
                    {t("clearExistingWarning")}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className={cn("text-sm", "text-destructive")}>{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={extracting}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleExtract}
                disabled={extracting || !file}
                data-loading={extracting}
                className="flex-1"
              >
                {extracting ? t("extracting") : t("extract")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clearConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clearConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("clearConfirmCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                doExtract(true);
              }}
              className={buttonVariants({ variant: "destructive" })}
            >
              {t("clearConfirmProceed")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
