import {
  WebhookCreationDtoHttpMethod,
  WebhookCreationDtoSubscribedEventsItem,
  WebhookCreationDtoWebhookType,
  type WebhookDto,
} from "@/api/generated/model";

export type WebhookType = WebhookCreationDtoWebhookType;
export type WebhookEvent = WebhookCreationDtoSubscribedEventsItem;
export type WebhookHttpMethod = WebhookCreationDtoHttpMethod;

export const WEBHOOK_TYPES = Object.values(WebhookCreationDtoWebhookType);
export const WEBHOOK_EVENTS = Object.values(WebhookCreationDtoSubscribedEventsItem);
export const WEBHOOK_HTTP_METHODS = Object.values(WebhookCreationDtoHttpMethod);

export const DEFAULT_WEBHOOK_TYPE = WebhookCreationDtoWebhookType.DISCORD;
export const DEFAULT_SUBSCRIBED_EVENTS: WebhookEvent[] = [
  WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED,
];
export const DEFAULT_HTTP_METHOD = WebhookCreationDtoHttpMethod.POST;

/** Placeholders the backend resolves in header values and in the body template. */
export const WEBHOOK_PLACEHOLDERS = [
  "event_name",
  "server_id",
  "server_name",
  "message",
  "timestamp",
] as const;

export const DEFAULT_BODY_TEMPLATE = `{
  "event": "{{event_name}}",
  "server": "{{server_name}}",
  "message": "{{message}}",
  "timestamp": "{{timestamp}}"
}`;

/** Mirrors the backend limits so the form reports a problem before the request does. */
export const MAX_HEADERS = 20;
export const MAX_HEADER_VALUE_LENGTH = 2048;
export const MAX_BODY_TEMPLATE_LENGTH = 10000;

/** RFC 7230 header field-name token characters. */
const HEADER_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

/** Headers owned by the HTTP transport, which the backend refuses to let a webhook set. */
const RESERVED_HEADER_NAMES = [
  "host",
  "content-length",
  "transfer-encoding",
  "connection",
  "upgrade",
  "expect",
  "te",
];

export const isReservedHeaderName = (name: string) =>
  RESERVED_HEADER_NAMES.includes(name.trim().toLowerCase());

export const isValidHeaderName = (name: string) => HEADER_NAME_PATTERN.test(name.trim());

/** GET and HEAD never carry a body, so the body template is hidden for them. */
export const methodAllowsBody = (method: WebhookHttpMethod) =>
  method !== WebhookCreationDtoHttpMethod.GET && method !== WebhookCreationDtoHttpMethod.HEAD;

/**
 * Headers are edited as an ordered list rather than as an object: a half-typed name would otherwise
 * collide with another entry or vanish from the form while the user is still typing it.
 */
export type WebhookHeaderField = {
  name: string;
  value: string;
};

export type WebhookFormValues = {
  webhook_type: WebhookType;
  webhook_url: string;
  enabled: boolean;
  subscribed_events: WebhookEvent[];
  http_method: WebhookHttpMethod;
  body_template: string;
  headers: WebhookHeaderField[];
};

export const headersToFields = (
  headers: Record<string, string> | undefined,
): WebhookHeaderField[] => Object.entries(headers ?? {}).map(([name, value]) => ({ name, value }));

export const fieldsToHeaders = (fields: WebhookHeaderField[]): Record<string, string> =>
  fields
    .filter((field) => field.name.trim().length > 0)
    .reduce<Record<string, string>>((headers, field) => {
      headers[field.name.trim()] = field.value;
      return headers;
    }, {});

export const webhookDtoToFormValues = (webhook: WebhookDto): WebhookFormValues => ({
  webhook_type: webhook.webhook_type ?? DEFAULT_WEBHOOK_TYPE,
  webhook_url: webhook.webhook_url ?? "",
  enabled: webhook.enabled ?? true,
  subscribed_events: webhook.subscribed_events ?? [],
  http_method: webhook.http_method ?? DEFAULT_HTTP_METHOD,
  body_template: webhook.body_template ?? DEFAULT_BODY_TEMPLATE,
  headers: headersToFields(webhook.headers),
});

export const getDefaultFormValues = (): WebhookFormValues => ({
  webhook_type: DEFAULT_WEBHOOK_TYPE,
  webhook_url: "",
  enabled: true,
  subscribed_events: [...DEFAULT_SUBSCRIBED_EVENTS],
  http_method: DEFAULT_HTTP_METHOD,
  body_template: DEFAULT_BODY_TEMPLATE,
  headers: [],
});

export type WebhookFormProps = {
  values: WebhookFormValues;
  errors: {
    webhook_url?: string;
    subscribed_events?: string;
    headers?: string;
    body_template?: string;
  };
  isSubmitting: boolean;
  onValuesChange: (values: Partial<WebhookFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  canSubmit: boolean;
};
