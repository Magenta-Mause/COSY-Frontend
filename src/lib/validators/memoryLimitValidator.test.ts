import { describe, expect, it } from "vitest";
import {
  getMemoryLimitError,
  MEMORY_LIMIT_MIN_ERROR,
  memoryLimitValidator,
} from "@/lib/validators/memoryLimitValidator.ts";

describe("memoryLimitValidator", () => {
  it("accepts a MiB value at or above the 6 MiB minimum", () => {
    expect(memoryLimitValidator.safeParse("6MiB").success).toBe(true);
    expect(memoryLimitValidator.safeParse("512MiB").success).toBe(true);
  });

  it("accepts GiB values regardless of magnitude", () => {
    expect(memoryLimitValidator.safeParse("1GiB").success).toBe(true);
    expect(memoryLimitValidator.safeParse("0.5GiB").success).toBe(true);
  });

  it("rejects a MiB value below the minimum with the min-error message", () => {
    const result = memoryLimitValidator.safeParse("5MiB");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(MEMORY_LIMIT_MIN_ERROR);
    }
  });

  it("rejects an unrecognised format (missing unit)", () => {
    expect(memoryLimitValidator.safeParse("512").success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(memoryLimitValidator.safeParse("").success).toBe(false);
  });
});

describe("getMemoryLimitError", () => {
  it("returns null for empty/nullish values", () => {
    expect(getMemoryLimitError("")).toBeNull();
    expect(getMemoryLimitError(null)).toBeNull();
    expect(getMemoryLimitError(undefined)).toBeNull();
  });

  it("returns null for a valid MiB/GiB value", () => {
    expect(getMemoryLimitError("6MiB")).toBeNull();
    expect(getMemoryLimitError("2GiB")).toBeNull();
  });

  it("returns the min-error message for a MiB value below 6", () => {
    expect(getMemoryLimitError("5MiB")).toBe(MEMORY_LIMIT_MIN_ERROR);
  });

  it("returns null for an unparseable value (format handled by the schema, not this helper)", () => {
    expect(getMemoryLimitError("512")).toBeNull();
  });
});
