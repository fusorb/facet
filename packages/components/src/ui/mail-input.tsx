/**
 * MailInput: an email input with a domain suggestion dropdown.
 *
 * When the user types @ (or starts typing after @), a dropdown of common
 * email provider domains appears. Clicking a domain auto-completes the
 * address. If the user types a custom domain that is not suggested, they
 * can simply continue typing the full address.
 *
 * Usage:
 *   import { MailInput } from "@fusorb/facet-components";
 *   <MailInput placeholder="you@example.com" required />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Input } from "./input.js";

/** Default domains shown in the suggestion dropdown. */
const DEFAULT_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "edu",
];

export interface MailInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Suggested domains shown when the user types @. Default: common providers. */
  domains?: string[];
  /** Show the domain suggestion dropdown. Default: true. */
  showSuggestions?: boolean;
}

export const MailInput = React.forwardRef<HTMLInputElement, MailInputProps>(
  (
    {
      className,
      domains = DEFAULT_DOMAINS,
      showSuggestions = true,
      onChange,
      onKeyDown,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [highlighted, setHighlighted] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listId = React.useId();

    // Resolve current value from DOM (works with controlled & RHF uncontrolled)
    const currentValue = (() => {
      if (typeof props.value === "string") return props.value;
      if (inputRef.current?.value !== undefined) return inputRef.current.value;
      if (typeof props.defaultValue === "string") return props.defaultValue;
      return "";
    })();

    const atIndex = currentValue.lastIndexOf("@");
    const afterAt = atIndex >= 0 ? currentValue.slice(atIndex + 1) : "";

    const showDropdown =
      showSuggestions && open && atIndex >= 0 && afterAt.length < 4;

    const filteredDomains = React.useMemo(() => {
      if (atIndex < 0) return [];
      const partial = afterAt.toLowerCase().trim();
      return domains.filter((d) => d.toLowerCase().startsWith(partial));
    }, [domains, atIndex, afterAt]);

    const completeDomain = React.useCallback(
      (domain: string) => {
        const input = inputRef.current;
        if (!input) return;
        const local = currentValue.slice(0, atIndex);
        const next = `${local}@${domain}`;

        // Set the native value and fire an input event so React / RHF
        // pickers register the change.
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        if (setter) {
          setter.call(input, next);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }

        setOpen(false);
        setHighlighted(0);
      },
      [currentValue, atIndex],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || filteredDomains.length === 0) {
        onKeyDown?.(e);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        onKeyDown?.(e);
        setHighlighted((h) => (h + 1) % filteredDomains.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onKeyDown?.(e);
        setHighlighted(
          (h) => (h - 1 + filteredDomains.length) % filteredDomains.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        onKeyDown?.(e);
        const domain = filteredDomains[highlighted];
        if (domain) completeDomain(domain);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onKeyDown?.(e);
        setOpen(false);
      } else {
        onKeyDown?.(e);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      const val = e.target.value;
      const at = val.lastIndexOf("@");
      const after = at >= 0 ? val.slice(at + 1) : "";
      if (showSuggestions && at >= 0 && after.length < 4) {
        setOpen(true);
        setHighlighted(0);
      } else {
        setOpen(false);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(e);
      // Re-evaluate dropdown state on focus
      if (showSuggestions && atIndex >= 0 && afterAt.length < 4) {
        setOpen(true);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Delay closing so users can click a suggestion
      setTimeout(() => {
        setOpen(false);
        setHighlighted(0);
        onBlur?.(e);
      }, 150);
    };

    return (
      <div className="relative">
        <Input
          type="email"
          inputMode="email"
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          aria-autocomplete="list"
          aria-expanded={showDropdown || undefined}
          aria-haspopup="listbox"
          aria-controls={showDropdown ? listId : undefined}
          className={cn(showDropdown && "rounded-b-none border-b-0", className)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {showDropdown && filteredDomains.length > 0 && (
          <ul
            id={listId}
            className="absolute top-full z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-b-md border border-border border-t-0 bg-popover text-sm shadow-lg"
            role="listbox"
          >
            {filteredDomains.map((d, i) => (
              <li
                key={d}
                role="option"
                aria-selected={i === highlighted}
                className={cn(
                  "cursor-pointer px-3 py-2 opacity-60 hover:opacity-100",
                  i === highlighted &&
                    "bg-accent text-accent-foreground opacity-100",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  completeDomain(d);
                }}
              >
                @{d}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
MailInput.displayName = "MailInput";
