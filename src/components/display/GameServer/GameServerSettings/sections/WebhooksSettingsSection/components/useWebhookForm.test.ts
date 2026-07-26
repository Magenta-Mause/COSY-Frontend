import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  WebhookCreationDtoHttpMethod,
  WebhookCreationDtoSubscribedEventsItem,
  WebhookCreationDtoWebhookType,
} from "@/api/generated/model";
import "@/i18n/i18n";
import translationEN from "@/i18n/en-US/translation";
import { useWebhookForm } from "./useWebhookForm.ts";
import {
  MAX_BODY_TEMPLATE_LENGTH,
  MAX_HEADER_VALUE_LENGTH,
  MAX_HEADERS,
  type WebhookFormValues,
  type WebhookHeaderField,
} from "./webhook.types.ts";

const messages = translationEN.components.GameServerSettings.webhooks.validation;

const makeValues = (overrides: Partial<WebhookFormValues> = {}): WebhookFormValues => ({
  webhook_type: WebhookCreationDtoWebhookType.CUSTOM,
  webhook_url: "https://example.org/hook",
  enabled: true,
  subscribed_events: [WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED],
  http_method: WebhookCreationDtoHttpMethod.POST,
  body_template: "{}",
  headers: [],
  ...overrides,
});

const renderForm = (
  overrides: Partial<WebhookFormValues> = {},
  onSubmit: (values: WebhookFormValues) => Promise<void> = () => Promise.resolve(),
) => renderHook(() => useWebhookForm({ defaultValues: makeValues(overrides), onSubmit }));

const headers = (count: number): WebhookHeaderField[] =>
  Array.from({ length: count }, (_, i) => ({ name: `X-H${i}`, value: "v" }));

beforeAll(async () => {
  // The hook resolves error keys through i18next, so the assertions below compare against
  // the English catalogue rather than against hardcoded copy.
  await i18n.changeLanguage("en");
});

describe("useWebhookForm — URL and events", () => {
  it("reports nothing for a valid form", () => {
    const { result } = renderForm();
    expect(result.current.errors).toEqual({});
    expect(result.current.isDisabled).toBe(false);
  });

  it("rejects a URL without an http(s) scheme", () => {
    const { result } = renderForm({ webhook_url: "ftp://example.org" });
    expect(result.current.errors.webhook_url).toBe(messages.webhookUrlInvalid);
    expect(result.current.isDisabled).toBe(true);
  });

  it("stays quiet about an empty URL but still blocks submission", () => {
    const { result } = renderForm({ webhook_url: "" });
    expect(result.current.errors.webhook_url).toBeUndefined();
    expect(result.current.isDisabled).toBe(true);
  });

  it("requires at least one subscribed event", () => {
    const { result } = renderForm({ subscribed_events: [] });
    expect(result.current.errors.subscribed_events).toBe(messages.subscribedEventsRequired);
    expect(result.current.isDisabled).toBe(true);
  });
});

describe("useWebhookForm — custom header validation", () => {
  it("requires a name once a value has been typed", () => {
    const { result } = renderForm({ headers: [{ name: "  ", value: "secret" }] });
    expect(result.current.errors.headers).toBe(messages.headerNameRequired);
    expect(result.current.isDisabled).toBe(true);
  });

  it("allows a fully blank row, which is just an unfilled editor line", () => {
    const { result } = renderForm({ headers: [{ name: "", value: "" }] });
    expect(result.current.errors.headers).toBeUndefined();
    expect(result.current.isDisabled).toBe(false);
  });

  it(`accepts exactly ${MAX_HEADERS} named headers and rejects one more`, () => {
    expect(
      renderForm({ headers: headers(MAX_HEADERS) }).result.current.errors.headers,
    ).toBeUndefined();
    expect(renderForm({ headers: headers(MAX_HEADERS + 1) }).result.current.errors.headers).toBe(
      messages.headersTooMany,
    );
  });

  it("rejects a name that is not an RFC 7230 token", () => {
    const { result } = renderForm({ headers: [{ name: "X Api Key", value: "v" }] });
    expect(result.current.errors.headers).toBe(messages.headerNameInvalid);
  });

  it("rejects a transport-owned header the backend would refuse", () => {
    const { result } = renderForm({ headers: [{ name: "Host", value: "evil.example" }] });
    expect(result.current.errors.headers).toBe(messages.headerNameReserved);
  });

  it("rejects an over-long value but accepts one at the limit", () => {
    const atLimit = "x".repeat(MAX_HEADER_VALUE_LENGTH);
    expect(
      renderForm({ headers: [{ name: "X-Api-Key", value: atLimit }] }).result.current.errors
        .headers,
    ).toBeUndefined();
    expect(
      renderForm({ headers: [{ name: "X-Api-Key", value: `${atLimit}x` }] }).result.current.errors
        .headers,
    ).toBe(messages.headerValueTooLong);
  });

  it("rejects duplicate names case-insensitively", () => {
    const { result } = renderForm({
      headers: [
        { name: "X-Api-Key", value: "a" },
        { name: " x-api-key ", value: "b" },
      ],
    });
    expect(result.current.errors.headers).toBe(messages.headerNameDuplicate);
  });

  it("ignores header and body problems for a non-custom webhook", () => {
    const { result } = renderForm({
      webhook_type: WebhookCreationDtoWebhookType.DISCORD,
      headers: [{ name: "Host", value: "evil.example" }],
      body_template: "x".repeat(MAX_BODY_TEMPLATE_LENGTH + 1),
    });
    expect(result.current.errors.headers).toBeUndefined();
    expect(result.current.errors.body_template).toBeUndefined();
    expect(result.current.isDisabled).toBe(false);
  });
});

describe("useWebhookForm — body template", () => {
  it("rejects a template over the limit but accepts one at it", () => {
    expect(
      renderForm({ body_template: "x".repeat(MAX_BODY_TEMPLATE_LENGTH) }).result.current.errors
        .body_template,
    ).toBeUndefined();
    expect(
      renderForm({ body_template: "x".repeat(MAX_BODY_TEMPLATE_LENGTH + 1) }).result.current.errors
        .body_template,
    ).toBe(messages.bodyTemplateTooLong);
  });
});

describe("useWebhookForm — state and submission", () => {
  it("merges a partial change into the current values", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValuesChange({ http_method: WebhookCreationDtoHttpMethod.GET });
    });
    expect(result.current.values.http_method).toBe(WebhookCreationDtoHttpMethod.GET);
    expect(result.current.values.webhook_url).toBe("https://example.org/hook");
  });

  it("adds and removes a subscribed event without duplicating it", () => {
    const { result } = renderForm();
    act(() => {
      result.current.toggleSubscribedEvent(
        WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED,
        true,
      );
    });
    expect(result.current.values.subscribed_events).toEqual([
      WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED,
    ]);

    act(() => {
      result.current.toggleSubscribedEvent(
        WebhookCreationDtoSubscribedEventsItem.SERVER_STARTED,
        false,
      );
    });
    expect(result.current.values.subscribed_events).toEqual([]);
  });

  it("resetForm restores the values the form was opened with", () => {
    const { result } = renderForm();
    act(() => {
      result.current.handleValuesChange({ webhook_url: "https://changed.example" });
    });
    act(() => {
      result.current.resetForm();
    });
    expect(result.current.values.webhook_url).toBe("https://example.org/hook");
  });

  it("submits the current values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderForm({}, onSubmit);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith(makeValues());
    expect(result.current.isSubmitting).toBe(false);
  });

  it("does not submit while the form is invalid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderForm({ headers: [{ name: "Host", value: "evil.example" }] }, onSubmit);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears the submitting flag when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderForm({}, onSubmit);

    await act(async () => {
      await expect(result.current.handleSubmit()).rejects.toThrow("boom");
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});
