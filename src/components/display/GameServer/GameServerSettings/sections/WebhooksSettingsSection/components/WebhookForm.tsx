import { Checkbox } from "@components/ui/checkbox";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { WebhookCreationDtoWebhookType } from "@/api/generated/model";
import WebhookHeadersField from "./WebhookHeadersField";
import {
  WEBHOOK_EVENTS,
  WEBHOOK_HTTP_METHODS,
  WEBHOOK_PLACEHOLDERS,
  WEBHOOK_TYPES,
  methodAllowsBody,
  type WebhookEvent,
  type WebhookFormProps,
  type WebhookHeaderField,
  type WebhookHttpMethod,
  type WebhookType,
} from "./webhook.types";

const WebhookForm = ({ values, errors, isSubmitting, onValuesChange }: WebhookFormProps) => {
  const { t } = useTranslation();
  const isCustom = values.webhook_type === WebhookCreationDtoWebhookType.CUSTOM;

  const handleWebhookTypeChange = (value: string) => {
    onValuesChange({ webhook_type: value as WebhookType });
  };

  const handleHttpMethodChange = (value: string) => {
    onValuesChange({ http_method: value as WebhookHttpMethod });
  };

  const handleHeadersChange = (headers: WebhookHeaderField[]) => {
    onValuesChange({ headers });
  };

  const handleWebhookUrlChange = (value: string) => {
    onValuesChange({ webhook_url: value });
  };

  const handleEnabledToggle = () => {
    onValuesChange({ enabled: !values.enabled });
  };

  const handleEventToggle = (event: WebhookEvent, checked: boolean) => {
    onValuesChange({
      subscribed_events: checked
        ? values.subscribed_events.includes(event)
          ? values.subscribed_events
          : [...values.subscribed_events, event]
        : values.subscribed_events.filter((e) => e !== event),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold" htmlFor="webhook-type">
          {t("components.GameServerSettings.webhooks.form.webhookType")}
        </label>
        <Select value={values.webhook_type} onValueChange={handleWebhookTypeChange}>
          <SelectTrigger id="webhook-type" className="w-full" disabled={isSubmitting}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEBHOOK_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`components.GameServerSettings.webhooks.types.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        id="webhook-url"
        header={t("components.GameServerSettings.webhooks.form.webhookUrl")}
        value={values.webhook_url}
        placeholder="https://your-webhook-url.org"
        onChange={(e) => handleWebhookUrlChange(e.target.value)}
        error={errors.webhook_url}
        disabled={isSubmitting}
      />

      {isCustom && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold" htmlFor="webhook-http-method">
              {t("components.GameServerSettings.webhooks.form.httpMethod")}
            </label>
            <Select value={values.http_method} onValueChange={handleHttpMethodChange}>
              <SelectTrigger id="webhook-http-method" className="w-full" disabled={isSubmitting}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEBHOOK_HTTP_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <WebhookHeadersField
            headers={values.headers}
            error={errors.headers}
            disabled={isSubmitting}
            onChange={handleHeadersChange}
          />

          {methodAllowsBody(values.http_method) && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold" htmlFor="webhook-body-template">
                {t("components.GameServerSettings.webhooks.form.bodyTemplate")}
              </label>
              <textarea
                id="webhook-body-template"
                className={cn(
                  "w-full resize-y rounded-md border border-border bg-muted/30",
                  "px-3 py-2 font-mono text-sm leading-relaxed min-h-32",
                  "focus:outline-none focus:ring-2 focus:ring-ring/50",
                  errors.body_template && "border-destructive",
                )}
                value={values.body_template}
                onChange={(e) => onValuesChange({ body_template: e.target.value })}
                disabled={isSubmitting}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
              {errors.body_template && (
                <p className="text-sm text-destructive">{errors.body_template}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {t("components.GameServerSettings.webhooks.form.placeholderHint")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {WEBHOOK_PLACEHOLDERS.map((placeholder) => (
                <code
                  key={placeholder}
                  className="text-xs bg-muted/50 px-2 py-1 rounded font-mono text-muted-foreground"
                >
                  {`{{${placeholder}}}`}
                </code>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
        onClick={handleEnabledToggle}
        disabled={isSubmitting}
      >
        <Checkbox checked={values.enabled} className="size-5" tabIndex={-1} />
        <span className="text-sm">{t("components.GameServerSettings.webhooks.form.enabled")}</span>
      </button>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">
          {t("components.GameServerSettings.webhooks.form.subscribedEvents")}
        </p>
        {WEBHOOK_EVENTS.map((event) => (
          <button
            type="button"
            key={event}
            className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
            onClick={() => handleEventToggle(event, !values.subscribed_events.includes(event))}
            disabled={isSubmitting}
          >
            <Checkbox
              checked={values.subscribed_events.includes(event)}
              className="size-5"
              tabIndex={-1}
            />
            <span className="text-sm">
              {t(`components.GameServerSettings.webhooks.events.${event}`)}
            </span>
          </button>
        ))}
        {errors.subscribed_events && (
          <p className="text-sm text-destructive">{errors.subscribed_events}</p>
        )}
      </div>
    </div>
  );
};

export default WebhookForm;
