/**
 * @fusorb/facet-components: DateRangePicker
 *
 * A composable date-range picker with two modes:
 * - "single": a single Date picker with quick presets.
 * - "range": a paired start/end picker with quick presets.
 *
 * Why: every booking/filter/report screen needs this. Consumers
 * shouldn't wire calendar math + presets + formatting by hand.
 */

import * as React from "react";
import { cn } from "../utils.js";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  addDays,
  formatDate,
} from "./date-picker.js";
import { Button } from "./button.js";
import { Popover, PopoverTrigger, PopoverContent } from "./popover.js";
import { Icon } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangePreset {
  id: string;
  label: string;
  build: (today: Date) => DateRange | Date;
}

export interface DateRangePickerProps {
  value?: DateRange | Date | null;
  onChange?: (next: DateRange | Date | undefined) => void;
  mode?: "range" | "single";
  presets?: DateRangePreset[];
  placeholder?: string;
  formatValue?: (value: DateRange | Date) => string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

/* ── Defaults ──────────────────────────────────────────────── */

const defaultRangePresets: DateRangePreset[] = [
  { id: "today", label: "Today", build: (today) => ({ from: today, to: today }) },
  { id: "yesterday", label: "Yesterday", build: (today) => ({ from: addDays(today, -1), to: addDays(today, -1) }) },
  { id: "7days", label: "Last 7 days", build: (today) => ({ from: addDays(today, -6), to: today }) },
  { id: "30days", label: "Last 30 days", build: (today) => ({ from: addDays(today, -29), to: today }) },
  { id: "this-month", label: "This month", build: (today) => ({ from: startOfMonth(today), to: endOfMonth(today) }) },
  { id: "last-month", label: "Last month", build: (today) => { const f = startOfMonth(addMonths(today, -1)); return { from: f, to: endOfMonth(f) }; } },
];

const defaultSinglePresets: DateRangePreset[] = [
  { id: "today", label: "Today", build: (today) => today },
  { id: "tomorrow", label: "Tomorrow", build: (today) => addDays(today, 1) },
  { id: "in-7", label: "In a week", build: (today) => addDays(today, 7) },
];

const defaultFormatValue = (value: DateRange | Date): string => {
  if (value instanceof Date) return formatDate(value);
  return `${formatDate(value.from)} – ${formatDate(value.to)}`;
};

/* ── Helpers ───────────────────────────────────────────────── */

function isInRange(d: Date, from: Date, to: Date): boolean {
  const t = d.setHours(0, 0, 0, 0);
  return t >= from.setHours(0, 0, 0, 0) && t <= to.setHours(0, 0, 0, 0);
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildCells(month: Date): Date[] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const cells: Date[] = [];
  const leading = first.getDay();
  for (let i = 0; i < leading; i++) {
    cells.push(addDays(first, -(leading - i)));
  }
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  const extra = cells.length % 7 || 7;
  if (extra < 7) {
    for (let i = 1; i <= 7 - extra; i++) {
      cells.push(addDays(last, i));
    }
  }
  return cells;
}

function MonthGrid({
  month,
  value,
  onSelect,
  isRange,
  minDate,
  maxDate,
}: {
  month: Date;
  value: Date | DateRange | null;
  onSelect: (d: Date) => void;
  isRange: boolean;
  minDate?: Date;
  maxDate?: Date;
}) {
  const cells = React.useMemo(() => buildCells(month), [month]);

  const disabled = (d: Date) =>
    (minDate != null && d < minDate) || (maxDate != null && d > maxDate);

  const selected = (d: Date): boolean => {
    if (!value) return false;
    if (value instanceof Date)
      return d.setHours(0, 0, 0, 0) === value.setHours(0, 0, 0, 0);
    return isInRange(d, value.from, value.to);
  };

  const isAnchor = (d: Date): boolean => {
    if (!value || value instanceof Date) return false;
    return (
      d.setHours(0, 0, 0, 0) === value.from.setHours(0, 0, 0, 0) ||
      d.setHours(0, 0, 0, 0) === value.to.setHours(0, 0, 0, 0)
    );
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-px text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === month.getMonth();
          const dis = disabled(d);
          const sel = selected(d);
          const anchor = isAnchor(d);
          return (
            <button
              key={i}
              type="button"
              disabled={dis}
              onClick={() => onSelect(d)}
              className={cn(
                "mx-auto my-[2px] flex h-8 w-8 items-center justify-center text-sm outline-none",
                !inMonth && "text-muted-foreground/30",
                dis && "cursor-not-allowed opacity-40",
                sel && isRange && "rounded bg-primary/10 font-medium text-primary",
                sel && !isRange && "rounded bg-primary text-primary-foreground",
                !sel && anchor && "rounded-full border border-primary font-medium",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────── */

export function DateRangePicker({
  value,
  onChange,
  mode = "range",
  presets,
  placeholder = "Pick a range",
  formatValue = defaultFormatValue,
  minDate,
  maxDate,
  disabled,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [calendar, setCalendar] = React.useState(new Date());
  const [draft, setDraft] = React.useState<DateRange | Date | null>(value ?? null);
  const isRange = mode === "range";
  const activePresets = presets ?? (isRange ? defaultRangePresets : defaultSinglePresets);

  React.useEffect(() => setDraft(value ?? null), [value]);

  const apply = (next: DateRange | Date) => {
    onChange?.(next);
    setOpen(false);
  };

  const triggerLabel = value ? formatValue(value) : placeholder;

  const handleSelect = (d: Date) => {
    if (!isRange) {
      setDraft(d);
      return;
    }
    if (!draft || draft instanceof Date) setDraft({ from: d, to: d });
    else if (!draft.to || draft.to.getTime() === draft.from.getTime()) {
      setDraft({ ...draft, to: d });
    } else {
      setDraft({ from: d, to: d });
    }
  };

  const canApply = (): boolean => {
    if (!draft) return false;
    if (!isRange) return true;
    if (draft instanceof Date) return false;
    return !!draft.to;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Icon name="calendar" />
          <span className="truncate">{triggerLabel}</span>
          {value && (
            <button
              type="button"
              aria-label="Clear date"
              className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
                setDraft(null);
              }}
            >
              <Icon name="x" className="size-3.5" />
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-3 p-3 sm:flex-row">
          {/* Preset sidebar */}
          <div className="flex flex-col gap-1 border-r border-border pr-3">
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Quick picks
            </p>
            {activePresets.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start font-normal"
                onClick={() => apply(p.build(new Date()))}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCalendar(addMonths(calendar, -1))}
              >
                <Icon name="chevron-left" className="size-4" />
              </Button>
              <span className="text-sm font-medium">
                {calendar.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCalendar(addMonths(calendar, 1))}
              >
                <Icon name="chevron-right" className="size-4" />
              </Button>
            </div>
            <MonthGrid
              month={calendar}
              value={draft}
              onSelect={handleSelect}
              isRange={isRange}
              minDate={minDate}
              maxDate={maxDate}
            />
            <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(value ?? null);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (draft && canApply()) apply(draft);
                }}
                disabled={!canApply()}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

DateRangePicker.displayName = "DateRangePicker";