import DatePicker from "@/components/display/DatePicker/DatePicker";
import Icon from "@/components/ui/Icon.tsx";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import arrowDownIcon from "@/assets/icons/arrowDown.webp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimeRangeProps {
  className?: string;
  onChange: (value: { timeUnit: string; startTime: Date; endTime?: Date }) => void;
  defaultLabel?: string;
}

const TIME_RANGE_PRESETS: [number, "min" | "hour" | "day"][] = [
  [15, "min"],
  [30, "min"],
  [1, "hour"],
  [6, "hour"],
  [12, "hour"],
  [1, "day"],
  [7, "day"],
  [30, "day"],
];

type Selection =
  | { type: "default" }
  | { type: "preset"; time: number; unit: "min" | "hour" | "day" }
  | { type: "custom"; startDate: Date; endDate: Date };

const timeAgo = (value: number, unit: string): Date => {
  const ms =
    unit === "min"
      ? value * 60 * 1000
      : unit === "hour"
        ? value * 60 * 60 * 1000
        : value * 24 * 60 * 60 * 1000;

  return new Date(Date.now() - ms);
};

const TimeRangeDropDown = (props: TimeRangeProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as {
    timeRangeType?: string;
    timeRangeValue?: string;
    timeRangeUnit?: string;
    timeRangeStart?: string;
    timeRangeEnd?: string;
  };
  const [openCustom, setOpenCustom] = useState<boolean>(false);

  const [selection, setSelection] = useState<Selection>(() => {
    if (search.timeRangeType === "preset") {
      const time = Number(search.timeRangeValue);
      const unit = search.timeRangeUnit;
      if (
        !Number.isNaN(time) &&
        time > 0 &&
        (unit === "min" || unit === "hour" || unit === "day")
      ) {
        return { type: "preset", time, unit };
      }
    }
    if (search.timeRangeType === "custom") {
      const startDate = search.timeRangeStart ? new Date(search.timeRangeStart) : null;
      const endDate = search.timeRangeEnd ? new Date(search.timeRangeEnd) : null;
      if (
        startDate &&
        endDate &&
        !Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(endDate.getTime())
      ) {
        return { type: "custom", startDate, endDate };
      }
    }
    return { type: "default" };
  });

  const initialSelectionRef = useRef(selection);
  const onChangeRef = useRef(props.onChange);

  // Fire onChange once on mount if a selection was restored from the URL
  useEffect(() => {
    const initial = initialSelectionRef.current;
    if (initial.type === "preset") {
      onChangeRef.current({
        timeUnit: initial.unit,
        startTime: timeAgo(initial.time, initial.unit),
      });
    } else if (initial.type === "custom") {
      onChangeRef.current({
        timeUnit: "day",
        startTime: initial.startDate,
        endTime: initial.endDate,
      });
    }
  }, []);

  const selectedLabel = useMemo(() => {
    switch (selection.type) {
      case "default":
        return props.defaultLabel ?? t("timerange.button");
      case "preset":
        return t(`timerange.${selection.unit}`, { time: selection.time });
      case "custom":
        return `${format(selection.startDate, "LLL dd, y")} - ${format(selection.endDate, "LLL dd, y")}`;
    }
  }, [selection, t, props.defaultLabel]);

  const handleSelect = (time: number, unit: "min" | "hour" | "day") => {
    setSelection({ type: "preset", time, unit });
    props.onChange({ timeUnit: unit, startTime: timeAgo(time, unit) });
    navigate({
      // @ts-expect-error - TanStack Router search param typing issue
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        timeRangeType: "preset",
        timeRangeValue: String(time),
        timeRangeUnit: unit,
        timeRangeStart: undefined,
        timeRangeEnd: undefined,
      }),
      replace: true,
    });
  };

  const handleCustomRange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    setSelection({ type: "custom", startDate, endDate });
    props.onChange({ timeUnit: "day", startTime: startDate, endTime: endDate });
    navigate({
      // @ts-expect-error - TanStack Router search param typing issue
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        timeRangeType: "custom",
        timeRangeStart: startDate.toISOString(),
        timeRangeEnd: endDate.toISOString(),
        timeRangeValue: undefined,
        timeRangeUnit: undefined,
      }),
      replace: true,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={`${props.className}`}>
            {selectedLabel}
            <Icon src={arrowDownIcon} className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-(--radix-dropdown-menu-trigger-width) bg-primary-modal-background"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setOpenCustom(true)}>
              {t("timerange.custom")}
            </DropdownMenuItem>
            {TIME_RANGE_PRESETS.map(([time, unit]) => (
              <DropdownMenuItem key={`${time}-${unit}`} onSelect={() => handleSelect(time, unit)}>
                {t(`timerange.${unit}`, { time: time })}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DatePicker
        open={openCustom}
        onOpenChange={setOpenCustom}
        onRangeChange={handleCustomRange}
      />
    </>
  );
};

export default TimeRangeDropDown;
