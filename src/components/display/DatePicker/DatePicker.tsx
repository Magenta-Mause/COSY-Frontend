import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRangeChange: (value: { startDate: Date; endDate: Date }) => void;
}
const DatePicker = (props: DatePickerProps) => {
  const { t } = useTranslation();
  const [clickCount, setClickCount] = useState(0);

  const today = new Date();
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleFirstSelection = (range: DateRange, prev?: DateRange) => {
    const { from, to } = range;
    if (!from) return range;

    if (prev?.from && prev.from > from) {
      return { from: from, to: from };
    }

    if (from && to && to > from) {
      return { from: to, to: to };
    }

    return { from, to };
  };

  const handleSecondSelection = (range: DateRange, prev?: DateRange) => {
    const { from, to } = range;
    if (!to) return range;

    if (from && from < to) {
      return { from, to };
    }

    return { from: prev?.from, to };
  };

  const handleSelectRange = (range: DateRange | undefined) => {
    if (!range?.from) return;

    if (clickCount === 0) {
      setDate((prev) => handleFirstSelection(range, prev));
      setClickCount(1);
    } else {
      setDate((prev) => handleSecondSelection(range, prev));
      setClickCount(0);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="w-auto">
        <DialogHeader>
          <DialogTitle>{t("datepicker.title")}</DialogTitle>
          <DialogDescription>{t("datepicker.des")}</DialogDescription>
        </DialogHeader>
        <DialogMain>
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelectRange}
            numberOfMonths={2}
            disabled={{ after: today }}
          />
        </DialogMain>
        <DialogFooter>
          <Button variant="secondary" onClick={() => props.onOpenChange(false)}>
            {t("timerange.cancel")}
          </Button>
          <Button
            onClick={() => {
              if (date?.from && date?.to) {
                props.onRangeChange({ startDate: date.from, endDate: date.to });
              }
              props.onOpenChange(false);
            }}
          >
            {t("timerange.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatePicker;
