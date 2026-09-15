/**
 * ColorPicker: native color swatch plus validated hex text input.
 */
import * as React from "react";
import { cn } from "../utils.js";
import { Input } from "./input.js";

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export interface ColorPickerProps {
  /** Current color as a hex string (e.g. "#6366f1"). */
  value: string;
  /** Called when the color changes, always a normalized hex string. */
  onValueChange?: (value: string) => void;
  /** Accessible label for the swatch + input. */
  label?: string;
  /** Show only the swatch, no text input. Default: false */
  compact?: boolean;
  className?: string;
  disabled?: boolean;
}

/** Normalize shorthand hex to the full six-digit form. */
export function normalizeHex(value: string): string {
  const m = value.trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return "";
  const hex = m[1]!;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  return `#${full.toLowerCase()}`;
}

/** True when the string is a valid #rgb or #rrggbb hex color. */
export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

/**
 * A color input pair: a native color swatch for picking and an optional hex
 * text field. `onValueChange` only fires with valid, normalized hex colors.
 */
const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      onValueChange,
      label = "Pick a color",
      compact,
      className,
      disabled,
    },
    ref,
  ) => {
    const [draft, setDraft] = React.useState(value);
    const valid = isValidHex(value);
    const draftValid = isValidHex(draft);

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        role="group"
        aria-label={label}
      >
        <span
          className={cn(
            "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border",
            disabled && "opacity-50",
          )}
        >
          <input
            type="color"
            aria-label={label}
            value={valid ? value : "#000000"}
            disabled={disabled}
            onChange={(event) => {
              const normalized = normalizeHex(event.target.value);
              setDraft(normalized);
              onValueChange?.(normalized);
            }}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: valid ? value : "transparent" }}
          />
        </span>
        {!compact && (
          <Input
            value={draft}
            disabled={disabled}
            aria-label={`${label} hex`}
            onChange={(event) => {
              const next = event.target.value;
              setDraft(next);
              if (isValidHex(next)) onValueChange?.(normalizeHex(next));
            }}
            className={cn(
              "w-28 font-mono",
              !draftValid && "border-destructive",
            )}
            placeholder="#000000"
            spellCheck={false}
          />
        )}
      </div>
    );
  },
);
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
