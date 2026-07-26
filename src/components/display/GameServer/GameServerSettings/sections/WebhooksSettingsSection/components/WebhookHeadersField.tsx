import { useTranslation } from "react-i18next";
import plusIcon from "@/assets/icons/plus.webp";
import trashIcon from "@/assets/icons/trash.webp";
import Icon from "@/components/ui/Icon.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";
import type { WebhookHeaderField } from "./webhook.types";

interface WebhookHeadersFieldProps {
  headers: WebhookHeaderField[];
  error?: string;
  disabled: boolean;
  onChange: (headers: WebhookHeaderField[]) => void;
}

/** Name/value editor for the request headers of a custom webhook. */
const WebhookHeadersField = ({ headers, error, disabled, onChange }: WebhookHeadersFieldProps) => {
  const { t } = useTranslationPrefix("components.GameServerSettings.webhooks.form");
  // The remove-button label lives outside this section's key prefix.
  const { t: tRoot } = useTranslation();

  const updateHeader = (index: number, patch: Partial<WebhookHeaderField>) => {
    onChange(headers.map((header, i) => (i === index ? { ...header, ...patch } : header)));
  };

  const removeHeader = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const addHeader = () => {
    onChange([...headers, { name: "", value: "" }]);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold">{t("headers")}</p>

      {headers.map((header, index) => (
        // Headers have no id of their own and an empty name is a valid intermediate state while
        // typing, so the position in the list is the only stable key available here.
        // biome-ignore lint/suspicious/noArrayIndexKey: no stable id exists for a header row
        <div key={index} className="flex items-center gap-2 w-full">
          <Input
            value={header.name}
            placeholder={t("headerName")}
            onChange={(e) => updateHeader(index, { name: e.target.value })}
            disabled={disabled}
            wrapperClassName="flex-1"
          />
          <Input
            value={header.value}
            placeholder={t("headerValue")}
            onChange={(e) => updateHeader(index, { value: e.target.value })}
            disabled={disabled}
            wrapperClassName="flex-1"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            disabled={disabled}
            aria-label={tRoot("common.removeEntry")}
            onClick={() => removeHeader(index)}
          >
            <Icon src={trashIcon} className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        disabled={disabled}
        onClick={addHeader}
      >
        <Icon src={plusIcon} className="size-4" />
        {t("addHeader")}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default WebhookHeadersField;
