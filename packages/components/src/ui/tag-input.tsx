/**
 * @fusorb/facet-components: TagInput
 *
 * A free-form tag/chip input. Hosts pass a string[] and the component
 * handles the input, splitting on Enter / comma / Tab, rendering chips
 * with remove buttons, and a Backspace-to-remove affordance.
 *
 * Why: keyword pickers, taxonomy editors, label composers, blog post
 * tag fields all need this. Distinct from `MultiCombobox` (which is
 * constrained to a fixed option list).
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface TagInputProps {
  /** Current tags. */
  value: string[];
  /** Called when the tag list changes. */
  onChange: (next: string[]) => void;
  /** Placeholder when no tags are entered. */
  placeholder?: string;
  /** Allowed separators (characters that commit a tag). Default: Enter, comma, Tab. */
  separators?: string[];
  /** Normalize a tag (e.g. lowercase). Default: trim only. */
  normalize?: (tag: string) => string;
  /** Max number of tags (0 = unlimited). */
  maxTags?: number;
  /** Max length of a single tag. */
  maxLength?: number;
  /** Optional suggested completions shown as a dropdown. */
  suggestions?: string[];
  /** Disable the field. */
  disabled?: boolean;
  /** Extra className for the trigger. */
  className?: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

const DEFAULT_SEPARATORS = ["Enter", ",", "Tab"];

/* ── Component ─────────────────────────────────────────────── */

/**
 * Free-form tag/chip input with separator support, optional autocomplete
 * suggestions, and keyboard affordances.
 *
 * @example
 *   const [tags, setTags] = useState<string[]>([]);
 *   <TagInput
 *     value={tags}
 *     onChange={setTags}
 *     placeholder="Add a tag…"
 *     suggestions={["react", "typescript", "nextjs"]}
 *   />
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Add a tag…",
  separators = DEFAULT_SEPARATORS,
  normalize = (t) => t.trim(),
  maxTags = 0,
  maxLength = 32,
  suggestions,
  disabled,
  className,
}: TagInputProps) {
  const [draft, setDraft] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const commitDraft = React.useCallback(() => {
    const text = normalize(draft);
    if (!text) return;
    if (maxTags > 0 && value.length >= maxTags) return;
    if (text.length > maxLength) return;
    if (value.includes(text)) {
      setDraft("");
      return;
    }
    onChange([...value, text]);
    setDraft("");
  }, [draft, normalize, maxTags, value, maxLength, onChange]);

  const removeTag = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  const filteredSuggestions = React.useMemo(() => {
    if (!suggestions) return [];
    const q = draft.toLowerCase();
    return suggestions
      .filter((s) => !value.includes(s))
      .filter((s) => (q ? s.toLowerCase().includes(q) : true))
      .slice(0, 5);
  }, [suggestions, draft, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      separators.includes(e.key) ||
      (e.key === "," && separators.includes(","))
    ) {
      e.preventDefault();
      commitDraft();
      return;
    }
    if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

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

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-ring/30",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-0.5 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
          >
            <Icon name="x" className="size-3" />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={disabled}
        maxLength={maxLength}
        className="flex-1 min-w-[8rem] bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
      />

      {open && filteredSuggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
          {filteredSuggestions.map((s) => (
            <li
              key={s}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-secondary"
              onClick={() => {
                if (maxTags > 0 && value.length >= maxTags) return;
                onChange([...value, s]);
                setDraft("");
                inputRef.current?.focus();
              }}
            >
              <Icon name="plus" className="size-3.5 text-muted-foreground" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

TagInput.displayName = "TagInput";
