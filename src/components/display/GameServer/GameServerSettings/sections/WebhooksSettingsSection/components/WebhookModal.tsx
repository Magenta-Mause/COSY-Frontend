import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import {
  WebhookCreationDtoSubscribedEventsItem,
  WebhookCreationDtoWebhookType,
  type WebhookDto,
} from "@/api/generated/model";
import useDataInteractions from "@/hooks/useDataInteractions/useDataInteractions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { useWebhookForm } from "./useWebhookForm";
import WebhookForm from "./WebhookForm";
import { type WebhookFormValues, webhookDtoToFormValues } from "./webhook.types";

export interface WebhookModalProps {
  mode: "create" | "edit";
  gameServerUuid: string;
  webhook?: WebhookDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_CREATE_VALUES: WebhookFormValues = {
  webhook_type: WebhookCreationDtoWebhookType.DISCORD,
  webhook_url: "",
  enabled: true,
  subscribed_events: [WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED],
};

const WebhookModal = ({ mode, gameServerUuid, webhook, open, onOpenChange }: WebhookModalProps) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const { createWebhook, updateWebhook, isCreatingWebhook } = useDataInteractions();

  const isEdit = mode === "edit";
  const isCreating = mode === "create";

  const getInitialValues = (): WebhookFormValues => {
    if (isEdit && webhook) {
      return webhookDtoToFormValues(webhook);
    }
    return DEFAULT_CREATE_VALUES;
  };

  const handleSubmit = async (values: WebhookFormValues) => {
    const payload = {
      webhook_type: values.webhook_type,
      webhook_url: values.webhook_url.trim(),
      enabled: values.enabled,
      subscribed_events: values.subscribed_events,
    };

    if (isCreating) {
      await createWebhook({
        gameserverUuid: gameServerUuid,
        data: payload,
      });
    } else if (isEdit && webhook?.uuid) {
      await updateWebhook({
        gameserverUuid: gameServerUuid,
        webhookUuid: webhook.uuid,
        data: payload,
      });
    }

    onOpenChange(false);
  };

  const {
    values,
    errors,
    isSubmitting,
    isDisabled,
    handleValuesChange,
    resetForm,
    handleSubmit: onFormSubmit,
  } = useWebhookForm({
    defaultValues: getInitialValues(),
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const isLoading = isCreating ? isCreatingWebhook : isSubmitting;
  const title = isEdit ? t("edit") : t("create");
  const submitLabel = isEdit
    ? isSubmitting
      ? t("updating")
      : t("edit")
    : isSubmitting
      ? t("creating")
      : t("create");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md min-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogMain>
          <WebhookForm
            values={values}
            errors={errors}
            isSubmitting={isLoading}
            onValuesChange={handleValuesChange}
            onSubmit={onFormSubmit}
            onCancel={() => handleClose(false)}
            submitLabel={submitLabel}
            canSubmit={!isDisabled}
          />
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={() => handleClose(false)} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button onClick={onFormSubmit} disabled={isDisabled || isCreatingWebhook}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookModal;
