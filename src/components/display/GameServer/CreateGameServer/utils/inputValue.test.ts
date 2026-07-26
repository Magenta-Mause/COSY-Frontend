import { describe, expect, it } from "vitest";
import {
  preProcessInputValue,
  processEscapeSequences,
} from "@/components/display/GameServer/CreateGameServer/utils/inputValue.ts";

describe("preProcessInputValue", () => {
  it("converts the value to a number for number inputs", () => {
    expect(preProcessInputValue("25565", "number")).toBe(25565);
  });

  it("keeps the raw string for text and email inputs", () => {
    expect(preProcessInputValue("25565", "text")).toBe("25565");
    expect(preProcessInputValue("admin@example.com", "email")).toBe("admin@example.com");
  });
});

describe("processEscapeSequences", () => {
  it("converts the supported escape sequences into their characters", () => {
    expect(processEscapeSequences("a\\nb")).toBe("a\nb");
    expect(processEscapeSequences("a\\tb")).toBe("a\tb");
    expect(processEscapeSequences("a\\rb")).toBe("a\rb");
    expect(processEscapeSequences("a\\\\b")).toBe("a\\b");
  });

  it("does not double-unescape an escaped backslash", () => {
    // "\\n" (escaped backslash + literal n) must stay a backslash followed by "n"
    expect(processEscapeSequences("a\\\\nb")).toBe("a\\nb");
    expect(processEscapeSequences("a\\\\tb")).toBe("a\\tb");
    // an escaped backslash followed by a real newline escape
    expect(processEscapeSequences("a\\\\\\nb")).toBe("a\\\nb");
  });

  it("leaves unknown escape sequences untouched", () => {
    expect(processEscapeSequences("a\\xb")).toBe("a\\xb");
    expect(processEscapeSequences('say \\"hi\\"')).toBe('say \\"hi\\"');
  });

  it("leaves a trailing lone backslash untouched", () => {
    expect(processEscapeSequences("value\\")).toBe("value\\");
  });

  it("returns strings without escape sequences unchanged", () => {
    expect(processEscapeSequences("")).toBe("");
    expect(processEscapeSequences("plain value")).toBe("plain value");
  });
});
