import { describe, expect, it } from "vitest";
import {
  WEBHOOK_URL_INVALID_MESSAGE,
  WEBHOOK_URL_REQUIRED_MESSAGE,
  webhookUrlValidator,
} from "@/lib/validators/webhookUrlValidator.ts";

describe("webhookUrlValidator", () => {
  it("accepts an http URL", () => {
    expect(webhookUrlValidator.safeParse("http://example.com/hook").success).toBe(true);
  });

  it("accepts an https URL", () => {
    expect(webhookUrlValidator.safeParse("https://example.com/hook").success).toBe(true);
  });

  it("accepts a URL padded with surrounding whitespace", () => {
    expect(webhookUrlValidator.safeParse("  https://example.com  ").success).toBe(true);
  });

  it("rejects a URL without an http(s) scheme and surfaces the invalid message key", () => {
    const result = webhookUrlValidator.safeParse("ftp://example.com");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(WEBHOOK_URL_INVALID_MESSAGE);
    }
  });

  it("rejects an empty string with the required message key", () => {
    const result = webhookUrlValidator.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(WEBHOOK_URL_REQUIRED_MESSAGE);
    }
  });
});
