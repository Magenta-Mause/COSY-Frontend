import type { ParseKeys, TOptions } from "i18next";
import { useCallback, useMemo, useState } from "react";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { webhookUrlValidator } from "@/lib/validators/webhookUrlValidator.ts";
import type { WebhookEvent, WebhookFormValues } from "./webhook.types";

type FormErrors = {
  webhook_url?: string;
  subscribed_events?: string;
};

interface UseWebhookFormOptions {
  defaultValues: WebhookFormValues;
  onSubmit: (values: WebhookFormValues) => Promise<void>;
}

export const useWebhookForm = ({ defaultValues, onSubmit }: UseWebhookFormOptions) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");
  const [values, setValues] = useState<WebhookFormValues>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo<FormErrors>(() => {
    const result: FormErrors = {};

    if (values.webhook_url.length > 0) {
      const urlResult = webhookUrlValidator.safeParse(values.webhook_url);
      if (!urlResult.success) {
        result.webhook_url = t(urlResult.error.issues[0].message as ParseKeys<"translation", TOptions, "components.GameServerSettings.webhooks">);
      }
    }

    if (values.subscribed_events.length === 0) {
      result.subscribed_events = t("validation.subscribedEventsRequired");
    }

    return result;
  }, [values.webhook_url, values.subscribed_events, t]);

  const handleValuesChange = useCallback((partial: Partial<WebhookFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleSubscribedEvent = useCallback((event: WebhookEvent, checked: boolean) => {
    setValues((prev) => {
      const newEvents = checked
        ? prev.subscribed_events.includes(event)
          ? prev.subscribed_events
          : [...prev.subscribed_events, event]
        : prev.subscribed_events.filter((e) => e !== event);
      return { ...prev, subscribed_events: newEvents };
    });
  }, []);

  const resetForm = useCallback(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const isDisabled = useMemo(() => {
    return (
      values.webhook_url.trim().length === 0 ||
      !!errors.webhook_url ||
      values.subscribed_events.length === 0 ||
      isSubmitting
    );
  }, [values.webhook_url, errors.webhook_url, values.subscribed_events, isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (isDisabled) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [isDisabled, values, onSubmit]);

  return {
    values,
    errors,
    isSubmitting,
    isDisabled,
    handleValuesChange,
    toggleSubscribedEvent,
    resetForm,
    handleSubmit,
  };
};
