import type { ParseKeys, TOptions } from "i18next";
import { useCallback, useMemo, useState } from "react";
import { WebhookCreationDtoWebhookType } from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { webhookUrlValidator } from "@/lib/validators/webhookUrlValidator.ts";
import {
  MAX_BODY_TEMPLATE_LENGTH,
  MAX_HEADER_VALUE_LENGTH,
  MAX_HEADERS,
  isReservedHeaderName,
  isValidHeaderName,
  type WebhookEvent,
  type WebhookFormValues,
  type WebhookHeaderField,
} from "./webhook.types";

type FormErrors = {
  webhook_url?: string;
  subscribed_events?: string;
  headers?: string;
  body_template?: string;
};

/** Keys of this section, as accepted by the prefixed `t` from `useTranslationPrefix`. */
type WebhookKey = ParseKeys<"translation", TOptions, "components.GameServerSettings.webhooks">;

/**
 * Mirrors the backend's header rules so a rejected configuration is reported while the user is
 * editing it instead of as a 400 on submit. Returns the translation key of the first problem.
 */
const validateHeaders = (headers: WebhookHeaderField[]): WebhookKey | undefined => {
  const named = headers.filter((header) => header.name.trim().length > 0);

  if (headers.some((header) => header.value.trim().length > 0 && header.name.trim().length === 0)) {
    return "validation.headerNameRequired";
  }
  if (named.length > MAX_HEADERS) {
    return "validation.headersTooMany";
  }
  if (named.some((header) => !isValidHeaderName(header.name))) {
    return "validation.headerNameInvalid";
  }
  if (named.some((header) => isReservedHeaderName(header.name))) {
    return "validation.headerNameReserved";
  }
  if (named.some((header) => header.value.length > MAX_HEADER_VALUE_LENGTH)) {
    return "validation.headerValueTooLong";
  }

  const names = named.map((header) => header.name.trim().toLowerCase());
  if (new Set(names).size !== names.length) {
    return "validation.headerNameDuplicate";
  }
  return undefined;
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
        result.webhook_url = t(urlResult.error.issues[0].message as WebhookKey);
      }
    }

    if (values.subscribed_events.length === 0) {
      result.subscribed_events = t("validation.subscribedEventsRequired");
    }

    if (values.webhook_type === WebhookCreationDtoWebhookType.CUSTOM) {
      const headersError = validateHeaders(values.headers);
      if (headersError) {
        result.headers = t(headersError);
      }
      if (values.body_template.length > MAX_BODY_TEMPLATE_LENGTH) {
        result.body_template = t("validation.bodyTemplateTooLong");
      }
    }

    return result;
  }, [
    values.webhook_url,
    values.subscribed_events,
    values.webhook_type,
    values.headers,
    values.body_template,
    t,
  ]);

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
      !!errors.headers ||
      !!errors.body_template ||
      values.subscribed_events.length === 0 ||
      isSubmitting
    );
  }, [
    values.webhook_url,
    errors.webhook_url,
    errors.headers,
    errors.body_template,
    values.subscribed_events,
    isSubmitting,
  ]);

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
