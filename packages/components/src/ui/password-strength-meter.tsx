/**
 * @fusorb/facet-components: PasswordStrengthMeter
 *
 * A password strength meter with a segmented bar and a rules checklist.
 * Pairs naturally with PasswordInput. Fully customizable via props and
 * screen-reader friendly (aria-live on the score).
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

export type PasswordStrengthLevel =
  "empty" | "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The password to score. */
  value: string;
  /** Show a live rules checklist. Default: true. */
  showRules?: boolean;
  /** Color for each level (tailwind classes). */
  colors?: Partial<Record<PasswordStrengthLevel, string>>;
  /** Labels for each level. */
  labels?: Partial<Record<PasswordStrengthLevel, string>>;
}

/** Heuristic password scorer: length, case, digit, symbol, and length bonuses. */
export function scorePassword(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (value.length >= 16) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export function levelFromScore(score: number): PasswordStrengthLevel {
  if (score <= 0) return "empty";
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  if (score <= 4) return "good";
  return "strong";
}

const DEFAULT_COLORS: Record<PasswordStrengthLevel, string> = {
  empty: "bg-muted",
  weak: "bg-destructive",
  fair: "bg-warning",
  good: "bg-chart-4",
  strong: "bg-success",
};

const DEFAULT_LABELS: Record<PasswordStrengthLevel, string> = {
  empty: "",
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

/** The rules the checklist shows and evaluates. */
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  {
    label: "A mix of uppercase and lowercase",
    test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p),
  },
  { label: "At least one number", test: (p: string) => /\d/.test(p) },
  { label: "At least one symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

/**
 * A segmented strength bar (5 segments) plus an optional rules checklist.
 * The bar maps a heuristic score to weak / fair / good / strong, and the
 * checklist ticks each satisfied rule live as the user types.
 */
export function PasswordStrengthMeter({
  value,
  showRules = true,
  colors = {},
  labels = {},
  className,
  ...props
}: PasswordStrengthMeterProps) {
  const score = scorePassword(value);
  const level = levelFromScore(score);
  const filled = Math.max(1, Math.round((score / 6) * 5));

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < filled
                  ? (colors[level] ?? DEFAULT_COLORS[level])
                  : "bg-muted",
              )}
            />
          ))}
        </div>
        {level !== "empty" && (
          <span
            className="text-xs font-medium text-muted-foreground"
            aria-live="polite"
          >
            {labels[level] ?? DEFAULT_LABELS[level]}
          </span>
        )}
      </div>
      {showRules && value.length > 0 && (
        <ul className="space-y-1">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(value);
            return (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  ok ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                    ok ? "bg-success/15 text-success" : "bg-muted/60",
                  )}
                  aria-hidden="true"
                >
                  {ok ? <Icon name="check" className="size-3" /> : null}
                </span>
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

PasswordStrengthMeter.displayName = "PasswordStrengthMeter";
