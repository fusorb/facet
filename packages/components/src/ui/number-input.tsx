/**
 * NumberInput: a numeric input with spin buttons and min/max/step
 * clamping. Built on the facet Input styles.
 *
 * Usage:
 *   <NumberInput value={count} onValueChange={setCount} min={0} max={10} />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu.js";

/** A selectable currency for the NumberInput currency picker. */
export interface Currency {
  /** ISO 4217 code, e.g. "USD". */
  code: string;
  /** Display symbol, e.g. "$". */
  symbol: string;
  /** Human-readable name, e.g. "US Dollar". */
  name: string;
}

/** Built-in currency list for the NumberInput picker. */
export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  /** Numeric value (number, not string). */
  value?: number | null;
  /** Called with the clamped numeric value. */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Show a label above the input. */
  label?: string;
  /** Currency symbol rendered as a prefix, e.g. "$" or "₦". */
  currency?: string;
  /**
   * Render the currency as an interactive picker. The prefix becomes a
   * dropdown (hover/click to open) listing `currencyOptions` (defaults to
   * the built-in CURRENCIES list). `currency` is the initial/pinned symbol
   * and updates when the consumer picks a new one.
   */
  currencyPicker?: boolean;
  /** Currency list for the picker. Defaults to CURRENCIES. */
  currencyOptions?: Currency[];
  /** Called when a currency is picked from the picker. */
  onCurrencyChange?: (currency: Currency) => void;
  /** Forbid negative values; clamps typed negatives to the minimum. Default: false. */
  beyondZero?: boolean;
  /** Override the decrease button icon. Default: "minus". */
  decreaseIconName?: IconName;
  /** Override the increase button icon. Default: "plus". */
  increaseIconName?: IconName;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onValueChange,
      min = -Infinity,
      max = Infinity,
      step = 1,
      label,
      currency,
      currencyPicker = false,
      currencyOptions = CURRENCIES,
      onCurrencyChange,
      beyondZero = false,
      decreaseIconName = "minus",
      increaseIconName = "plus",
      className,
      ...props
    },
    ref,
  ) => {
    // beyondZero: floor negatives at the effective minimum (0 unless overridden).
    const effectiveMin = Math.max(min, beyondZero ? 0 : -Infinity);
    const display = value == null ? "" : String(value);

    // The active currency object: prefer a matching option, else fall back
    // to the plain symbol (kept as-is when no picker is enabled).
    const activeCurrency = React.useMemo(
      () => currencyOptions.find((c) => c.symbol === currency),
      [currencyOptions, currency],
    );

    // Dynamic left padding: the currency trigger grows with the symbol
    // ("$" fits pl-9, "KSh" / "C$" need more).
    const symbolLen = (activeCurrency?.symbol ?? currency ?? "").length;
    const padLeft = currency
      ? symbolLen >= 3
        ? "pl-16"
        : symbolLen >= 2
          ? "pl-12"
          : "pl-9"
      : "pr-16";

    const pickCurrency = (next: Currency) => {
      onCurrencyChange?.(next);
    };

    // Currency picker search.
    const [currencyQuery, setCurrencyQuery] = React.useState("");
    const filteredCurrencies = React.useMemo(() => {
      const q = currencyQuery.trim().toLowerCase();
      if (!q) return currencyOptions;
      return currencyOptions.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q),
      );
    }, [currencyOptions, currencyQuery]);

    const commit = (next: number | null) => {
      if (next == null) {
        onValueChange?.(null);
        return;
      }
      const rounded = Number.isInteger(step)
        ? Math.round(next / step) * step
        : next;
      onValueChange?.(clampNumber(rounded, effectiveMin, max));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        onValueChange?.(null);
        return;
      }
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        onValueChange?.(clampNumber(parsed, effectiveMin, max));
      }
    };

    const stepBy = (dir: 1 | -1) => {
      const base = value == null ? effectiveMin : value;
      commit(base + dir * step);
    };

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {currencyPicker ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={
                    activeCurrency
                      ? `Currency: ${activeCurrency.name}`
                      : "Select currency"
                  }
                  className="absolute left-1 top-1/2 z-10 flex h-7 -translate-y-1/2 items-center gap-0.5 rounded-md px-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
                >
                  {activeCurrency ? activeCurrency.symbol : (currency ?? "¤")}
                  <Icon
                    name="chevron-down"
                    className="size-3"
                    aria-hidden="true"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-72 w-56 overflow-hidden"
              >
                <DropdownMenuLabel>Currency</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="border-b border-border px-2 pb-2 pt-1">
                  <input
                    type="text"
                    value={currencyQuery}
                    onChange={(e) => setCurrencyQuery(e.target.value)}
                    placeholder="Search currency or code..."
                    className="h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-sm outline-none"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCurrencies.map((option) => (
                    <DropdownMenuItem
                      key={option.code}
                      onSelect={() => {
                        pickCurrency(option);
                        setCurrencyQuery("");
                      }}
                      className="flex items-center gap-2"
                    >
                      <span className="min-w-0 shrink-0 text-sm font-medium">
                        {option.symbol}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {option.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {option.code}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {filteredCurrencies.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No matches
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            currency && (
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {currency}
              </span>
            )
          )}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={display}
            onChange={handleChange}
            onBlur={(e) => {
              if (e.target.value !== "") {
                commit(Number(e.target.value));
              }
            }}
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${padLeft}`}
            {...props}
          />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Decrease value"
              disabled={
                props.disabled || (value != null && value <= effectiveMin)
              }
              onClick={() => stepBy(-1)}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon
                name={decreaseIconName}
                className="h-3 w-3"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Increase value"
              disabled={props.disabled || (value != null && value >= max)}
              onClick={() => stepBy(1)}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon
                name={increaseIconName}
                className="h-3 w-3"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";
