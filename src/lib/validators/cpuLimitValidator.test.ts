import { describe, expect, it } from "vitest";
import {
  CPU_LIMIT_POSITIVE_ERROR,
  cpuLimitValidator,
  getCpuLimitError,
} from "@/lib/validators/cpuLimitValidator.ts";

describe("cpuLimitValidator", () => {
  it("accepts and coerces a positive numeric string", () => {
    const result = cpuLimitValidator.safeParse("1.5");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(1.5);
    }
  });

  it("rejects zero", () => {
    expect(cpuLimitValidator.safeParse("0").success).toBe(false);
  });

  it("rejects a negative number with the positive-error message", () => {
    const result = cpuLimitValidator.safeParse(-2);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(CPU_LIMIT_POSITIVE_ERROR);
    }
  });
});

describe("getCpuLimitError", () => {
  it("returns null for empty/nullish values (nothing to validate yet)", () => {
    expect(getCpuLimitError("")).toBeNull();
    expect(getCpuLimitError(null)).toBeNull();
    expect(getCpuLimitError(undefined)).toBeNull();
  });

  it("returns null for a valid positive value", () => {
    expect(getCpuLimitError("2")).toBeNull();
    expect(getCpuLimitError(0.5)).toBeNull();
  });

  it("returns the error message for zero or negative values", () => {
    expect(getCpuLimitError("0")).toBe(CPU_LIMIT_POSITIVE_ERROR);
    expect(getCpuLimitError(-1)).toBe(CPU_LIMIT_POSITIVE_ERROR);
  });

  it("returns the error message for a non-numeric value", () => {
    expect(getCpuLimitError("abc")).toBe(CPU_LIMIT_POSITIVE_ERROR);
  });
});
