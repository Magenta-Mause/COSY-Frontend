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

const ESCAPE_SEQUENCES: Record<string, string> = {
  "\\": "\\", // backslash
  n: "\n", // newline
  t: "\t", // tab
  r: "\r", // carriage return
};

/**
 * Processes common escape sequences in a string value.
 * Converts literal escape sequences like \n, \t, \r, \\ into their actual characters.
 *
 * Unescaping happens in a single left-to-right pass, so an escaped backslash is never
 * re-interpreted as the start of another sequence: `\\n` yields a literal `\n`, not a
 * newline. Unknown sequences (e.g. `\x`) are left untouched.
 */
export function processEscapeSequences(value: string): string {
  return value.replace(/\\([\s\S])/g, (match, char: string) => ESCAPE_SEQUENCES[char] ?? match);
}
