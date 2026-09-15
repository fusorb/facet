/**
 * @fusorb/facet-components: PhoneInput
 *
 * A full phone-number input with a country-code dropdown and E.164
 * formatting. Distinct from `CountryCodeInput` (which is the bare
 * country-code selector).
 *
 * Why: every signup form needs this. Hand-rolling a country picker +
 * number formatter + flag icons takes a day.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  /** Dialing code (e.g. "+1", "+44"). */
  dial: string;
  /** Display name. */
  name: string;
  /** Flag emoji (e.g. "🇺🇸"). */
  flag: string;
  /** Length of the national number (excluding dial code). */
  length: number;
}

export interface PhoneInputProps {
  /** Full E.164 value (e.g. "+14155552671"). */
  value: string;
  /** Called with the new E.164 value on every change. */
  onChange: (next: string) => void;
  /** Country list. Default: small built-in set; bring your own for full coverage. */
  countries?: PhoneCountry[];
  /** Initial selected country code. Default: "US". */
  defaultCountryCode?: string;
  /** Placeholder for the national-number field. */
  placeholder?: string;
  /** Disable the field. */
  disabled?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
  /** ARIA label for the national-number input. */
  ariaLabel?: string;
}

/* ── Defaults ──────────────────────────────────────────────── */

const DEFAULT_COUNTRIES: PhoneCountry[] = [
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸", length: 10 },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧", length: 10 },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦", length: 10 },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪", length: 11 },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷", length: 9 },
  { code: "ES", dial: "+34", name: "Spain", flag: "🇪🇸", length: 9 },
  { code: "IT", dial: "+39", name: "Italy", flag: "🇮🇹", length: 10 },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "🇳🇱", length: 9 },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺", length: 9 },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵", length: 10 },
  { code: "KR", dial: "+82", name: "South Korea", flag: "🇰🇷", length: 10 },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳", length: 11 },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳", length: 10 },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷", length: 11 },
  { code: "MX", dial: "+52", name: "Mexico", flag: "🇲🇽", length: 10 },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬", length: 10 },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦", length: 9 },
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪", length: 9 },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪", length: 9 },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦", length: 9 },
];

/* ── Helpers ───────────────────────────────────────────────── */

function detectCountryFromValue(
  value: string,
  countries: PhoneCountry[],
): PhoneCountry | undefined {
  // Find the longest matching dial code.
  const sorted = [...countries].sort((a, b) => b.dial.length - a.dial.length);
  return sorted.find((c) => value.startsWith(c.dial));
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * Drop-in phone number input with country picker + E.164 formatting.
 *
 * @example
 *   const [phone, setPhone] = useState("");
 *   <PhoneInput value={phone} onChange={setPhone} />
 */
export function PhoneInput({
  value,
  onChange,
  countries = DEFAULT_COUNTRIES,
  defaultCountryCode = "US",
  placeholder = "555-555-5555",
  disabled,
  className,
  ariaLabel = "Phone number",
}: PhoneInputProps) {
  const [country, setCountry] = React.useState<PhoneCountry>(
    countries.find((c) => c.code === defaultCountryCode) ?? countries[0]!,
  );
  const [open, setOpen] = React.useState(false);
  const [national, setNational] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Derive state from controlled value.
  React.useEffect(() => {
    if (!value) {
      setNational("");
      return;
    }
    const matched = detectCountryFromValue(value, countries);
    if (matched) {
      setCountry(matched);
      setNational(value.slice(matched.dial.length));
    } else {
      setNational(value);
    }
  }, [value, countries]);

  // Close dropdown on outside click.
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCountryChange = (c: PhoneCountry) => {
    setCountry(c);
    setOpen(false);
    onChange(`${c.dial}${national}`);
  };

  const handleNationalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, country.length);
    setNational(next);
    onChange(`${country.dial}${next}`);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full items-center rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-ring/30",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-l-md border-r border-border bg-secondary/30 px-2 text-sm hover:bg-secondary/50"
      >
        <span aria-hidden>{country.flag}</span>
        <span className="font-medium tabular-nums">{country.dial}</span>
        <Icon name="chevron-down" className="size-3.5 text-muted-foreground" />
      </button>

      <input
        type="tel"
        value={national}
        onChange={handleNationalChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        className="h-9 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/60"
      />

      {open && (
        <ul
          role="listbox"
          aria-label="Country"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {countries.map((c) => (
            <li
              key={c.code}
              role="option"
              aria-selected={c.code === country.code}
              onClick={() => handleCountryChange(c)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-secondary",
                c.code === country.code && "bg-secondary",
              )}
            >
              <span aria-hidden>{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {c.dial}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

PhoneInput.displayName = "PhoneInput";
