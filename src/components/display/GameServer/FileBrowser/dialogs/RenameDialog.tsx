import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import type { FileSystemObjectDto } from "@/api/generated/model";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  currentPath: string;
  obj: FileSystemObjectDto | null;

  value: string;
  onChange: (v: string) => void;

  busy: boolean;
  error: string | null;

  t: (k: string, vars?: Record<string, unknown>) => string;

  onSubmit: () => void | Promise<void>;
};

export const RenameDialog = ({
  open,
  onOpenChange,
  currentPath,
  obj,
  value,
  onChange,
  busy,
  error,
  t,
  onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("renameAction")}</DialogTitle>
          <DialogDescription>
            {obj
              ? t("renameDescription", {
                  fileName: obj.name,
                  currentPath,
                })
              : null}
          </DialogDescription>
        </DialogHeader>

        <DialogMain>
          <div className="flex flex-col gap-3">
            <span className="text-sm text-muted-foreground">{t("newName")}</span>
            <Input
              autoFocus
              data-testid="rename-name-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("newName")}
              onKeyDown={(e) => {
                if (e.key === "Enter") void onSubmit();
              }}
            />
            {error ? <div className="text-sm text-destructive">{error}</div> : null}
          </div>
        </DialogMain>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            {t("cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={busy || !obj} data-testid="rename-submit-btn">
            {busy ? t("renameInProgress") : t("renameAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
