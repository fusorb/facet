/**
 * CountryCodeInput: a phone number input with a leading country-code
 * selector (WhatsApp-style). Dial codes are bundled locally so the
 * component works offline; consumers can pass their own list.
 *
 * Usage:
 *   <CountryCodeInput
 *     value={{ code: "+234", number: "8012345678" }}
 *     onValueChange={setPhone}
 *   />
 *
 * Full ISO list + regional variants:
 *   <CountryCodeInput countries={ISO_COUNTRY_CODES} regions={["africa"]} />
 *   <CountryCodeInput countries={ISO_COUNTRY_CODES} excludeRegions={["europe"]} />
 */

import * as React from "react";
import { cn } from "../utils.js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSearch,
} from "./select.js";
import {
  ALL_COUNTRY_CODES,
  COUNTRY_REGION_LABELS,
  type CountryRegion,
} from "./country-codes-data.js";

export type { CountryRegion } from "./country-codes-data.js";
export { COUNTRY_REGION_LABELS } from "./country-codes-data.js";

/* ── Data ──────────────────────────────────────────────────── */

export interface CountryCode {
  /** ISO 3166-1 alpha-2 country code, e.g. "NG". */
  country: string;
  /** Dial code with leading "+", e.g. "+234". */
  code: string;
  /** Display label, e.g. "Nigeria (+234)". */
  label?: string;
  /** Display name when no label is given (full-list entries). */
  name?: string;
  /** World region for filtering/grouping (full-list entries). */
  region?: CountryRegion;
}

export const COMMON_COUNTRY_CODES: CountryCode[] = [
  { country: "US", code: "+1", label: "United States (+1)" },
  { country: "GB", code: "+44", label: "United Kingdom (+44)" },
  { country: "NG", code: "+234", label: "Nigeria (+234)" },
  { country: "GH", code: "+233", label: "Ghana (+233)" },
  { country: "KE", code: "+254", label: "Kenya (+254)" },
  { country: "ZA", code: "+27", label: "South Africa (+27)" },
  { country: "IN", code: "+91", label: "India (+91)" },
  { country: "CN", code: "+86", label: "China (+86)" },
  { country: "DE", code: "+49", label: "Germany (+49)" },
  { country: "FR", code: "+33", label: "France (+33)" },
  { country: "BR", code: "+55", label: "Brazil (+55)" },
  { country: "CA", code: "+1", label: "Canada (+1)" },
  { country: "AU", code: "+61", label: "Australia (+61)" },
  { country: "JP", code: "+81", label: "Japan (+81)" },
];

/** Full ISO 3166-1 dial-code list (name + code + region per entry). */
export const ISO_COUNTRY_CODES: CountryCode[] = ALL_COUNTRY_CODES;

/** Resolve the display code for a given country code (defaults to its entry). */
export function getCountryCode(
  country: string,
  list = COMMON_COUNTRY_CODES,
): string {
  return list.find((c) => c.country === country)?.code ?? "+1";
}

/** Resolve the display name for a given country code. */
export function getCountryName(
  country: string,
  list = COMMON_COUNTRY_CODES,
): string {
  const entry = list.find((c) => c.country === country);
  return entry?.label?.split(" (")[0] ?? entry?.name ?? country;
}

/**
 * Filter a country list by region. Entries without a `region` field are
 * kept unless `excludeRegions` removes them - so custom lists are
 * unaffected unless they carry region metadata.
 */
export function filterCountryCodes(
  list: CountryCode[],
  regions?: CountryRegion[],
  excludeRegions?: CountryRegion[],
): CountryCode[] {
  return list.filter((c) => {
    // Region filter: keep entries whose region is in the include list.
    // Entries WITHOUT a region (e.g. generic dial codes) are always kept.
    if (regions?.length && c.region && !regions.includes(c.region))
      return false;
    if (excludeRegions?.length && c.region && excludeRegions.includes(c.region))
      return false;
    return true;
  });
}

/* ── Props ─────────────────────────────────────────────────── */

export interface CountryCodeValue {
  /** Selected country code, e.g. "NG". */
  country: string;
  /** The phone number digits. */
  number: string;
}

export interface CountryCodeInputProps {
  /** Current value. */
  value?: CountryCodeValue;
  /** Called whenever the country or number changes. */
  onValueChange?: (value: CountryCodeValue) => void;
  /** Country-code list. Defaults to COMMON_COUNTRY_CODES. */
  countries?: CountryCode[];
  /** Restrict to these country codes (ISO alpha-2). Applied after `include`/`exclude`. */
  regions?: string[];
  /** World regions to keep (include filter). E.g. `["africa"]`. */
  includeRegions?: CountryRegion[];
  /** World regions to drop (exclude filter). E.g. `["europe"]`. */
  excludeRegions?: CountryRegion[];
  /** Only show these countries (ISO alpha-2). */
  include?: string[];
  /** Hide these countries (ISO alpha-2). */
  exclude?: string[];
  /** Placeholder for the number field. Default: "Phone number". */
  placeholder?: string;
  /** Label shown above the input. */
  label?: string;
  disabled?: boolean;
  className?: string;
  /** id/name forwarded to the number input. */
  id?: string;
  name?: string;
}

/* ── Component ─────────────────────────────────────────────── */

function applyRestrictions(
  countries: CountryCode[],
  regions?: string[],
  include?: string[],
  exclude?: string[],
): CountryCode[] {
  let list = countries;
  if (include?.length) list = list.filter((c) => include.includes(c.country));
  if (regions?.length) list = list.filter((c) => regions.includes(c.country));
  if (exclude?.length) list = list.filter((c) => !exclude.includes(c.country));
  return list;
}

export function CountryCodeInput({
  value,
  onValueChange,
  countries = COMMON_COUNTRY_CODES,
  regions,
  includeRegions,
  excludeRegions,
  include,
  exclude,
  placeholder = "Phone number",
  label,
  disabled = false,
  className,
  id,
  name,
}: CountryCodeInputProps) {
  const list = React.useMemo(() => {
    let next = applyRestrictions(countries, regions, include, exclude);
    next = filterCountryCodes(next, includeRegions, excludeRegions);
    return next;
  }, [countries, regions, include, exclude, includeRegions, excludeRegions]);

  const selected =
    value?.country && list.some((c) => c.country === value.country)
      ? value.country
      : (list[0]?.country ?? "");
  const dialCode = selected ? getCountryCode(selected, list) : "";

  // Group by region when the entries carry region metadata.
  const grouped = React.useMemo(() => {
    if (!list.some((c) => c.region)) return null;
    const map = new Map<CountryRegion, CountryCode[]>();
    for (const c of list) {
      if (!c.region) continue;
      const bucket = map.get(c.region) ?? [];
      bucket.push(c);
      map.set(c.region, bucket);
    }
    return [...map.entries()];
  }, [list]);

  const setCountry = (country: string) => {
    onValueChange?.({ country, number: value?.number ?? "" });
  };

  const setNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.({ country: selected, number: e.target.value });
  };

  // WhatsApp-style search: type the country name, ISO code, or dial code
  // to filter the list without scrolling the whole ISO set.
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const searchable = list.length > 12;
  const filtered = React.useMemo(() => {
    if (!q) return list;
    return list.filter((c) => {
      const name = (c.label ?? c.name ?? c.country).toLowerCase();
      return (
        name.includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.code.replace("+", "").startsWith(q.replace("+", ""))
      );
    });
  }, [list, q]);

  const renderItems = (entries: CountryCode[]) =>
    entries.map((c) => (
      <SelectItem key={`${c.country}-${c.code}`} value={c.country}>
        <CountryRow entry={c} />
      </SelectItem>
    ));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <Select value={selected} onValueChange={setCountry} disabled={disabled}>
          <SelectTrigger
            aria-label="Country code"
            className="h-9 w-[150px] shrink-0 text-sm"
          >
            <SelectValue>
              <span className="flex items-center gap-1.5">
                <span className="uppercase">{selected}</span>
                <span className="text-muted-foreground">{dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {searchable && (
              <SelectSearch
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code..."
              />
            )}
            {filtered.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No matches
              </div>
            ) : grouped && !q ? (
              grouped.map(([region, entries]) => (
                <SelectGroup key={region}>
                  <SelectLabel>{COUNTRY_REGION_LABELS[region]}</SelectLabel>
                  {renderItems(entries)}
                </SelectGroup>
              ))
            ) : (
              renderItems(filtered)
            )}
          </SelectContent>
        </Select>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          value={value?.number ?? ""}
          onChange={setNumber}
          placeholder={placeholder}
          disabled={disabled}
          className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}

function CountryRow({ entry }: { entry: CountryCode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="uppercase">{entry.country}</span>
      <span className="text-muted-foreground">{entry.code}</span>
      {entry.label ? (
        <span className="text-muted-foreground">{entry.label}</span>
      ) : (
        <span>{entry.name ?? entry.country}</span>
      )}
    </span>
  );
}
