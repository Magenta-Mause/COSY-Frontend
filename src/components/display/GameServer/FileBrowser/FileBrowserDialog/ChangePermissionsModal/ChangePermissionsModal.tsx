import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import type { FileSystemObjectDto } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  obj: FileSystemObjectDto | null;
  onClose: () => void;
  onSave: (mode: number, uid: number | null) => Promise<void>;
};

// Bit masks for the 9 permission bits
const BITS = [
  { label: "r", mask: 0o400 }, { label: "w", mask: 0o200 }, { label: "x", mask: 0o100 },
  { label: "r", mask: 0o040 }, { label: "w", mask: 0o020 }, { label: "x", mask: 0o010 },
  { label: "r", mask: 0o004 }, { label: "w", mask: 0o002 }, { label: "x", mask: 0o001 },
] as const;

function modeToRwx(mode: number): string {
  return BITS.map(({ label, mask }) => (mode & mask ? label : "-")).join("");
}

function modeToOctal(mode: number): string {
  return mode.toString(8).padStart(3, "0");
}

export const ChangePermissionsModal = ({ open, obj, onClose, onSave }: Props) => {
  const [mode, setMode] = useState(0o644);
  const [uidStr, setUidStr] = useState("1000");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslationPrefix("components.fileBrowser.changePermissionsModal");

  useEffect(() => {
    if (open && obj) {
      setMode((obj.permissions ?? 0o644) & 0o777);
      setUidStr(String(obj.uid ?? 1000));
      setError(null);
    }
  }, [open, obj]);

  useEffect(() => {
    if (!open) setSaving(false);
  }, [open]);

  const toggleBit = (mask: number) => setMode((prev) => prev ^ mask);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const parsedUid = uidStr.trim() === "" ? null : Number.parseInt(uidStr, 10);
    const uid = !Number.isNaN(parsedUid) ? parsedUid : null;
    try {
      await onSave(mode, uid);
      onClose();
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const rwx = modeToRwx(mode);
  const octal = modeToOctal(mode);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate">
            {t("title", { name: obj?.name ?? "" })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Permission grid */}
          <div>
            {/* Column headers */}
            <div className="grid grid-cols-[5rem_1fr_1fr_1fr] mb-1">
              <div />
              {[t("owner"), t("group"), t("other")].map((label) => (
                <div key={label} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {label}
                </div>
              ))}
            </div>

            {/* Row: Read / Write / Execute */}
            {[
              { rowLabel: t("read"),    indices: [0, 3, 6] },
              { rowLabel: t("write"),   indices: [1, 4, 7] },
              { rowLabel: t("execute"), indices: [2, 5, 8] },
            ].map(({ rowLabel, indices }) => (
              <div key={rowLabel} className="grid grid-cols-[5rem_1fr_1fr_1fr] gap-y-1 mb-1">
                <div className="flex items-center text-sm text-muted-foreground">{rowLabel}</div>
                {indices.map((i) => {
                  const { label, mask } = BITS[i];
                  const active = Boolean(mode & mask);
                  return (
                    <button
                      key={mask}
                      type="button"
                      onClick={() => toggleBit(mask)}
                      disabled={saving}
                      className={cn(
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70",
                      )}
                      aria-label={`${active ? "remove" : "add"} ${rowLabel} for ${["owner", "group", "other"][Math.floor(i / 3)]}`}
                    >
                      {active ? label : "-"}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Mode summary */}
          <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-4 py-2">
            <span className="font-mono text-sm tracking-widest">{rwx}</span>
            <span className="text-muted-foreground text-sm">({octal})</span>
          </div>

          {/* Owner UID */}
          <div className="flex flex-col gap-1">
            <label htmlFor="perm-uid" className="text-sm font-medium">{t("ownerLabel")}</label>
            <Input
              id="perm-uid"
              type="number"
              min={0}
              value={uidStr}
              onChange={(e) => setUidStr(e.target.value)}
              disabled={saving}
              placeholder="1000"
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">{t("ownerNote")}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving} className="flex-1">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              loadingLabel={t("saving")}
              className="flex-1"
            >
              {t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
