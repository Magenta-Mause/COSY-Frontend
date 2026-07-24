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
import type { FileSystemObjectDto } from "@/api/generated/model";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  obj: FileSystemObjectDto | null;

  busy: boolean;
  error: string | null;

  t: TFunction<"translation", "components.fileBrowser.fileBrowserList">;

  onSubmit: () => void | Promise<void>;
};

export const DeleteDialog = ({ open, onOpenChange, obj, busy, error, t, onSubmit }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteAction")}</DialogTitle>
          <DialogDescription>
            {obj ? t("deleteDescription", { fileName: obj.name }) : null}
          </DialogDescription>
        </DialogHeader>

        <DialogMain>
          <div className="text-sm">
            {obj?.type === "DIRECTORY" ? t("deleteDialogFolder") : t("deleteDialogFile")}
            {error ? <div className="mt-3 text-destructive">{error}</div> : null}
          </div>
        </DialogMain>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={busy || !obj}
            data-testid="delete-submit-btn"
          >
            {busy ? t("deleteInProgress") : t("deleteAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
