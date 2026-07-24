import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import {
  WEBHOOK_EVENTS,
  WEBHOOK_TYPES,
  type WebhookEvent,
  type WebhookFormProps,
  type WebhookType,
} from "./webhook.types";

const WebhookForm = ({ values, errors, isSubmitting, onValuesChange }: WebhookFormProps) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks");

  const handleWebhookTypeChange = (value: string) => {
    onValuesChange({ webhook_type: value as WebhookType });
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
          {t("form.webhookType")}
        </label>
        <Select value={values.webhook_type} onValueChange={handleWebhookTypeChange}>
          <SelectTrigger id="webhook-type" className="w-full" disabled={isSubmitting}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEBHOOK_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`types.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        id="webhook-url"
        header={t("form.webhookUrl")}
        value={values.webhook_url}
        placeholder="https://your-webhook-url.org"
        onChange={(e) => handleWebhookUrlChange(e.target.value)}
        error={errors.webhook_url}
        disabled={isSubmitting}
      />

      <button
        type="button"
        className="cursor-pointer flex gap-2 align-middle items-center select-none grow-0 w-fit"
        onClick={handleEnabledToggle}
        disabled={isSubmitting}
      >
        <Checkbox checked={values.enabled} className="size-5" tabIndex={-1} />
        <span className="text-sm">{t("form.enabled")}</span>
      </button>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">
          {t("form.subscribedEvents")}
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
              {t(`events.${event}`)}
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
