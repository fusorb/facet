import * as React from "react";

import { cn } from "../utils.js";

/** A preset option shown in the range selector. */
export interface ChartRangePreset {
  /** Display label (e.g. "7d", "This month"). */
  label: string;
  /** Opaque value passed back via `onChange`. */
  value: string;
}

export interface ChartRangeSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Preset options to display. */
  presets: ChartRangePreset[];
  /** Currently selected value (controlled). */
  active: string;
  /** Called when the user selects a different preset. */
  onChange: (value: string) => void;
}

/** Quick date / range filter bar that sits above a Chart. Fully controlled —
 * you decide which presets exist and what data they map to. */
export function ChartRangeSelector({
  presets,
  active,
  onChange,
  className,
  ...rest
}: ChartRangeSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted p-1 text-sm font-medium",
        className,
      )}
      {...rest}
    >
      {presets.map((p) => {
        const isSelected = p.value === active;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
              "transition-all duration-150",
              isSelected
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
