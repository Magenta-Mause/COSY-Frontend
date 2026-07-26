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

/** The inverse table: the character a sequence produces -> the sequence that produces it. */
const ESCAPE_SEQUENCE_FOR_CHARACTER: Record<string, string> = {
  "\\": "\\\\",
  "\n": "\\n",
  "\t": "\\t",
  "\r": "\\r",
};

/**
 * Processes common escape sequences in a string value.
 * Converts literal escape sequences like \n, \t, \r, \\ into their actual characters.
 *
 * Unescaping happens in a single left-to-right pass, so an escaped backslash is never
 * re-interpreted as the start of another sequence: `\\n` yields a literal `\n`, not a
 * newline. Unknown sequences (e.g. `\x`) are left untouched.
 *
 * This is the read direction of the form field: the user edits the escaped notation and
 * the stored value is the processed result. Use {@link escapeSequences} to go back.
 */
export function processEscapeSequences(value: string): string {
  return value.replace(/\\([\s\S])/g, (match, char: string) => ESCAPE_SEQUENCES[char] ?? match);
}

/**
 * Renders a stored value back into the escaped notation the input field edits.
 *
 * Exact inverse of {@link processEscapeSequences}: `processEscapeSequences(escapeSequences(v))`
 * is `v` for every string. Every character is rewritten in a single pass, so the backslash is
 * necessarily escaped before the sequences it introduces -- a stored `C:\Users\test` becomes
 * `C:\\Users\\test`, not `C:\Users\test` (which would read back as a tab).
 *
 * The other direction is deliberately not an identity: unknown sequences pass through unprocessed
 * (`\x` stays `\x`), so re-escaping them would yield `\\x`. Values must therefore be escaped once
 * when they enter the form and processed once when they leave it, never processed twice.
 */
export function escapeSequences(value: string): string {
  return value.replace(/[\\\n\t\r]/g, (char) => ESCAPE_SEQUENCE_FOR_CHARACTER[char]);
}
