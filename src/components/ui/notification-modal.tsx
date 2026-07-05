import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { NotificationModalItem } from "@/lib/notificationModal";
import { dismissNotification } from "@/lib/notificationModal";

interface NotificationModalProps {
  item: NotificationModalItem | undefined;
}

const TITLE_KEYS = {
  success: "notificationModal.successTitle",
  error: "notificationModal.errorTitle",
  info: "notificationModal.infoTitle",
} as const;

export function NotificationModal({ item }: NotificationModalProps) {
  const { t } = useTranslation();

  const handleDismiss = () => {
    if (item) dismissNotification(item.id);
  };

  return (
    <Dialog
      open={!!item}
      onOpenChange={(open) => {
        if (!open) handleDismiss();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[500px] z-[120]"
        overlayClassName="z-[110]"
      >
        {item && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <DialogTitle>{item.title ?? t(TITLE_KEYS[item.type])}</DialogTitle>
              </div>
              <DialogDescription>{item.message}</DialogDescription>
            </DialogHeader>
            {item.details && (
              <pre className="bg-secondary-background rounded-lg p-3 text-xs scroller max-h-40">
                {item.details}
              </pre>
            )}
            <DialogFooter>
              <Button onClick={handleDismiss}>
                {item.type === "error" ? t("notificationModal.dismiss") : t("notificationModal.ok")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
