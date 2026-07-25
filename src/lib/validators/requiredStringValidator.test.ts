import { describe, expect, it } from "vitest";
import { requiredStringValidator } from "@/lib/validators/requiredStringValidator.ts";

describe("requiredStringValidator", () => {
  it("accepts a non-empty string", () => {
    expect(requiredStringValidator.safeParse("hello").success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(requiredStringValidator.safeParse("").success).toBe(false);
  });

  it("accepts a single character", () => {
    expect(requiredStringValidator.safeParse("x").success).toBe(true);
  });

  it("rejects non-string input", () => {
    expect(requiredStringValidator.safeParse(123).success).toBe(false);
  });
});
