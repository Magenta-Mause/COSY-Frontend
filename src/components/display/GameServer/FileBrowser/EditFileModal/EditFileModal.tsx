import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  fileName: string;
  initialContent: string | null;
  fetching: boolean;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
};

export const EditFileModal = ({
  open,
  fileName,
  initialContent,
  fetching,
  onClose,
  onSave,
}: Props) => {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslationPrefix("components.fileBrowser.editFileModal");

  useEffect(() => {
    if (initialContent !== null) {
      setContent(initialContent);
      setError(null);
    }
  }, [initialContent]);

  useEffect(() => {
    if (!open) {
      setContent("");
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(content);
      onClose();
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const busy = fetching || saving;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-5xl w-full flex flex-col gap-0 p-0 max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="truncate">{t("title", { name: fileName })}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col px-6 py-4 gap-3">
          {fetching ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              {t("loading")}
            </div>
          ) : (
            <textarea
              data-testid="editfile-textarea"
              className={cn(
                "flex-1 w-full resize-none rounded-md border border-border bg-muted/30",
                "px-3 py-2 font-mono text-sm leading-relaxed",
                "focus:outline-none focus:ring-2 focus:ring-ring/50",
                "min-h-[50vh]",
              )}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={saving}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          )}

          {error && <p className="text-sm text-destructive shrink-0">{error}</p>}
        </div>

        <div className="flex gap-2 px-6 pb-6 shrink-0 border-t border-border pt-4">
          <Button variant="secondary" onClick={handleClose} disabled={busy} className="flex-1">
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={busy || fetching}
            data-loading={saving}
            data-testid="editfile-save-btn"
            className="flex-1"
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
