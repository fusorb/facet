/**
 * DatePicker: an in-house calendar date picker built on the facet Popover
 * and Button primitives (no external date library).
 *
 * `scrollMode` controls how the calendar is laid out:
 *   - "vertical": a month grid with prev/next month navigation.
 *   - "horizontal": a horizontally scrollable strip of days (compact).
 *
 * Usage:
 *   <DatePicker value={date} onValueChange={setDate} label="Due date" />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button } from "./button.js";
import { Popover, PopoverTrigger, PopoverContent } from "./popover.js";
import { Icon } from "../icon/index.js";

/* ── Date helpers (pure) ───────────────────────────────────── */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

/** ISO date string (YYYY-MM-DD) in local time. */
export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse an ISO date string (YYYY-MM-DD) as a local date. */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildMonthGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const leading = first.getDay();
  const daysInMonth = endOfMonth(month).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  return cells;
}

/* ── Props ─────────────────────────────────────────────────── */

export interface DatePickerProps {
  /** Selected date. */
  value?: Date | null;
  /** Called when a day is selected. */
  onValueChange?: (date: Date) => void;
  /** Label for the trigger (screen reader + tooltip). */
  label?: string;
  /** Placeholder shown when no date is selected. Default: "Pick a date". */
  placeholder?: string;
  /**
   * Calendar layout.
   * - "vertical": month grid with prev/next navigation.
   * - "horizontal": horizontally scrollable day strip.
   * Default: "vertical".
   */
  scrollMode?: "vertical" | "horizontal";
  /** Number of days to render in the horizontal strip. Default: 28. */
  horizontalDays?: number;
  /** Disable individual dates. */
  disabled?: (date: Date) => boolean;
  /** Disable the entire picker. */
  disabledAll?: boolean;
  /** Show a year-jump picker inside the calendar. Default: true for vertical mode. */
  showYearPicker?: boolean;
  /** Earliest selectable year. Default: current year - 10. */
  minYear?: number;
  /** Latest selectable year. Default: current year + 10. */
  maxYear?: number;
  /** Class name for the trigger. */
  className?: string;
  /** Align the popover. Default: "start". */
  align?: "start" | "center" | "end";
}

/* ── Day button (shared) ───────────────────────────────────── */

function DayButton({
  date,
  selected,
  today,
  disabled,
  onSelect,
  compact,
}: {
  date: Date;
  selected: boolean;
  today: boolean;
  disabled: boolean;
  onSelect: (date: Date) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      disabled={disabled}
      aria-label={formatDate(date)}
      className={cn(
        "rounded-md text-sm font-medium tabular-nums transition-colors",
        compact ? "h-9 w-9" : "h-9 w-9",
        disabled && "cursor-not-allowed opacity-40",
        selected
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : today
            ? "border border-primary/60 text-primary hover:bg-accent"
            : "text-foreground hover:bg-accent",
      )}
    >
      {date.getDate()}
    </button>
  );
}

/* ── Main component ────────────────────────────────────────── */

export function DatePicker({
  value,
  onValueChange,
  label = "Pick a date",
  placeholder = "Pick a date",
  scrollMode = "vertical",
  horizontalDays = 28,
  disabled,
  disabledAll = false,
  showYearPicker = true,
  minYear,
  maxYear,
  className,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const today = new Date();
  const [viewMonth, setViewMonth] = React.useState<Date>(
    startOfMonth(value ?? today),
  );
  const [viewYear, setViewYear] = React.useState<number>(
    value?.getFullYear() ?? today.getFullYear(),
  );

  // When the picker opens, jump the view to the selected month if any.
  React.useEffect(() => {
    if (open && value) {
      setViewMonth(startOfMonth(value));
      setViewYear(value.getFullYear());
    }
  }, [open, value]);

  const select = (date: Date) => {
    onValueChange?.(date);
    setOpen(false);
  };

  const isDisabled = (date: Date) =>
    disabledAll ? true : (disabled?.(date) ?? false);

  const yearMin = minYear ?? today.getFullYear() - 10;
  const yearMax = maxYear ?? today.getFullYear() + 10;

  const jumpToYear = (year: number) => {
    const clamped = Math.min(yearMax, Math.max(yearMin, year));
    setViewYear(clamped);
    setViewMonth(new Date(clamped, viewMonth.getMonth(), 1));
  };

  const years = Array.from(
    { length: yearMax - yearMin + 1 },
    (_, i) => yearMin + i,
  );

  const renderVertical = () => {
    const cells = buildMonthGrid(viewMonth);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Previous month"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
          >
            ←
          </Button>
          <span className="text-sm font-semibold text-foreground">
            {viewMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Next month"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
          >
            →
          </Button>
        </div>
        {showYearPicker && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Previous year"
              disabled={viewYear <= yearMin}
              onClick={() => jumpToYear(viewYear - 1)}
            >
              ←
            </Button>
            <select
              aria-label="Select year"
              value={viewYear}
              onChange={(e) => jumpToYear(Number(e.target.value))}
              className="h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus-visible:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Next year"
              disabled={viewYear >= yearMax}
              onClick={() => jumpToYear(viewYear + 1)}
            >
              →
            </Button>
          </div>
        )}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </span>
          ))}
          {cells.map((cell, i) =>
            cell ? (
              <DayButton
                key={i}
                date={cell}
                selected={value ? isSameDay(cell, value) : false}
                today={isSameDay(cell, today)}
                disabled={isDisabled(cell)}
                onSelect={select}
              />
            ) : (
              <span key={i} />
            ),
          )}
        </div>
      </div>
    );
  };

  const renderHorizontal = () => {
    const days = Array.from({ length: horizontalDays }, (_, i) =>
      addDays(today, i),
    );
    return (
      <div className="flex gap-1 overflow-x-auto pb-1">
        {days.map((day) => (
          <div
            key={toIsoDate(day)}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] uppercase text-muted-foreground">
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <DayButton
              date={day}
              selected={value ? isSameDay(day, value) : false}
              today={isSameDay(day, today)}
              disabled={isDisabled(day)}
              onSelect={select}
              compact
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabledAll}
          aria-label={label}
          className={cn("h-9 w-full justify-between font-normal", className)}
        >
          <span
            className={cn(value ? "text-foreground" : "text-muted-foreground")}
          >
            {value ? formatDate(value) : placeholder}
          </span>
          <Icon
            name="calendar"
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-3">
        {scrollMode === "horizontal" ? renderHorizontal() : renderVertical()}
      </PopoverContent>
    </Popover>
  );
}
