import clsx from "clsx";
import { format } from "date-fns";
import {
  type GameServerLogMessageEntity,
  GameServerLogMessageEntityLevel,
} from "@/api/generated/model";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix.tsx";

const LOG_STYLES: Record<
  string,
  { text: string; bg: string; border: string; borderLeft: string; opacity?: number }
> = {
  [GameServerLogMessageEntityLevel.INFO]: {
    text: "text-sky-400",
    bg: "bg-sky-950/30",
    border: "border-sky-500",
    borderLeft: "border-l-sky-500/50",
  },
  [GameServerLogMessageEntityLevel.ERROR]: {
    text: "text-rose-400",
    bg: "bg-rose-950/30",
    border: "border-rose-500",
    borderLeft: "border-l-rose-500/50",
  },
  [GameServerLogMessageEntityLevel.INPUT]: {
    text: "text-emerald-400",
    bg: "bg-emerald-950/30",
    border: "border-emerald-500",
    borderLeft: "border-l-emerald-500/50",
    opacity: 0.7,
  },
  [GameServerLogMessageEntityLevel.COSY_INFO]: {
    text: "text-cyan-400",
    bg: "bg-cyan-950/20",
    border: "border-cyan-500",
    borderLeft: "border-l-cyan-500/50",
    opacity: 0.7,
  },
  [GameServerLogMessageEntityLevel.COSY_DEBUG]: {
    text: "text-violet-400",
    bg: "bg-violet-950/20",
    border: "border-violet-500",
    borderLeft: "border-l-violet-500/50",
    opacity: 0.7,
  },
  [GameServerLogMessageEntityLevel.COSY_ERROR]: {
    text: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-500",
    borderLeft: "border-l-red-500/50",
  },
};

const LogMessage = ({
  message,
  showExtendedTimestamps,
  hideTimestamp,
}: {
  message: GameServerLogMessageEntity;
  showExtendedTimestamps?: boolean;
  hideTimestamp?: boolean;
}) => {
  const { t } = useTranslationPrefix("logDisplay");
  const level = (message.level as string) ?? "INFO";
  const styles = LOG_STYLES[level] ?? LOG_STYLES[GameServerLogMessageEntityLevel.INFO];

  const timestamp = message.timestamp
    ? format(
        new Date(message.timestamp),
        showExtendedTimestamps ? t("timestampFormatDetailed") : t("timestampFormat"),
      )
    : "--:--:--";

  return (
    <div
      className={clsx(
        "group flex items-start px-3 py-1 text-xs transition-all duration-75",
        "border-l-2 border-transparent hover:border-current",
        "hover:bg-white/5",
        styles.bg,
        styles.borderLeft,
      )}
      style={{
        opacity: styles.opacity,
      }}
    >
      {!hideTimestamp && (
        <span className="font-mono text-gray-500 mr-3 select-none opacity-70 group-hover:opacity-100 leading-relaxed">
          {timestamp}
        </span>
      )}

      <span
        className={clsx("min-w-65 font-mono uppercase mr-2 leading-relaxed contents", styles.text)}
      >
        <span className={!hideTimestamp ? "px-2" : "pr-2"}>[{level}]</span>
      </span>

      <span className="text-gray-200 font-mono selection:bg-sky-500/30 leading-relaxed wrap-anywhere">
        {message.message ?? ""}
      </span>
    </div>
  );
};

export default LogMessage;
