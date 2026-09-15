/**
 * @fusorb/facet-components: OtpInput
 *
 * A standalone OTP / one-time-code input. Hosts pass a string value
 * (length === maxLength) and `onChange`. Supports auto-advance,
 * paste-to-fill, and keyboard navigation (Arrow keys / Backspace).
 *
 * Distinct from `OtpVerificationCard` (which is the full card with
 * title + submit + resend).
 */

import * as React from "react";
import { cn } from "../utils.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface OtpInputProps {
  /** Current OTP value. Should be the same length as `maxLength`. */
  value: string;
  /** Called when the value changes. */
  onChange: (next: string) => void;
  /** Number of digits. Default: 6. */
  maxLength?: number;
  /** Auto-focus the first input on mount. Default: true. */
  autoFocus?: boolean;
  /** Disable interaction. */
  disabled?: boolean;
  /** Allow only digits (default: true) vs alphanumeric. */
  digitsOnly?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
  /** ARIA label for the group. */
  ariaLabel?: string;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * A standalone OTP code input.
 */
export function OtpInput({
  value,
  onChange,
  maxLength = 6,
  autoFocus = true,
  disabled,
  digitsOnly = true,
  className,
  ariaLabel = "One-time code",
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  // Ensure refs.length === maxLength.
  React.useEffect(() => {
    refs.current = refs.current.slice(0, maxLength);
  }, [maxLength]);

  React.useEffect(() => {
    if (autoFocus && refs.current[0]) refs.current[0]?.focus();
  }, [autoFocus]);

  const chars = value.padEnd(maxLength, " ").split("");

  const setCharAt = (idx: number, char: string) => {
    let next = value.split("");
    next[idx] = char;
    let nextStr = next.join("").slice(0, maxLength);
    onChange(nextStr);
    if (char && idx < maxLength - 1) {
      refs.current[idx + 1]?.focus();
      refs.current[idx + 1]?.select();
    }
  };

  const handleChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    if (digitsOnly && /[^0-9]/.test(raw)) return;
    const char = raw.slice(-1) || "";
    setCharAt(idx, char);
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !chars[idx]?.trim() && idx > 0) {
      refs.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < maxLength - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const data = e.clipboardData.getData("text").replace(/\s/g, "");
    if (!data) return;
    const allowed = digitsOnly ? data.replace(/\D/g, "") : data;
    if (!allowed) return;
    e.preventDefault();
    const next = allowed.slice(0, maxLength);
    onChange(next);
    const focusIdx = Math.min(next.length, maxLength - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-1.5", className)}
    >
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode={digitsOnly ? "numeric" : "text"}
          autoComplete="one-time-code"
          maxLength={1}
          value={c.trim()}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-11 w-10 rounded-md border border-border bg-background text-center text-lg font-semibold tabular-nums outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30",
            disabled && "cursor-not-allowed opacity-50",
          )}
        />
      ))}
    </div>
  );
}

OtpInput.displayName = "OtpInput";
