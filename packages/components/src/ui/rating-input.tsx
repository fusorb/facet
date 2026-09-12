/**
 * @fusorb/facet-components: RatingInput
 *
 * A 5-star (or N-item) rating input. Hosts pass `value` (a number) and
 * `onChange`. Supports a label, hover preview, half-star precision,
 * and keyboard navigation (Arrow keys nudge, Home/End jump to bounds).
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface RatingInputProps {
  /** Current rating (0 = no value). */
  value: number;
  /** Called when the user picks a rating. */
  onChange: (next: number) => void;
  /** Maximum rating (default: 5). */
  max?: number;
  /** Allow half-ratings. Default: false. */
  allowHalf?: boolean;
  /** Optional label. */
  label?: string;
  /** Read-only mode. */
  readOnly?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
  /** Star size (Tailwind size class). Default: "size-5". */
  iconSize?: string;
  /** Extra className for the wrapper. */
  className?: string;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * A star (or any lucide icon) rating input.
 *
 * @example
 *   const [rating, setRating] = useState(0);
 *   <RatingInput value={rating} onChange={setRating} label="Rate this" />
 */
export function RatingInput({
  value,
  onChange,
  max = 5,
  allowHalf = false,
  label,
  readOnly,
  disabled,
  iconSize = "size-5",
  className,
}: RatingInputProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const display = hover ?? value;

  const setAt = (e: React.MouseEvent<HTMLButtonElement>, idx: number) => {
    if (readOnly || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = allowHalf && e.clientX - rect.left < rect.width / 2;
    onChange(isHalf ? idx - 0.5 : idx);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (readOnly || disabled) return;
    const step = allowHalf ? 0.5 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0, value - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
      <div
        role="radiogroup"
        aria-label={label ?? "Rating"}
        aria-readonly={readOnly}
        onMouseLeave={() => setHover(null)}
        className={cn(
          "inline-flex items-center gap-1",
          (disabled || readOnly) && "opacity-70",
        )}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((idx) => {
          const isActive = display >= idx;
          const isHalfActive = allowHalf && display >= idx - 0.5 && display < idx;
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={value === idx || (allowHalf && value === idx - 0.5)}
              aria-label={`${idx} ${max === 1 ? "star" : "stars"}`}
              tabIndex={readOnly || disabled ? -1 : 0}
              onClick={(e) => setAt(e, idx)}
              onMouseMove={(e) => {
                if (readOnly || disabled) return;
                if (!allowHalf) {
                  setHover(idx);
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const isHalf = e.clientX - rect.left < rect.width / 2;
                setHover(isHalf ? idx - 0.5 : idx);
              }}
              onKeyDown={handleKey}
              className={cn(
                "transition-colors",
                (readOnly || disabled) && "cursor-default",
              )}
            >
              <Icon
                name="star"
                className={cn(
                  iconSize,
                  isActive
                    ? "fill-amber-400 text-amber-400"
                    : isHalfActive
                      ? "fill-amber-400/50 text-amber-400"
                      : "text-muted-foreground/30",
                )}
              />
            </button>
          );
        })}
        {display > 0 && (
          <span className="ml-2 text-sm tabular-nums text-muted-foreground">
            {display} / {max}
          </span>
        )}
      </div>
    </div>
  );
}

RatingInput.displayName = "RatingInput";