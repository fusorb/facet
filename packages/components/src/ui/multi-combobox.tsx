/**
 * @fusorb/facet-components: MultiCombobox
 *
 * A multi-select chips combobox. Hosts pass an option list and a value
 * (string[]) and the component handles the search input, chip rendering,
 * keyboard nav (Up/Down/Enter, Backspace to remove last chip), and
 * accessibility. Distinct from `Combobox` (which is single-select).
 *
 * Why: tag pickers, recipient fields, permissions selectors, role
 * editors all need this.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface MultiComboboxOption {
  id: string;
  label: string;
  /** Optional description (rendered as muted text under the label). */
  description?: string;
  /** Optional lucide icon name. */
  icon?: React.ComponentProps<typeof Icon>["name"];
  /** Disable this option (cannot be selected). */
  disabled?: boolean;
}

export interface MultiComboboxProps {
  /** Options to pick from. */
  options: MultiComboboxOption[];
  /** Selected option ids. */
  value: string[];
  /** Called when the selection changes. */
  onChange: (next: string[]) => void;
  /** Placeholder when no chips are selected. */
  placeholder?: string;
  /** Show a search input (default: true). */
  searchable?: boolean;
  /** Disable the whole field. */
  disabled?: boolean;
  /** Maximum number of selections (0 = unlimited). */
  maxItems?: number;
  /** Wrap chips to multiple lines. Default: true. */
  wrap?: boolean;
  /** Optional className for the trigger. */
  className?: string;
  /** ARIA label for the search input. */
  ariaLabel?: string;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * A multi-select chips combobox with keyboard navigation and search.
 *
 * @example
 *   const [value, setValue] = useState<string[]>([]);
 *   <MultiCombobox
 *     options={[{ id: "eng", label: "Engineering" }, { id: "ops", label: "Ops" }]}
 *     value={value}
 *     onChange={setValue}
 *   />
 */
export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = "Pick options…",
  searchable = true,
  disabled,
  maxItems = 0,
  wrap = true,
  className,
  ariaLabel = "Multi-select combobox",
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selected = options.filter((o) => value.includes(o.id));

  const filtered = React.useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  }, [options, search]);

  // Reset active index when the filtered list changes.
  React.useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Close on outside click.
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addOption = (id: string) => {
    if (maxItems > 0 && value.length >= maxItems) return;
    if (value.includes(id)) return;
    onChange([...value, id]);
    setSearch("");
  };

  const removeOption = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !search && value.length > 0) {
      // Remove the last chip when the search is empty.
      onChange(value.slice(0, -1));
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target && !target.disabled) addOption(target.id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm transition focus-within:ring-2 focus-within:ring-ring/30",
        open && "ring-2 ring-ring/30",
        disabled && "cursor-not-allowed opacity-50",
        !wrap && "flex-nowrap overflow-x-auto",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {selected.map((opt) => (
        <span
          key={opt.id}
          className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-1.5 py-0.5 text-xs"
        >
          {opt.icon && <Icon name={opt.icon} className="size-3" />}
          <span className="truncate">{opt.label}</span>
          <button
            type="button"
            aria-label={`Remove ${opt.label}`}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              removeOption(opt.id);
            }}
          >
            <Icon name="x" className="size-3" />
          </button>
        </span>
      ))}

      {searchable && (
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ""}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-autocomplete="list"
          className="flex-1 min-w-[8rem] bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
        />
      )}

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {filtered.map((opt, i) => {
            const active = i === activeIndex;
            const picked = value.includes(opt.id);
            return (
              <li
                key={opt.id}
                role="option"
                aria-selected={picked}
                aria-disabled={opt.disabled}
                onClick={() => !opt.disabled && addOption(opt.id)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm",
                  active && "bg-secondary",
                  opt.disabled && "cursor-not-allowed opacity-50",
                  picked && "font-medium",
                )}
              >
                <span className="flex items-center gap-2">
                  {opt.icon && <Icon name={opt.icon} className="size-4 text-muted-foreground" />}
                  <span>
                    <span className="block">{opt.label}</span>
                    {opt.description && (
                      <span className="block text-xs text-muted-foreground">
                        {opt.description}
                      </span>
                    )}
                  </span>
                </span>
                {picked && <Icon name="check" className="size-4 text-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

MultiCombobox.displayName = "MultiCombobox";