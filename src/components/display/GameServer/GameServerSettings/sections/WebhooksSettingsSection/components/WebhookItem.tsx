import type { TFunction } from "i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton";
import Icon from "@/components/ui/Icon.tsx";
import TooltipWrapper from "@/components/ui/TooltipWrapper";
import type { WebhookDto } from "@/api/generated/model";
import checkCircleIcon from "@/assets/icons/checkCircle.webp";
import closeCircleIcon from "@/assets/icons/closeCircle.webp";
import copyLinkIcon from "@/assets/icons/copyLink.webp";
import pencilWriteIcon from "@/assets/icons/pencilWrite.webp";
import trashIcon from "@/assets/icons/trash.webp";

interface WebhookItemProps {
  webhook: WebhookDto;
  deletingWebhookUuid: string | null;
  onEdit: (webhook: WebhookDto) => void;
  onDelete: (webhook: WebhookDto) => void;
  getWebhookTypeLabel: (type: string | undefined) => string;
  getEventLabel: (event: string) => string;
  t: TFunction<"translation", "components.GameServerSettings.webhooks">;
}

const WebhookItem = ({
  webhook,
  deletingWebhookUuid,
  onEdit,
  onDelete,
  getWebhookTypeLabel,
  getEventLabel,
  t,
}: WebhookItemProps) => {
  return (
    <div className="border border-border rounded-lg p-4 flex flex-col gap-4 bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge className="text-sm text-bold bg-accent px-3 py-0">
            {getWebhookTypeLabel(webhook.webhook_type)}
          </Badge>
          <div className="flex items-center gap-1.5">
            {webhook.enabled ? (
              <>
                <Icon src={checkCircleIcon} className="size-4 text-button-primary-default" />
                <span className="text-sm text-button-primary-default font-medium">
                  {t("state.enabled")}
                </span>
              </>
            ) : (
              <>
                <Icon src={closeCircleIcon} className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t("state.disabled")}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <TooltipWrapper tooltip={t("edit")}>
            <Button
              type="button"
              variant="primary"
              size="icon"
              disabled={!webhook.uuid}
              onClick={() => onEdit(webhook)}
            >
              <Icon src={pencilWriteIcon} className="size-4" />
            </Button>
          </TooltipWrapper>
          <TooltipWrapper tooltip={t("delete")}>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              disabled={!webhook.uuid || deletingWebhookUuid === webhook.uuid}
              onClick={() => webhook.uuid && onDelete(webhook)}
            >
              <Icon src={trashIcon} className="size-4" />
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon src={copyLinkIcon} className="size-5 text-muted-foreground shrink-0" />
          <code className="text-xs bg-muted/50 px-2 py-1 rounded break-all flex-1 font-mono text-muted-foreground">
            {webhook.webhook_url}
          </code>
          <CopyButton
            disabled={!webhook.webhook_url}
            value={webhook.webhook_url ?? ""}
            tooltip={t("copyUrl")}
            copiedTooltip={t("copied")}
            className="h-7 w-7 shrink-0"
          />
        </div>

        <div className="flex items-start gap-2">
          <span className="text-sm text-button-primary-default font-bold shrink-0 mt-0.5">
            {t("labels.events")}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(webhook.subscribed_events ?? []).map((event) => (
              <Badge key={event} variant="secondary" className="text-sm px-1.5 py-0">
                {getEventLabel(event)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookItem;
