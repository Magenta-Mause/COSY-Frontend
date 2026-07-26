import { describe, expect, it } from "vitest";
import {
  escapeSequences,
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

  it("keeps a Windows path intact when its backslashes are escaped", () => {
    // The typed notation for C:\Users\test -- previously it came out as C:\Users<TAB>est.
    expect(processEscapeSequences("C:\\\\Users\\\\test")).toBe("C:\\Users\\test");
  });

  it("handles a CRLF pair", () => {
    expect(processEscapeSequences("a\\r\\nb")).toBe("a\r\nb");
    expect(processEscapeSequences("a\\\\r\\\\nb")).toBe("a\\r\\nb");
  });

  it("leaves an equals sign in the value alone", () => {
    expect(processEscapeSequences("key=value=more")).toBe("key=value=more");
    expect(processEscapeSequences("a=b\\nc=d")).toBe("a=b\nc=d");
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

describe("escapeSequences", () => {
  it("renders the supported characters as their escape sequence", () => {
    expect(escapeSequences("a\nb")).toBe("a\\nb");
    expect(escapeSequences("a\tb")).toBe("a\\tb");
    expect(escapeSequences("a\rb")).toBe("a\\rb");
    expect(escapeSequences("a\\b")).toBe("a\\\\b");
  });

  it("escapes the backslash before the sequences it introduces", () => {
    // A naive LF-first escaper would leave C:\Users\test alone and let it read back as a tab.
    expect(escapeSequences("C:\\Users\\test")).toBe("C:\\\\Users\\\\test");
    expect(escapeSequences("a\\nb")).toBe("a\\\\nb");
  });

  it("leaves strings without special characters unchanged", () => {
    expect(escapeSequences("")).toBe("");
    expect(escapeSequences("plain value")).toBe("plain value");
    expect(escapeSequences("key=value")).toBe("key=value");
  });
});

describe("escapeSequences / processEscapeSequences round trip", () => {
  const storedValues = [
    "",
    "plain value",
    "C:\\Users\\test",
    "a\\nb",
    "a\nb",
    "a\r\nb",
    "\t leading tab",
    "trailing backslash\\",
    "a\\\\b",
    "JAVA_OPTS=-Xmx2G -Dfile.separator=\\",
    "\\x is not a sequence",
  ];

  it.each(storedValues)("processEscapeSequences(escapeSequences(%j)) is the identity", (stored) => {
    expect(processEscapeSequences(escapeSequences(stored))).toBe(stored);
  });

  it("stays stable when a value is escaped and processed repeatedly", () => {
    let stored = "C:\\Users\\test\nline2";
    for (let i = 0; i < 5; i++) {
      stored = processEscapeSequences(escapeSequences(stored));
    }
    expect(stored).toBe("C:\\Users\\test\nline2");
  });
});
