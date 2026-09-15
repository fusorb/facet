/**
 * Pill: a theme-adaptable, fully-rounded pill with a leading dot, icon, or custom
 * indicator and a flexible label/content area. Renders as a span by default, a
 * button when selected or onClick is provided (tab use), or an anchor with href.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

export type PillVariant = "default" | "outline" | "filled" | "ghost" | "subtle";
export type PillColor =
  "default" | "primary" | "secondary" | "success" | "warning" | "destructive";
export type PillRadius = "full" | "rounded" | "md";
export type PillSize = "sm" | "md" | "lg";
export type PillIndicator = "dot" | "icon" | "none";

export const pillVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border border-border bg-background text-foreground",
        outline: "border border-border bg-transparent text-foreground",
        filled: "border-transparent bg-primary text-primary-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground",
        subtle: "border-border/30 bg-muted/40 text-muted-foreground",
      },
      radius: { full: "rounded-full", rounded: "rounded-lg", md: "rounded-md" },
      size: {
        sm: "h-5 px-2 text-xs",
        md: "h-6 px-3 text-xs",
        lg: "h-7 px-4 text-sm",
      },
    },
    defaultVariants: { variant: "default", radius: "full", size: "md" },
  },
);

interface PillTokens {
  dot: string;
  border: string;
  text: string;
  filled: string;
}

const pillColors: Record<PillColor, PillTokens> = {
  default: {
    dot: "bg-muted-foreground",
    border: "",
    text: "",
    filled: "bg-foreground text-background",
  },
  primary: {
    dot: "bg-primary",
    border: "border-primary/40",
    text: "text-primary",
    filled: "bg-primary text-primary-foreground",
  },
  secondary: {
    dot: "bg-secondary-foreground",
    border: "border-secondary/40",
    text: "text-secondary-foreground",
    filled: "bg-secondary text-secondary-foreground",
  },
  success: {
    dot: "bg-success",
    border: "border-success/30",
    text: "text-success",
    filled: "bg-success text-success-foreground",
  },
  warning: {
    dot: "bg-warning",
    border: "border-warning/30",
    text: "text-warning",
    filled: "bg-warning text-warning-foreground",
  },
  destructive: {
    dot: "bg-destructive",
    border: "border-destructive/30",
    text: "text-destructive",
    filled: "bg-destructive text-destructive-foreground",
  },
};

export interface PillProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof pillVariants> {
  /** Leading indicator: `dot` (default), `icon`, or `none`. */
  indicator?: PillIndicator;
  /** Icon node rendered when `indicator="icon"`. */
  icon?: React.ReactNode;
  /** Custom leading content (any shape) - overrides `indicator`. */
  leading?: React.ReactNode;
  /** Semantic accent color for the dot, border, and fill. */
  color?: PillColor;
  /** Render as an anchor (link). */
  href?: string;
  /** Selected state for tab toggles (visual only). Use PillTrigger for full tab semantics. */
  selected?: boolean;
  /** Show a trailing remove button. */
  removable?: boolean;
  /** Click handler for the remove button (rendered when removable is true). */
  onRemove?: () => void;
}

export const Pill = React.forwardRef<HTMLElement, PillProps>(
  (
    {
      className,
      children,
      indicator = "dot",
      icon,
      leading,
      color = "default",
      variant = "default",
      radius = "full",
      size = "md",
      href,
      selected,
      removable,
      onRemove,
      onClick,
      ...props
    },
    ref,
  ) => {
    const t = pillColors[color ?? "default"];
    const isFilled = variant === "filled";
    const dotClass = isFilled ? "bg-white" : t.dot;
    const colorClass = isFilled ? t.filled : cn(t.border, t.text);
    const isTab = (props as { role?: string }).role === "tab";
    const isInteractive = !!(onClick || selected || href);

    const base = cn(
      pillVariants({ variant, radius, size }),
      colorClass,
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      selected && "ring-2 ring-ring ring-offset-2",
      className,
    );

    const renderIndicator = () => {
      if (leading) return <span className="shrink-0">{leading}</span>;
      if (indicator === "icon")
        return icon ? <span className="shrink-0">{icon}</span> : null;
      if (indicator === "dot") {
        return (
          <span
            className={cn("size-1.5 shrink-0 rounded-full", dotClass)}
            aria-hidden="true"
          />
        );
      }
      return null;
    };

    const content = (
      <>
        {renderIndicator()}
        <span className="shrink-0">{children}</span>
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label="Remove"
            className={cn(
              "shrink-0 rounded p-0.5 hover:bg-muted/50",
              isFilled ? "text-background" : "text-muted-foreground",
            )}
          >
            <Icon name="close" className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={base}
          {...props}
        >
          {content}
        </a>
      );
    }

    if (isInteractive) {
      return (
        <button
          type="button"
          ref={ref as React.Ref<HTMLButtonElement>}
          className={base}
          onClick={
            onClick as unknown as React.MouseEventHandler<HTMLButtonElement>
          }
          aria-pressed={selected && !isTab ? true : undefined}
          {...props}
        >
          {content}
        </button>
      );
    }

    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={base} {...props}>
        {content}
      </span>
    );
  },
);
Pill.displayName = "Pill";

/* ── PillGroup / PillTrigger (tabs) ────────────────────────────── */

const PillGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
} | null>(null);

export interface PillGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const PillGroup = React.forwardRef<HTMLDivElement, PillGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => (
    <PillGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          "inline-flex items-center gap-1 rounded-full border bg-muted p-1 text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </PillGroupContext.Provider>
  ),
);
PillGroup.displayName = "PillGroup";

export interface PillTriggerProps extends PillProps {
  value: string;
}

export const PillTrigger = React.forwardRef<HTMLElement, PillTriggerProps>(
  ({ value, onClick, className, ...props }, ref) => {
    const ctx = React.useContext(PillGroupContext);
    if (!ctx) {
      throw new Error("<PillTrigger> must be used inside <PillGroup>.");
    }
    const selected = ctx.value === value;

    const handleSelect = (e: React.MouseEvent<HTMLElement>) => {
      ctx.onValueChange?.(value);
      onClick?.(e);
    };

    const handleKeydown = (e: React.KeyboardEvent<HTMLElement>) => {
      const list = e.currentTarget.closest('[role="tablist"]');
      if (!list) return;
      const tabs = Array.from(
        list.querySelectorAll<HTMLElement>('[role="tab"]'),
      );
      const i = tabs.indexOf(e.currentTarget);
      if (i === -1) return;
      const move = (n: number) => {
        e.preventDefault();
        tabs[(i + n + tabs.length) % tabs.length]?.focus();
      };
      if (e.key === "ArrowRight" || e.key === "ArrowDown") move(1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") move(-1);
      else if (e.key === "Home") {
        e.preventDefault();
        tabs[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        tabs[tabs.length - 1]?.focus();
      }
    };

    return (
      <Pill
        {...props}
        ref={ref as React.Ref<HTMLElement>}
        role="tab"
        aria-selected={selected}
        aria-label={props["aria-label"]}
        selected={selected}
        onClick={
          handleSelect as unknown as React.MouseEventHandler<HTMLElement>
        }
        onKeyDown={
          handleKeydown as unknown as React.KeyboardEventHandler<HTMLElement>
        }
        variant="ghost"
        radius="full"
        color={selected ? "primary" : "default"}
        className={cn(
          "border-transparent bg-transparent hover:bg-muted/60",
          selected ? "bg-primary/10 text-primary" : "text-muted-foreground",
          className,
        )}
      />
    );
  },
);
PillTrigger.displayName = "PillTrigger";
