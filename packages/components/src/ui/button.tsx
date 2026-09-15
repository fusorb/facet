import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass text-foreground hover:bg-accent/50",
        glow: "bg-primary text-primary-foreground glow-primary hover:bg-primary/90",
        /** Light sweeps across the button on hover (pure CSS). */
        shine:
          "group relative overflow-hidden bg-primary text-primary-foreground shadow hover:bg-primary/90",
        /** Click ink-burst at the pointer position (pointer handler). */
        ripple:
          "group relative overflow-hidden bg-primary text-primary-foreground shadow hover:bg-primary/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Magnetic: button gravitates toward the cursor (shine/ripple/glow). */
  magnetic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, magnetic = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? "span" : "button";
    const innerRef = React.useRef<HTMLButtonElement | null>(null);

    // Merge the internal ref (for magnetic / ripple effects) with the
    // consumer's ref so both always receive the DOM node.
    const setRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
            node;
        }
      },
      [ref],
    );

    // Magnetic: translate toward the cursor, spring back on leave.
    React.useEffect(() => {
      if (!magnetic) return;
      const el = innerRef.current;
      if (!el) return;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      };
      const onLeave = () => {
        el.style.transform = "translate(0, 0)";
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    }, [magnetic]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === "ripple" && !asChild) {
        const el = innerRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          const size = Math.max(r.width, r.height) * 2;
          const span = document.createElement("span");
          span.className =
            "pointer-events-none absolute rounded-full bg-white/30 animate-[facet-ripple_0.6s_ease-out]";
          span.style.width = span.style.height = `${size}px`;
          span.style.left = `${e.clientX - r.left - size / 2}px`;
          span.style.top = `${e.clientY - r.top - size / 2}px`;
          el.appendChild(span);
          setTimeout(() => span.remove(), 700);
        }
      }
      props.onClick?.(e);
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          variant === "shine" &&
            "after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:transition-transform after:duration-700 hover:after:translate-x-full",
          magnetic && "transition-transform duration-200 will-change-transform",
        )}
        ref={setRef}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
