/**
 * DateInput: a text input that parses and validates ISO (YYYY-MM-DD) dates,
 * with an optional native date-picker fallback.
 *
 * Usage:
 *   <DateInput value="2026-03-05" onValueChange={setDate} label="Start date" />
 */

import * as React from "react";
import { cn } from "../utils.js";

export interface DateInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  /** ISO date string (YYYY-MM-DD). */
  value?: string | null;
  /** Called with a validated ISO date string (or null when cleared/invalid). */
  onValueChange?: (value: string | null) => void;
  /** Use a native date input. Default: false (text input with validation). */
  native?: boolean;
  /** Show a label above the input. */
  label?: string;
}

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Validate an ISO date string; returns the normalized string or null. */
export function validateIsoDate(value: string): string | null {
  const m = ISO_DATE_RE.exec(value);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(mo) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null; // e.g. 2026-02-30 rolls over.
  }
  return value;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    { value, onValueChange, native = false, label, className, ...props },
    ref,
  ) => {
    const [draft, setDraft] = React.useState<string>(value ?? "");
    const inputId = React.useId();

    // Sync external value changes into the draft.
    React.useEffect(() => {
      setDraft(value ?? "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDraft(raw);
      if (raw === "") {
        onValueChange?.(null);
      } else if (native) {
        onValueChange?.(raw);
      } else {
        const validated = validateIsoDate(raw);
        if (validated) onValueChange?.(validated);
      }
    };

    const handleBlur = () => {
      if (!native && draft !== "") {
        const validated = validateIsoDate(draft);
        if (!validated) setDraft(value ?? ""); // revert invalid input
      }
    };

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={native ? "date" : "text"}
          inputMode={native ? undefined : "numeric"}
          placeholder={native ? undefined : "YYYY-MM-DD"}
          value={native ? (value ?? "") : draft}
          onChange={handleChange}
          onBlur={handleBlur}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
      </div>
    );
  },
);
DateInput.displayName = "DateInput";
