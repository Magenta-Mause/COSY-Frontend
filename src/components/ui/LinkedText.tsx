const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_TEST_REGEX = /^https?:\/\//;

interface LinkedTextProps {
  text: string;
  linkClassName?: string;
}

export default function LinkedText({ text, linkClassName }: LinkedTextProps) {
  const parts = text.split(URL_SPLIT_REGEX);

  return (
    <>
      {parts.map((part, i) =>
        URL_TEST_REGEX.test(part) ? (
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
