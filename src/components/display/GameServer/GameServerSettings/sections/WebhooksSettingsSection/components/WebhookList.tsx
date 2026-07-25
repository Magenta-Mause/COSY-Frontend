import type { TFunction } from "i18next";
import { Card } from "@/components/ui/card.tsx";
import type { WebhookDto } from "@/api/generated/model";
import { cn } from "@/lib/utils.ts";
import WebhookItem from "./WebhookItem";

interface WebhookListProps {
  webhooks: WebhookDto[];
  deletingWebhookUuid: string | null;
  onEdit: (webhook: WebhookDto) => void;
  onDelete: (webhook: WebhookDto) => void;
  getWebhookTypeLabel: (type: string | undefined) => string;
  getEventLabel: (event: string) => string;
  t: TFunction<"translation", "components.GameServerSettings.webhooks">;
}

const WebhookList = ({
  webhooks,
  deletingWebhookUuid,
  onEdit,
  onDelete,
  getWebhookTypeLabel,
  getEventLabel,
  t,
}: WebhookListProps) => {
  if (webhooks.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <Card className={cn("relative p-3 gap-5 flex flex-col mt-5 mb-5", "flex flex-col gap-3")}>
      <h3 className="text-lg">{t("configuredWebhooks")}</h3>
      <div className="flex flex-col gap-3">
        {webhooks.map((webhook) => (
          <WebhookItem
            key={webhook.uuid}
            webhook={webhook}
            deletingWebhookUuid={deletingWebhookUuid}
            onEdit={onEdit}
            onDelete={onDelete}
            getWebhookTypeLabel={getWebhookTypeLabel}
            getEventLabel={getEventLabel}
            t={t}
          />
        ))}
      </div>
    </Card>
  );
};

export default WebhookList;
