import type { ParseKeys, TOptions } from "i18next";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import type { WebhookDto } from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useSelectedGameServer from "@/hooks/useSelectedGameServer/useSelectedGameServer.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import WebhookDeleteDialog from "./components/WebhookDeleteDialog.tsx";
import WebhookList from "./components/WebhookList.tsx";
import WebhookModal from "./components/WebhookModal.tsx";

const WebhooksSettingsSection = () => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const { gameServer } = useSelectedGameServer();
  const gameServerUuid = gameServer.uuid ?? "";
  const [deletingWebhookUuid, setDeletingWebhookUuid] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookDto | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookDto | null>(null);

  const webhooks = gameServer.webhooks ?? [];

  const { deleteWebhook } = useDataInteractions();

  const onDeleteWebhook = async (webhookUuid: string) => {
    if (!gameServerUuid) return;
    setDeletingWebhookUuid(webhookUuid);
    try {
      await deleteWebhook({ gameserverUuid: gameServerUuid, webhookUuid });
    } finally {
      setDeletingWebhookUuid(null);
    }
  };

  const handleDeleteRequest = (webhook: WebhookDto) => {
    setWebhookToDelete(webhook);
  };

  const handleDeleteConfirm = async () => {
    if (!webhookToDelete?.uuid) return;
    await onDeleteWebhook(webhookToDelete.uuid);
    setWebhookToDelete(null);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (deletingWebhookUuid) return;
    if (!open) setWebhookToDelete(null);
  };

  const getWebhookTypeLabel = (type: string | undefined): string => {
    if (!type) return "-";
    return t(`types.${type}` as ParseKeys<"translation", TOptions, "components.GameServerSettings.webhooks">);
  };

  const getEventLabel = (event: string): string => {
    return t(`events.${event}` as ParseKeys<"translation", TOptions, "components.GameServerSettings.webhooks">);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ lineHeight: "initial" }}>{t("title")}</h2>
        <p className={"text-sm text-muted-foreground leading-none"}>{t("description")}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button className="w-fit" onClick={() => setIsCreateModalOpen(true)}>
          {t("create")}
        </Button>
      </div>

      <WebhookList
        webhooks={webhooks}
        deletingWebhookUuid={deletingWebhookUuid}
        onEdit={setEditingWebhook}
        onDelete={handleDeleteRequest}
        getWebhookTypeLabel={getWebhookTypeLabel}
        getEventLabel={getEventLabel}
        t={t}
      />

      <WebhookDeleteDialog
        open={!!webhookToDelete}
        onOpenChange={handleDeleteDialogOpenChange}
        webhook={webhookToDelete}
        isDeleting={!!webhookToDelete?.uuid && deletingWebhookUuid === webhookToDelete.uuid}
        t={t}
        onConfirm={handleDeleteConfirm}
      />

      <WebhookModal
        mode="create"
        gameServerUuid={gameServerUuid}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <WebhookModal
        mode="edit"
        gameServerUuid={gameServerUuid}
        webhook={editingWebhook}
        open={!!editingWebhook}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingWebhook(null);
        }}
      />
    </div>
  );
};

export default WebhooksSettingsSection;
