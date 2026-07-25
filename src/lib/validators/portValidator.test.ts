import { describe, expect, it } from "vitest";
import {
  coercedPortValidator,
  PORT_MAX,
  PORT_MIN,
  portValidator,
} from "@/lib/validators/portValidator.ts";

describe("portValidator", () => {
  it("accepts a port in the middle of the valid range", () => {
    expect(portValidator.safeParse(8080).success).toBe(true);
  });

  it("accepts the lower and upper boundaries", () => {
    expect(portValidator.safeParse(PORT_MIN).success).toBe(true);
    expect(portValidator.safeParse(PORT_MAX).success).toBe(true);
  });

  it("rejects values below the minimum", () => {
    expect(portValidator.safeParse(PORT_MIN - 1).success).toBe(false);
  });

  it("rejects values above the maximum", () => {
    expect(portValidator.safeParse(PORT_MAX + 1).success).toBe(false);
  });

  it("rejects non-number input", () => {
    expect(portValidator.safeParse("8080").success).toBe(false);
  });
});

describe("coercedPortValidator", () => {
  it("coerces a numeric string into a valid number", () => {
    const result = coercedPortValidator.safeParse("25565");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(25565);
    }
  });

  it("coerces the boundary strings", () => {
    expect(coercedPortValidator.safeParse(String(PORT_MIN)).success).toBe(true);
    expect(coercedPortValidator.safeParse(String(PORT_MAX)).success).toBe(true);
  });

  it("rejects a coerced value that is out of range", () => {
    expect(coercedPortValidator.safeParse(String(PORT_MAX + 1)).success).toBe(false);
  });
});
