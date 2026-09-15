/**
 * AspectRatio: constrain children to a fixed width-to-height ratio,
 * preventing layout shift for media and embeds.
 */
import * as React from "react";
import { AspectRatio as AspectRatioPrimitive } from "@radix-ui/react-aspect-ratio";
import { cn } from "../utils.js";

/**
 * AspectRatio
 *
 * Box content to a controlled width-to-height ratio so embeds, images, or
 * cards never cause layout shift. Built on Radix's primitive so it works with
 * any child without extra configuration.
 *
 * @example
 * <AspectRatio ratio={16 / 9}>
 *   <iframe src="…" className="h-full w-full" />
 * </AspectRatio>
 */
export type AspectRatioProps = React.ComponentPropsWithoutRef<
  typeof AspectRatioPrimitive
>;

const AspectRatio = React.forwardRef<
  React.ComponentRef<typeof AspectRatioPrimitive>,
  AspectRatioProps
>(({ className, ...props }, ref) => (
  <AspectRatioPrimitive
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
));
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
