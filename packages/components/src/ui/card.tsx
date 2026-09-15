import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";

const cardVariants = cva("rounded-xl border shadow", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      glass: "glass-card text-card-foreground",
      frost: "frost text-card-foreground",
      glow: "bg-card text-card-foreground glow-primary",
      ghost: "border-transparent bg-transparent shadow-none",
      outline: "border bg-transparent text-card-foreground shadow-none",
      elevated: "bg-card text-card-foreground shadow-md",
      interactive:
        "bg-card text-card-foreground shadow transition-colors hover:bg-accent/50 cursor-pointer",
      /** 3D tilt that follows the cursor (pointer handler). */
      tilt: "bg-card text-card-foreground shadow transition-transform duration-200 will-change-transform",
      /** Animated gradient border (pure CSS, mask trick). Uses the
       * consumer's tokens: primary -> alpha-electric-cyan, so it follows
       * brand customization. */
      "gradient-border":
        "relative bg-card text-card-foreground shadow before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-primary before:via-primary/60 before:to-alpha-electric-cyan before:content-['']",
      /** Image cards: first child image zooms on hover. */
      zoom: "group bg-card text-card-foreground shadow overflow-hidden",
      /** 3D flip reveal: front (children) flips away on hover/click, back (CardFlipBack) shows. */
      flip: "bg-card text-card-foreground shadow",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/** Flip direction for the `flip` variant. Default: "horizontal" (rotateY). */
export type CardFlipDirection = "horizontal" | "vertical";

/** Back face for the `flip` variant. Put this AFTER the front content. */
export const CardFlipBack = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn(
      "absolute inset-0 flex items-center justify-center rounded-[inherit] bg-card p-6 text-card-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]",
      className,
    )}
    {...props}
  />
));
CardFlipBack.displayName = "CardFlipBack";

interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Flip direction for the `flip` variant. Default: "horizontal". */
  flipDirection?: CardFlipDirection;
  /** Allow click to toggle the flip (for touch / mobile). Default: true. */
  flipOnClick?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      flipDirection = "horizontal",
      flipOnClick = true,
      onMouseMove,
      onMouseLeave,
      onClick,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const [flipped, setFlipped] = React.useState(false);

    // 3D tilt: rotate toward the cursor.
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (variant !== "tilt") return;
      const el = innerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
      onMouseMove?.(e);
    };
    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (variant === "tilt" && innerRef.current) {
        innerRef.current.style.transform =
          "perspective(800px) rotateX(0) rotateY(0)";
      }
      // Flip: mouse out always returns to the front (transient reveal).
      if (variant === "flip") setFlipped(false);
      onMouseLeave?.(e);
    };
    const handleMouseEnter = () => {
      // Flip: hover reveals the back, mouse out returns.
      if (variant === "flip") setFlipped(true);
    };
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Flip: click toggles (covers touch / mobile where hover doesn't exist).
      if (variant === "flip" && flipOnClick) setFlipped((v) => !v);
      onClick?.(e);
    };

    const isFlip = variant === "flip";

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          cardVariants({ variant }),
          variant === "zoom" &&
            "[&_img]:transition-transform [&_img]:duration-500 [&_img]:hover:scale-105",
          isFlip && "relative [perspective:1000px]",
          className,
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        {...props}
      >
        {isFlip ? (
          <div
            className="relative h-full w-full [transform-style:preserve-3d] transition-transform duration-500"
            style={{
              transform: flipped
                ? flipDirection === "vertical"
                  ? "rotateX(180deg)"
                  : "rotateY(180deg)"
                : "rotateX(0deg)",
            }}
          >
            {/* Front face wrapper: hidden when the container rotates 180deg.
                CardFlipBack (absolute, backface-hidden) shows on the back. */}
            <div className="[backface-visibility:hidden]">{props.children}</div>
          </div>
        ) : (
          props.children
        )}
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  type CardProps,
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
