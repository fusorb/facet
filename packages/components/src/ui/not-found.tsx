/**
 * @fusorb/facet-components: Not Found (404)
 *
 * A fully composable, customizable not-found page. The giant "404" can
 * use a gradient text fill, a shimmer sweep, or an Aurora background, or
 * you can pass `children` to render something entirely custom.
 *
 * Usage:
 *   <NotFound
 *     title="Page not found"
 *     description="The page you're looking for doesn't exist or has been moved."
 *     actionLabel="Go back home"
 *     actionHref="/"
 *     animation="gradient"
 *   />
 */

import * as React from "react";

import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";
import { Aurora } from "./animated.js";
import { GradientText } from "./text-animations.js";
import { ShimmerText } from "./text-animations.js";

export type NotFoundAnimation = "gradient" | "shimmer" | "aurora" | "none";

export interface NotFoundProps {
  /** Heading shown below the 404 number. Omit to hide. */
  title?: string;
  /** Description text shown below the heading. Omit to hide. */
  description?: string;
  /** Label for the back-home call-to-action. Omit to hide the button. */
  actionLabel?: string;
  /** Destination URL for the CTA link. */
  actionHref?: string;
  /** Animation for the 404 number. */
  animation?: NotFoundAnimation;
  /** Custom icon element for the CTA. Defaults to an arrow-left icon. */
  actionIcon?: React.ReactNode;
  /** Override the entire content block. When provided, title/description/action are ignored. */
  children?: React.ReactNode;
  /** Extra classes for the inner content wrapper. */
  className?: string;
  /** Extra classes for the outer container. */
  containerClassName?: string;
}

function render404(animation: NotFoundAnimation) {
  switch (animation) {
    case "gradient":
      return (
        <GradientText
          text="404"
          className="font-heading text-8xl font-extrabold md:text-9xl"
        />
      );
    case "shimmer":
      return (
        <ShimmerText
          text="404"
          className="font-heading text-8xl font-extrabold text-foreground md:text-9xl"
        />
      );
    default:
      return (
        <span className="font-heading text-8xl font-extrabold text-foreground md:text-9xl">
          404
        </span>
      );
  }
}

export function NotFound({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  actionLabel = "Go back home",
  actionHref = "/",
  animation = "gradient",
  actionIcon,
  children,
  className,
  containerClassName,
}: NotFoundProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[32rem] w-full flex-col items-center justify-center overflow-hidden text-center",
        containerClassName,
      )}
    >
      {animation === "aurora" && <Aurora />}

      <div
        className={cn(
          "relative z-10 flex w-full flex-col items-center justify-center gap-2 px-4",
          className,
        )}
      >
        {children ?? (
          <>
            <div className="relative">{render404(animation)}</div>

            {title && (
              <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {title}
              </h1>
            )}

            {description && (
              <p className="max-w-md text-sm text-muted-foreground">
                {description}
              </p>
            )}

            {actionLabel && actionHref && (
              <a
                href={actionHref}
                className="mt-1.5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {actionIcon ?? (
                  <Icon name="arrow-left" className="size-4 shrink-0" />
                )}
                {actionLabel}
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
