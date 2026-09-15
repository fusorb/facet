/**
 * LocationPicker: cascading Country → State/Region → LGA/Locality
 * selects. Ships with a bundled static dataset (no network), and
 * supports async `loadRegions`/`loadLocalities` for real APIs.
 *
 * Usage:
 *   <LocationPicker
 *     value={location}
 *     onValueChange={setLocation}
 *     showLocality
 *   />
 *
 * Standalone levels:
 *   <CountryInput value={c} onValueChange={setC} />
 *   <StateInput country="NG" value={s} onValueChange={setS} />
 *   <LGAInput country="NG" region="lagos" value={l} onValueChange={setL} />
 */

import * as React from "react";
import { cn } from "../utils.js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSearch,
} from "./select.js";

/* ── Data ──────────────────────────────────────────────────── */

import {
  DEFAULT_COUNTRIES,
  DEFAULT_REGIONS,
  DEFAULT_LOCALITIES,
  getRegionLabel,
  getLocalityLabel,
  type Country,
  type Region,
  type Locality,
} from "./location-data.js";

export {
  DEFAULT_COUNTRIES,
  DEFAULT_REGIONS,
  DEFAULT_LOCALITIES,
  getRegionLabel,
  getLocalityLabel,
};
export type { Country, Region, Locality };

/* ── Searchable select helper ──────────────────────────────── */

interface SearchableSelectProps {
  value: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  triggerClassName?: string;
  placeholder?: string;
  /** Accessible name for the trigger (e.g. "Country"). */
  ariaLabel?: string;
  /** Items rendered inside the content (SelectItem nodes). */
  children: React.ReactNode;
  /** When true, render a search box that filters SelectItems by text. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Extra node rendered at the top of the content (e.g. a tag). */
  prefix?: React.ReactNode;
}

/**
 * A Select with an optional search box. When `searchable` is set, an input
 * filters the SelectItem children by their text content so users can type
 * to find long lists (countries, states, LGAs) instead of scrolling.
 */
function SearchableSelect({
  value,
  onValueChange,
  disabled,
  triggerClassName,
  placeholder,
  ariaLabel,
  children,
  searchable = false,
  searchPlaceholder = "Search...",
  prefix,
}: SearchableSelectProps) {
  const [query, setQuery] = React.useState("");

  // Reset the filter each time the select opens.
  React.useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  const q = query.trim().toLowerCase();
  const filtered = React.Children.toArray(children).filter((child) => {
    if (!q) return true;
    if (!React.isValidElement(child)) return true;
    const props = child.props as { children?: React.ReactNode };
    const text = String(props.children ?? "");
    return text.toLowerCase().includes(q);
  });

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel ?? placeholder}
        className={cn("h-9 w-full text-sm", triggerClassName)}
      >
        {prefix ? (
          <span className="inline-flex items-center gap-1.5 truncate">
            {prefix}
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {searchable && (
          <SelectSearch
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
          />
        )}
        {filtered.length > 0 ? (
          filtered
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No matches
          </div>
        )}
      </SelectContent>
    </Select>
  );
}

export interface LocationValue {
  country?: string;
  region?: string;
  locality?: string;
}

export interface LocationPickerProps {
  value?: LocationValue;
  onValueChange?: (value: LocationValue) => void;
  /** Countries to offer. Defaults to DEFAULT_COUNTRIES. */
  countries?: Country[];
  /** Sync region data (used when loadRegions is not provided). */
  regions?: Record<string, Region[]>;
  /** Async region loader (e.g. a geolocation API). */
  loadRegions?: (country: string) => Promise<Region[]>;
  /** Async locality loader. */
  loadLocalities?: (country: string, region: string) => Promise<Locality[]>;
  /** Show the locality/LGA select. Default: false. */
  showLocality?: boolean;
  /** Placeholder text for each level. */
  placeholders?: { country?: string; region?: string; locality?: string };
  disabled?: boolean;
  className?: string;
}

/* ── Standalone level inputs ───────────────────────────────── */

interface CountryInputProps {
  value?: string;
  onValueChange?: (country: string) => void;
  countries?: Country[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show a search box to filter the country list. Default: true */
  searchable?: boolean;
}

/** A single country select. */
export function CountryInput({
  value,
  onValueChange,
  countries = DEFAULT_COUNTRIES,
  placeholder = "Select country",
  disabled = false,
  className,
  searchable = true,
}: CountryInputProps) {
  return (
    <SearchableSelect
      value={value ?? ""}
      onValueChange={onValueChange}
      disabled={disabled}
      placeholder={placeholder}
      ariaLabel="Country"
      triggerClassName={className}
      searchable={searchable}
      searchPlaceholder="Search countries..."
    >
      {countries.map((c) => (
        <SelectItem key={c.code} value={c.code}>
          {c.name}
        </SelectItem>
      ))}
    </SearchableSelect>
  );
}

interface StateInputProps {
  value?: string;
  onValueChange?: (region: string) => void;
  /** Country whose states/regions to list. */
  country?: string;
  regions?: Record<string, Region[]>;
  /** Country list used to resolve the country tag on the trigger. */
  countries?: Country[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show a search box to filter the region list. Default: true */
  searchable?: boolean;
}

/** A single state/region select for a given country. */
export function StateInput({
  value,
  onValueChange,
  country,
  regions = DEFAULT_REGIONS,
  countries = DEFAULT_COUNTRIES,
  placeholder,
  disabled = false,
  className,
  searchable = true,
}: StateInputProps) {
  const list = country ? regions[country] : undefined;
  const countryName = country
    ? countries.find((c) => c.code === country)?.name
    : undefined;
  // Dynamic label: "state" for NG/US, "county" for KE, "province" for
  // ZA/CA/RW, "governorate" for EG, "emirate" for AE, etc.
  const regionTerm = getRegionLabel(country);
  const resolvedPlaceholder =
    placeholder ??
    (list?.length ? `Select ${regionTerm}` : "Select a country first");

  return (
    <SearchableSelect
      value={value ?? ""}
      onValueChange={onValueChange}
      disabled={disabled || !country}
      placeholder={resolvedPlaceholder}
      ariaLabel="Region"
      triggerClassName={className}
      searchable={searchable}
      searchPlaceholder={`Search ${regionTerm}s...`}
      prefix={
        countryName ? (
          <>
            <span className="rounded-sm border border-border bg-muted/40 px-1.5 py-px text-[11px] font-medium uppercase text-muted-foreground">
              {country}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {countryName}
            </span>
            <SelectValue
              placeholder={
                list?.length
                  ? resolvedPlaceholder
                  : `No ${regionTerm}s available`
              }
            />
          </>
        ) : undefined
      }
    >
      {list?.length ? (
        list.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.name}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="__none" disabled>
          {country ? `No ${regionTerm}s available` : "Select a country first"}
        </SelectItem>
      )}
    </SearchableSelect>
  );
}

interface LGAInputProps {
  value?: string;
  onValueChange?: (locality: string) => void;
  /** Country whose localities to list. */
  country?: string;
  /** State/region whose localities to list. */
  region?: string;
  localities?: Record<string, Record<string, Locality[]>>;
  /** Country list used to resolve the country tag on the trigger. */
  countries?: Country[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show a search box to filter the locality list. Default: true */
  searchable?: boolean;
}

/** A single locality/LGA select for a given country + state. */
export function LGAInput({
  value,
  onValueChange,
  country,
  region,
  localities = DEFAULT_LOCALITIES,
  countries = DEFAULT_COUNTRIES,
  placeholder,
  disabled = false,
  className,
  searchable = true,
}: LGAInputProps) {
  const list = country && region ? localities[country]?.[region] : undefined;
  const countryName = country
    ? countries.find((c) => c.code === country)?.name
    : undefined;
  // Dynamic label: "LGA" for NG, "county" for US, "district" for GB/GH.
  const localityTerm = getLocalityLabel(country);
  const resolvedPlaceholder =
    placeholder ??
    (list?.length ? `Select ${localityTerm}` : "Select a state first");

  return (
    <SearchableSelect
      value={value ?? ""}
      onValueChange={onValueChange}
      disabled={disabled || !list}
      placeholder={resolvedPlaceholder}
      ariaLabel="Locality"
      triggerClassName={className}
      searchable={searchable}
      searchPlaceholder={`Search ${localityTerm}s...`}
      prefix={
        countryName ? (
          <>
            <span className="rounded-sm border border-border bg-muted/40 px-1.5 py-px text-[11px] font-medium uppercase text-muted-foreground">
              {country}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {countryName}
            </span>
            <SelectValue
              placeholder={
                list?.length
                  ? resolvedPlaceholder
                  : `No ${localityTerm}s available`
              }
            />
          </>
        ) : undefined
      }
    >
      {list?.length ? (
        list.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            {l.name}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="__none" disabled>
          {country && region
            ? `No ${localityTerm}s available`
            : "Select a state first"}
        </SelectItem>
      )}
    </SearchableSelect>
  );
}

/* ── Component ─────────────────────────────────────────────── */

export function LocationPicker({
  value,
  onValueChange,
  countries = DEFAULT_COUNTRIES,
  regions: staticRegions = DEFAULT_REGIONS,
  loadRegions,
  loadLocalities,
  showLocality = false,
  placeholders = {},
  disabled = false,
  className,
}: LocationPickerProps) {
  const [asyncRegions, setAsyncRegions] = React.useState<Region[] | null>(null);
  const [asyncLocalities, setAsyncLocalities] = React.useState<
    Locality[] | null
  >(null);
  const [loadingRegions, setLoadingRegions] = React.useState(false);
  const [loadingLocalities, setLoadingLocalities] = React.useState(false);

  const setValue = (patch: Partial<LocationValue>) => {
    onValueChange?.({ ...value, ...patch });
  };

  // When the country changes, reset the dependent levels.
  const handleCountry = (country: string) => {
    setValue({ country, region: undefined, locality: undefined });
    setAsyncRegions(null);
    setAsyncLocalities(null);
    if (loadRegions) {
      setLoadingRegions(true);
      loadRegions(country)
        .then(setAsyncRegions)
        .finally(() => setLoadingRegions(false));
    }
  };

  const handleRegion = (region: string) => {
    setValue({ ...value, region, locality: undefined });
    setAsyncLocalities(null);
    if (showLocality && loadLocalities && value?.country) {
      setLoadingLocalities(true);
      loadLocalities(value.country, region)
        .then(setAsyncLocalities)
        .finally(() => setLoadingLocalities(false));
    }
  };

  const regionList: Region[] | null = loadRegions
    ? asyncRegions
    : ((value?.country ? staticRegions[value.country] : null) ?? null);

  const localityList: Locality[] | null = loadLocalities
    ? asyncLocalities
    : ((value?.country && value.region
        ? DEFAULT_LOCALITIES[value.country]?.[value.region]
        : null) ?? null);

  const regionTerm = getRegionLabel(value?.country);
  const localityTerm = getLocalityLabel(value?.country);

  return (
    <div className={cn("space-y-2", className)}>
      <SearchableSelect
        value={value?.country ?? ""}
        onValueChange={handleCountry}
        disabled={disabled}
        placeholder={placeholders.country ?? "Select country"}
        ariaLabel="Country"
        searchable
        searchPlaceholder="Search countries..."
      >
        {countries.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.name}
          </SelectItem>
        ))}
      </SearchableSelect>

      {value?.country && (
        <SearchableSelect
          value={value?.region ?? ""}
          onValueChange={handleRegion}
          disabled={disabled || loadingRegions}
          placeholder={placeholders.region ?? `Select ${regionTerm}`}
          ariaLabel="Region"
          searchable
          searchPlaceholder={`Search ${regionTerm}s...`}
          prefix={
            <>
              <span className="rounded-sm border border-border bg-muted/40 px-1.5 py-px text-[11px] font-medium uppercase text-muted-foreground">
                {value.country}
              </span>
              <SelectValue
                placeholder={
                  regionList?.length
                    ? (placeholders.region ?? `Select ${regionTerm}`)
                    : `No ${regionTerm}s available`
                }
              />
            </>
          }
        >
          {regionList?.length ? (
            regionList.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__none" disabled>
              {loadingRegions ? "Loading..." : `No ${regionTerm}s available`}
            </SelectItem>
          )}
        </SearchableSelect>
      )}

      {showLocality && value?.region && (
        <SearchableSelect
          value={value?.locality ?? ""}
          onValueChange={(locality) => setValue({ ...value, locality })}
          disabled={disabled || loadingLocalities}
          placeholder={placeholders.locality ?? `Select ${localityTerm}`}
          ariaLabel="Locality"
          searchable
          searchPlaceholder={`Search ${localityTerm}s...`}
          prefix={
            <>
              <span className="rounded-sm border border-border bg-muted/40 px-1.5 py-px text-[11px] font-medium uppercase text-muted-foreground">
                {value.country}
              </span>
              <SelectValue
                placeholder={
                  localityList?.length
                    ? (placeholders.locality ?? `Select ${localityTerm}`)
                    : `No ${localityTerm}s available`
                }
              />
            </>
          }
        >
          {localityList?.length ? (
            localityList.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__none" disabled>
              {loadingLocalities
                ? "Loading..."
                : `No ${localityTerm}s available`}
            </SelectItem>
          )}
        </SearchableSelect>
      )}
    </div>
  );
}
