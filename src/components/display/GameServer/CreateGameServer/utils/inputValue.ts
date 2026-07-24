import type { HTMLInputTypeAttribute } from "react";

// All keys must be a key of HTMLInputTypeAttribute
const InputType = {
  text: "text",
  number: "number",
  email: "email",
} as const satisfies Record<string, HTMLInputTypeAttribute>;
export type InputType = (typeof InputType)[keyof typeof InputType];

export function preProcessInputValue(value: string, inputType: InputType): string | number {
  if (inputType === InputType.number) {
    return Number(value);
  }
  return value;
}

/**
 * Processes common escape sequences in a string value.
 * Converts literal escape sequences like \n, \t, \r, \\ into their actual characters.
 */
export function processEscapeSequences(value: string): string {
  return value
    .replace(/\\\\/g, "\\") // backslash (must be FIRST to handle escaping correctly)
    .replace(/\\n/g, "\n") // newline
    .replace(/\\t/g, "\t") // tab
    .replace(/\\r/g, "\r"); // carriage return
}
