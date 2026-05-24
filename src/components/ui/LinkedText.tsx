const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_TEST_REGEX = /^https?:\/\//;

const BRACKET_PAIRS: [string, string][] = [
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
];

function stripTrailingBrackets(url: string): { url: string; stripped: string } {
  let result = url;
  let stripped = "";

  for (const [open, close] of BRACKET_PAIRS) {
    const openCount = result.split(open).length - 1;
    const closeCount = result.split(close).length - 1;
    let excess = closeCount - openCount;
    while (excess > 0 && result.endsWith(close)) {
      stripped = close + stripped;
      result = result.slice(0, -1);
      excess--;
    }
  }

  return { url: result, stripped };
}

interface LinkedTextProps {
  text: string;
  linkClassName?: string;
}

type Part = { text: string; isUrl: boolean };

export default function LinkedText({ text, linkClassName }: LinkedTextProps) {
  const rawParts = text.split(URL_SPLIT_REGEX);
  const parts: Part[] = [];

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (URL_TEST_REGEX.test(part)) {
      const { url, stripped } = stripTrailingBrackets(part);
      parts.push({ text: url, isUrl: true });
      if (stripped) {
        // Reattach stripped brackets to the following text segment
        if (i + 1 < rawParts.length) {
          rawParts[i + 1] = stripped + rawParts[i + 1];
        } else {
          parts.push({ text: stripped, isUrl: false });
        }
      }
    } else {
      parts.push({ text: part, isUrl: false });
    }
  }

  return (
    <>
      {parts.map(({ text: part, isUrl }, i) =>
        isUrl ? (
          <a
            key={`${i}-${part}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName ?? "underline hover:opacity-70 transition-opacity"}
          >
            {part}
          </a>
        ) : (
          <span key={`${i}-${part}`}>{part}</span>
        ),
      )}
    </>
  );
}
