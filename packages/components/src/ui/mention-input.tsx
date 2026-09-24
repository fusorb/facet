/**
 * @fusorb/facet-components: MentionInput
 *
 * A plain-text input with `@mention` autocomplete. Hosts pass a list of
 * available users (id, name, avatar) and a value string; the component
 * highlights `@mentions` and pops a suggestion list as the user types
 * after an `@` token.
 *
 * Why: every social / collaboration / comment UI needs mentions. Hand-
 * rolling one takes a couple of days to get right.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface MentionUser {
  id: string;
  name: string;
  /** Optional handle (rendered after the @ token). */
  handle?: string;
  /** Optional lucide icon name used as avatar fallback. */
  icon?: IconName;
  /** Optional avatar URL. */
  avatarUrl?: string;
  /** Disable this user (cannot be picked). */
  disabled?: boolean;
}

export interface MentionInputProps {
  /** Plain-text value (mentions are rendered as "@handle" in the value). */
  value: string;
  /** Called when the value changes. */
  onChange: (next: string) => void;
  /** Available users to mention. */
  users: MentionUser[];
  /** Disable the field. */
  disabled?: boolean;
  /** Placeholder. */
  placeholder?: string;
  /** Min query length after `@` to trigger suggestions. Default: 1. */
  triggerAt?: number;
  /** Render a custom user row. */
  renderUser?: (user: MentionUser, query: string) => React.ReactNode;
  /** Extra className for the wrapper. */
  className?: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

interface ActiveMention {
  start: number;
  end: number;
  query: string;
}

function findActiveMention(value: string, caret: number): ActiveMention | null {
  // Walk backwards from caret, find the last `@` not preceded by a word
  // character or another `@`. Stop at whitespace.
  let i = caret - 1;
  while (i >= 0) {
    const ch = value[i];
    if (ch === "@") {
      const before = i > 0 ? value[i - 1] : " ";
      if (before === " " || before === "\n" || before === "\t" || i === 0) {
        return { start: i, end: caret, query: value.slice(i + 1, caret) };
      }
      return null;
    }
    if (ch === " " || ch === "\n" || ch === "\t") return null;
    i--;
  }
  return null;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * Plain-text input with `@mention` autocomplete.
 */
export function MentionInput({
  value,
  onChange,
  users,
  disabled,
  placeholder = "Type a message. Use @ to mention someone.",
  triggerAt = 1,
  renderUser,
  className,
}: MentionInputProps) {
  const [activeMention, setActiveMention] =
    React.useState<ActiveMention | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!activeMention) return [];
    const q = activeMention.query.toLowerCase();
    if (q.length < triggerAt) return [];
    return users.filter((u) => {
      if (u.disabled) return false;
      const handle = (u.handle ?? u.name).toLowerCase();
      return handle.includes(q) || u.name.toLowerCase().includes(q);
    });
  }, [activeMention, users, triggerAt]);

  // Reset active index when the filter changes.
  React.useEffect(() => {
    setActiveIndex(0);
  }, [activeMention?.query]);

  // Close popover on outside click.
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActiveMention(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const caret = e.target.selectionStart ?? e.target.value.length;
    setActiveMention(findActiveMention(e.target.value, caret));
  };

  const handleKeyUp = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const caret = target.selectionStart ?? target.value.length;
    setActiveMention(findActiveMention(target.value, caret));
  };

  const insertMention = (user: MentionUser) => {
    if (!activeMention) return;
    const handle = user.handle ?? user.name;
    const next =
      value.slice(0, activeMention.start) +
      `@${handle} ` +
      value.slice(activeMention.end);
    onChange(next);
    setActiveMention(null);
    // Move caret past the inserted mention.
    requestAnimationFrame(() => {
      const pos = activeMention.start + handle.length + 2;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeMention || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) insertMention(target);
    } else if (e.key === "Escape") {
      setActiveMention(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full rounded-md border border-border bg-background",
        disabled && "opacity-60",
        className,
      )}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleKeyUp}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="block w-full resize-y bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
      />

      {activeMention && filtered.length > 0 && (
        <ul
          role="listbox"
          aria-label="Mentions"
          className="absolute left-2 right-2 bottom-full z-50 mb-1 max-h-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
        >
          {filtered.map((u, i) => (
            <li
              key={u.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => insertMention(u)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                i === activeIndex && "bg-secondary",
              )}
            >
              {renderUser ? (
                renderUser(u, activeMention.query)
              ) : (
                <>
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt=""
                      aria-hidden
                      className="size-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-6 place-items-center rounded-full bg-secondary text-xs">
                      <Icon name={u.icon ?? "user"} className="size-3" />
                    </span>
                  )}
                  <span className="font-medium">{u.name}</span>
                  {u.handle && (
                    <span className="text-muted-foreground">@{u.handle}</span>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

MentionInput.displayName = "MentionInput";
