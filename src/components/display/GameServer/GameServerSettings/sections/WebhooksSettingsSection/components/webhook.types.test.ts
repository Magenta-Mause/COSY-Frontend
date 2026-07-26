import { describe, expect, it } from "vitest";
import {
  WebhookCreationDtoHttpMethod,
  WebhookCreationDtoSubscribedEventsItem,
  WebhookCreationDtoWebhookType,
  type WebhookDto,
} from "@/api/generated/model";
import {
  DEFAULT_BODY_TEMPLATE,
  DEFAULT_HTTP_METHOD,
  DEFAULT_WEBHOOK_TYPE,
  fieldsToHeaders,
  getDefaultFormValues,
  headersToFields,
  isReservedHeaderName,
  isValidHeaderName,
  methodAllowsBody,
  webhookDtoToFormValues,
} from "./webhook.types.ts";

describe("isValidHeaderName", () => {
  it("accepts RFC 7230 token characters", () => {
    expect(isValidHeaderName("X-Api-Key")).toBe(true);
    expect(isValidHeaderName("Authorization")).toBe(true);
    expect(isValidHeaderName("!#$%&'*+-.^_`|~0Az")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(isValidHeaderName("  X-Api-Key  ")).toBe(true);
  });

  it("rejects names with separators, spaces or an empty value", () => {
    expect(isValidHeaderName("X Api Key")).toBe(false);
    expect(isValidHeaderName("X-Api-Key:")).toBe(false);
    expect(isValidHeaderName("X/Api")).toBe(false);
    expect(isValidHeaderName("")).toBe(false);
    expect(isValidHeaderName("   ")).toBe(false);
  });
});

describe("isReservedHeaderName", () => {
  it("matches transport-owned headers regardless of case or padding", () => {
    expect(isReservedHeaderName("Host")).toBe(true);
    expect(isReservedHeaderName("  CONTENT-LENGTH ")).toBe(true);
    expect(isReservedHeaderName("transfer-encoding")).toBe(true);
    expect(isReservedHeaderName("Connection")).toBe(true);
    expect(isReservedHeaderName("Upgrade")).toBe(true);
    expect(isReservedHeaderName("Expect")).toBe(true);
    expect(isReservedHeaderName("TE")).toBe(true);
  });

  it("leaves ordinary headers alone", () => {
    expect(isReservedHeaderName("X-Api-Key")).toBe(false);
    expect(isReservedHeaderName("Content-Type")).toBe(false);
    expect(isReservedHeaderName("Authorization")).toBe(false);
  });
});

describe("methodAllowsBody", () => {
  it("denies a body for GET and HEAD", () => {
    expect(methodAllowsBody(WebhookCreationDtoHttpMethod.GET)).toBe(false);
    expect(methodAllowsBody(WebhookCreationDtoHttpMethod.HEAD)).toBe(false);
  });

  it("allows a body for the remaining methods", () => {
    const bodyless: string[] = [
      WebhookCreationDtoHttpMethod.GET,
      WebhookCreationDtoHttpMethod.HEAD,
    ];
    for (const method of Object.values(WebhookCreationDtoHttpMethod)) {
      if (bodyless.includes(method)) continue;
      expect(methodAllowsBody(method)).toBe(true);
    }
  });
});

describe("headersToFields / fieldsToHeaders", () => {
  it("maps an object to ordered fields", () => {
    expect(headersToFields({ "X-Api-Key": "secret", "X-Trace": "1" })).toEqual([
      { name: "X-Api-Key", value: "secret" },
      { name: "X-Trace", value: "1" },
    ]);
  });

  it("treats missing headers as an empty list", () => {
    expect(headersToFields(undefined)).toEqual([]);
  });

  it("drops unnamed rows and trims names on the way back", () => {
    expect(
      fieldsToHeaders([
        { name: "  X-Api-Key  ", value: "secret" },
        { name: "   ", value: "orphaned" },
        { name: "", value: "" },
      ]),
    ).toEqual({ "X-Api-Key": "secret" });
  });

  it("keeps header values untrimmed, since spaces there can be significant", () => {
    expect(fieldsToHeaders([{ name: "X-Pad", value: " padded " }])).toEqual({
      "X-Pad": " padded ",
    });
  });

  it("round-trips a header object", () => {
    const headers = { "X-Api-Key": "secret", Accept: "application/json" };
    expect(fieldsToHeaders(headersToFields(headers))).toEqual(headers);
  });

  it("lets a later duplicate name win, matching the object it produces", () => {
    expect(
      fieldsToHeaders([
        { name: "X-Api-Key", value: "first" },
        { name: "X-Api-Key", value: "second" },
      ]),
    ).toEqual({ "X-Api-Key": "second" });
  });
});

describe("webhookDtoToFormValues", () => {
  it("carries a fully populated webhook across unchanged", () => {
    const dto: WebhookDto = {
      uuid: "wh-1",
      webhook_type: WebhookCreationDtoWebhookType.CUSTOM,
      webhook_url: "https://example.org/hook",
      enabled: false,
      subscribed_events: [WebhookCreationDtoSubscribedEventsItem.SERVER_STOPPED],
      http_method: WebhookCreationDtoHttpMethod.PUT,
      body_template: `{"a":1}`,
      headers: { "X-Api-Key": "secret" },
    };

    expect(webhookDtoToFormValues(dto)).toEqual({
      webhook_type: WebhookCreationDtoWebhookType.CUSTOM,
      webhook_url: "https://example.org/hook",
      enabled: false,
      subscribed_events: [WebhookCreationDtoSubscribedEventsItem.SERVER_STOPPED],
      http_method: WebhookCreationDtoHttpMethod.PUT,
      body_template: `{"a":1}`,
      headers: [{ name: "X-Api-Key", value: "secret" }],
    });
  });

  it("fills in defaults for a webhook created before the custom-format fields existed", () => {
    const values = webhookDtoToFormValues({ uuid: "wh-2" } as WebhookDto);

    expect(values.webhook_type).toBe(DEFAULT_WEBHOOK_TYPE);
    expect(values.http_method).toBe(DEFAULT_HTTP_METHOD);
    expect(values.body_template).toBe(DEFAULT_BODY_TEMPLATE);
    expect(values.headers).toEqual([]);
    expect(values.webhook_url).toBe("");
    expect(values.subscribed_events).toEqual([]);
  });

  it("keeps an explicit `enabled: false` instead of defaulting it to true", () => {
    expect(webhookDtoToFormValues({ uuid: "wh-3", enabled: false } as WebhookDto).enabled).toBe(
      false,
    );
  });
});

describe("getDefaultFormValues", () => {
  it("hands out a fresh subscribed_events array each time", () => {
    const first = getDefaultFormValues();
    const second = getDefaultFormValues();

    first.subscribed_events.push(WebhookCreationDtoSubscribedEventsItem.SERVER_STOPPED);

    expect(second.subscribed_events).not.toContain(
      WebhookCreationDtoSubscribedEventsItem.SERVER_STOPPED,
    );
  });
});
