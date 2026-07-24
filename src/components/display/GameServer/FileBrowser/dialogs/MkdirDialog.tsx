import type { TFunction } from "i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  currentPath: string;
  value: string;
  onChange: (v: string) => void;

  busy: boolean;
  error: string | null;

  t: TFunction<"translation", "components.fileBrowser.fileBrowserList">;

  onSubmit: () => void | Promise<void>;
};

export const MkdirDialog = ({
  open,
  onOpenChange,
  currentPath,
  value,
  onChange,
  busy,
  error,
  t,
  onSubmit,
}: Props) => {
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (open) setTouched(false);
  }, [open]);

  const showError = touched && !!error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createFolderAction")}</DialogTitle>
          <DialogDescription>
            {t("createFolderDescription", { dirName: currentPath })}
          </DialogDescription>
        </DialogHeader>

        <DialogMain>
          <div className="flex flex-col gap-3">
            <span className="text-sm text-muted-foreground">{t("folderName")}</span>

            <Input
              autoFocus
              data-testid="mkdir-name-input"
              value={value}
              onChange={(e) => {
                if (!touched) setTouched(true);
                onChange(e.target.value);
              }}
              placeholder="e.g. logs"
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit();
              }}
            />

            {showError ? <div className="text-sm text-destructive">{error}</div> : null}
          </div>
        </DialogMain>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={busy} data-testid="mkdir-submit-btn">
            {busy ? t("creatingInProgress") : t("createAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
