import * as z from "zod";

export const WEBHOOK_URL_REQUIRED_MESSAGE = "validation.webhookUrlRequired";
export const WEBHOOK_URL_INVALID_MESSAGE = "validation.webhookUrlInvalid";

/**
 * Validates a webhook URL. The `.message` on a failed issue is an i18n translation
 * key (not resolved text) — resolve it with `t(...)` at the call site, matching how
 * the webhook form surfaces validation errors.
 */
export const webhookUrlValidator = z
  .string()
  .min(1, WEBHOOK_URL_REQUIRED_MESSAGE)
  .refine(
    (url) => url.trim().startsWith("http://") || url.trim().startsWith("https://"),
    WEBHOOK_URL_INVALID_MESSAGE,
  );
