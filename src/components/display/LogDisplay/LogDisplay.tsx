import LogMessage from "@components/display/LogDisplay/LogMessage";
import { Button } from "@components/ui/button";
import Icon from "@components/ui/Icon.tsx";
import { Input } from "@components/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useSendCommand } from "@/api/generated/backend-api";
import arrowRightIcon from "@/assets/icons/arrowRight.webp";
import sendIcon from "@/assets/icons/send.webp";
import { cn } from "@/lib/utils.ts";
import type { GameServerLogWithUuid } from "@/stores/slices/gameServerLogSlice.ts";

const LogDisplay = (
  props: {
    logMessages: GameServerLogWithUuid[];
    showCommandInput?: boolean;
    gameServerUuid?: string;
    isServerRunning?: boolean;
    canReadLogs?: boolean;
    hideTimestamps?: boolean;
    showExtendedTimestamps?: boolean;
    disableRoundness?: boolean;
    disableBorder?: boolean;
    overridePermissionCheck?: boolean;
  } & Omit<React.ComponentProps<"div">, "children">,
) => {
  const { t } = useTranslation();
  const {
    logMessages: rawLogs,
    showCommandInput = false,
    gameServerUuid,
    isServerRunning = false,
    canReadLogs = true,
    hideTimestamps,
    showExtendedTimestamps,
    disableRoundness,
    disableBorder,
    overridePermissionCheck,
    ...divProps
  } = props;

  const logDisplayRef = useRef<VirtuosoHandle>(null);
  const [displayLogs, setDisplayLogs] = useState<GameServerLogWithUuid[]>([]);
  const [sticky, setSticky] = useState(true);
  const [displayTimestamp, setDisplayTimestamp] = useState(true);
  const [commandInput, setCommandInput] = useState("");
  const isInitialLoad = useRef(true);

  const { mutate: sendCommand, isPending } = useSendCommand();

  useEffect(() => {
    if (isInitialLoad.current && rawLogs.length > 0) {
      setDisplayLogs(rawLogs);
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 500);
      return;
    }

    const handler = setTimeout(() => {
      setDisplayLogs(rawLogs);
    }, 100);

    return () => clearTimeout(handler);
  }, [rawLogs]);

  const handleSendCommand = () => {
    if (!commandInput.trim() || !gameServerUuid || isPending || !isServerRunning) {
      return;
    }

    sendCommand(
      { uuid: gameServerUuid, data: { command: commandInput } },
      {
        onSuccess: () => {
          setCommandInput("");
        },
      },
    );
  };

  const handleAutoScrollToggle = (newVal: boolean) => {
    setSticky(newVal);
  };

  const scrollTo = useCallback((index: number) => {
    logDisplayRef.current?.scrollToIndex({ index, align: "end", behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!sticky) return;
    scrollTo(displayLogs.length - 1);
  }, [displayLogs, scrollTo, sticky]);

  return (
    <div
      {...divProps}
      className={cn(
        "flex flex-col bg-gray-950 text-gray-100 font-mono h-full",
        !disableRoundness && "rounded-md",
        !disableBorder && "border border-gray-800",
        divProps.className,
      )}
    >
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 text-xs uppercase tracking-wide text-gray-400">
        <span>{t("logDisplay.serverLog")}</span>
        <div className={"flex gap-5"}>
          {!hideTimestamps && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={displayTimestamp}
                onChange={(e) => setDisplayTimestamp(e.target.checked)}
                className="accent-emerald-500"
              />
              <span className="text-[11px]">{t("logDisplay.displayTimestamp")}</span>
            </label>
          )}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sticky}
              onChange={(e) => handleAutoScrollToggle(e.target.checked)}
              className="accent-emerald-500"
            />
            <span className="text-[11px]">{t("logDisplay.stickToBottom")}</span>
          </label>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Virtuoso
          ref={logDisplayRef}
          key={displayLogs.length === 0 ? "empty" : "loaded"}
          data={displayLogs}
          followOutput={sticky ? "auto" : false}
          // This is necessary to ensure that the list doesn't jump around when new logs are added.
          // Without this, the list will jump around when new logs are added because the list is aligned to the bottom.
          atBottomStateChange={(atBottom) => {
            if (!isInitialLoad.current) setSticky(atBottom);
          }}
          atBottomThreshold={20}
          // This ensures that items are aligned to the bottom of the list container
          alignToBottom
          // Explicitly use the UUID as the key for better re-render tracking
          computeItemKey={(_index, item) => item.uuid}
          // Auto scroll to bottom when new logs are added
          initialTopMostItemIndex={displayLogs.length > 0 ? displayLogs.length - 1 : 0}
          itemContent={(_index, message) => (
            <div className="w-full overflow-hidden">
              <LogMessage
                message={message}
                showExtendedTimestamps={showExtendedTimestamps}
                hideTimestamp={hideTimestamps || !displayTimestamp}
              />
            </div>
          )}
          style={{ height: "100%" }}
          // Increase the overscan to ensure that the last log is always visible.
          // This is necessary because the list is aligned to the bottom of the container.
          overscan={400}
          // Adding a tiny bit of bottom padding to the list content
          // ensures the last log isn't flush against the edge.
          components={{
            Footer: () => <div className="h-2" />,
          }}
        />
        {!canReadLogs && !overridePermissionCheck && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-gray-400 text-center px-2">
              <div className="text-lg font-semibold mb-2">
                {t("serverPage.noAccessFor", { element: t("serverPage.navbar.console") })}
              </div>
              <div className="text-sm">{t("logDisplay.noLogsPermission")}</div>
            </div>
          </div>
        )}
      </div>

      {showCommandInput && gameServerUuid && (
        <div className="border-t border-gray-800 p-2 flex gap-2">
          <Input
            type="text"
            placeholder={
              isServerRunning ? t("logDisplay.enterCommand") : t("logDisplay.cantSendCommands")
            }
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendCommand();
              }
            }}
            disabled={!isServerRunning}
            className="bg-gray-900 border-gray-700 text-gray-100 font-mono text-[15px] placeholder:text-gray-500 grow w-auto h-10"
            wrapperClassName={"w-auto grow"}
            startDecorator={
              <Icon src={arrowRightIcon} className="size-4 opacity-50" variant="primary" />
            }
          />
          <Button
            onClick={handleSendCommand}
            disabled={!commandInput.trim() || isPending || !isServerRunning}
            size="sm"
            className={"w-fit h-10"}
          >
            <Icon src={sendIcon} className="size-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogDisplay;
