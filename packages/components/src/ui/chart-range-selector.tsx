import * as React from "react";

import { cn } from "../utils.js";

/** A preset option shown in the range selector. */
export interface ChartRangePreset {
  /** Display label (e.g. "7d", "This month"). */
  label: string;
  /** Opaque value passed back via `onChange`. */
  value: string;
}

/** Anchor position relative to the chart container. */
export type ChartRangeSelectorPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom";

export interface ChartRangeSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Preset options to display. */
  presets: ChartRangePreset[];
  /** Currently selected value (controlled). */
  active: string;
  /** Called when the user selects a different preset. */
  onChange: (value: string) => void;
  /** Position relative to the chart container. Default: "top-right". */
  position?: ChartRangeSelectorPosition;
  /** Size variant controls padding and font size. Default: "normal". */
  size?: "compact" | "normal" | "wide";
  /** Show a minimize/restore toggle button. Default: false. */
  minimizable?: boolean;
  /** Initial minimized state (uncontrolled). Default: false. */
  defaultMinimized?: boolean;
  /** Controlled minimized state. */
  minimized?: boolean;
  /** Called when the minimized state changes. */
  onMinimizedChange?: (minimized: boolean) => void;
}

const POSITION_CLASSES: Record<ChartRangeSelectorPosition, string> = {
  "top-left": "absolute top-2 left-2",
  "top-right": "absolute top-2 right-2",
  "bottom-left": "absolute bottom-2 left-2",
  "bottom-right": "absolute bottom-2 right-2",
  top: "absolute top-2 left-1/2 -translate-x-1/2",
  bottom: "absolute bottom-2 left-1/2 -translate-x-1/2",
};

const SIZE_CLASSES: Record<NonNullable<ChartRangeSelectorProps["size"]>, string> = {
  compact: "gap-0.5 px-1 py-0.5 text-xs",
  normal: "gap-1 px-2 py-1 text-sm",
  wide: "gap-2 px-3 py-1.5 text-sm",
};

/** Chevron icon — points down when expanded, points up when minimized. */
function MinimizeIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={collapsed ? "M3 8l3-3 3 3" : "M3 4l3 3 3-3"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Quick date / range filter bar that sits on top of a Chart. Fully
 * controlled — you decide which presets exist and what data they map to.
 *
 * When embedded via `<Chart rangeSelector={...} />` the container is already
 * `position: relative`, so every `position` option anchors correctly.
 * Can also be used standalone inside any `relative` wrapper. */
export function ChartRangeSelector({
  presets,
  active,
  onChange,
  position = "top-right",
  size = "normal",
  minimizable = false,
  defaultMinimized = false,
  minimized: controlledMinimized,
  onMinimizedChange,
  className,
  ...rest
}: ChartRangeSelectorProps) {
  const [internalMinimized, setInternalMinimized] = React.useState(
    defaultMinimized,
  );
  const minimized = controlledMinimized ?? internalMinimized;

  const handleToggle = () => {
    const next = !minimized;
    onMinimizedChange?.(next);
    if (controlledMinimized === undefined) setInternalMinimized(next);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted",
        POSITION_CLASSES[position],
        SIZE_CLASSES[size],
        "animate-in fade-in",
        className,
      )}
      {...rest}
    >
      {minimized && minimizable ? (
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Restore range selector"
          className="rounded px-2 py-1 font-semibold text-muted-foreground hover:text-foreground"
        >
          <MinimizeIcon collapsed={false} />
        </button>
      ) : (
        <>
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
          {minimizable && (
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Minimize range selector"
              className="rounded px-2 py-1 font-semibold text-muted-foreground hover:text-foreground"
            >
              <MinimizeIcon collapsed={true} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
