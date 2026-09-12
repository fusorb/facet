/**
 * @fusorb/facet-components: RangeSlider
 *
 * A two-thumb range slider with an active-track highlight, optional
 * value labels, and accessible keyboard navigation. Distinct from
 * `Slider` (which is single-thumb).
 *
 * Why: filter sidebars, price ranges, date ranges, weight bands - every
 * search filter UI needs a range slider.
 */

import * as React from "react";
import { cn } from "../utils.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface RangeSliderProps {
  /** Current range [min, max]. */
  value: [number, number];
  /** Called when the range changes. */
  onChange: (next: [number, number]) => void;
  /** Minimum allowed value. */
  min: number;
  /** Maximum allowed value. */
  max: number;
  /** Step (default: 1). */
  step?: number;
  /** Format a value (e.g. abbreviate 1000 → "1k"). */
  formatValue?: (n: number) => string;
  /** Disable the slider. */
  disabled?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
  /** ARIA label for the lower thumb. */
  ariaLabelMin?: string;
  /** ARIA label for the upper thumb. */
  ariaLabelMax?: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function snap(v: number, step: number, min: number): number {
  if (step <= 0) return v;
  const snapped = Math.round((v - min) / step) * step + min;
  return Number(snapped.toFixed(10));
}

const defaultFormat = (n: number) => String(n);

/* ── Component ─────────────────────────────────────────────── */

/**
 * Two-thumb range slider with an active-track highlight and value
 * labels. Keyboard accessible (Arrow keys nudge by 1 step; Home/End
 * jump to the ends).
 */
export function RangeSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = defaultFormat,
  disabled,
  className,
  ariaLabelMin = "Minimum",
  ariaLabelMax = "Maximum",
}: RangeSliderProps) {
  const [lo, hi] = value;
  const loPct = ((clamp(lo, min, max) - min) / (max - min)) * 100;
  const hiPct = ((clamp(hi, min, max) - min) / (max - min)) * 100;

  const handleLo = (e: React.ChangeEvent<HTMLInputElement>) => {
    let next = clamp(snap(Number(e.target.value), step, min), min, hi);
    if (next > hi) next = hi;
    onChange([next, hi]);
  };

  const handleHi = (e: React.ChangeEvent<HTMLInputElement>) => {
    let next = clamp(snap(Number(e.target.value), step, min), lo, max);
    if (next < lo) next = lo;
    onChange([lo, next]);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-6 w-full">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-secondary" />
        {/* Active fill */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />

        {/* Two visually-stacked <input type="range"> thumbs.
            Pointer-events on the track are disabled so the thumbs
            stay the only interactive target. */}
        <input
          type="range"
          aria-label={ariaLabelMin}
          min={min}
          max={max}
          step={step}
          value={lo}
          disabled={disabled}
          onChange={handleLo}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
        />
        <input
          type="range"
          aria-label={ariaLabelMax}
          min={min}
          max={max}
          step={step}
          value={hi}
          disabled={disabled}
          onChange={handleHi}
          className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
        />
      </div>

      {/* Value labels */}
      <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span>{formatValue(lo)}</span>
        <span>{formatValue(hi)}</span>
      </div>
    </div>
  );
}

RangeSlider.displayName = "RangeSlider";