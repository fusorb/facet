import * as React from "react";
import { cn } from "../utils.js";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar.js";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of avatar configs: image src + fallback text. */
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback: string;
  }>;
  /** Max avatars to render before collapsing into a +N overflow. */
  max?: number;
  /** Size of each avatar in px (passed to Avatar's className). */
  size?: "sm" | "default" | "lg";
  /** Disable the hover lift/ring effect. Default: false */
  disableHover?: boolean;
}

const sizeClasses: Record<NonNullable<AvatarGroupProps["size"]>, string> = {
  sm: "size-6 text-[10px]",
  default: "size-8 text-xs",
  lg: "size-10 text-sm",
};

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      className,
      avatars,
      max = 4,
      size = "default",
      disableHover = false,
      ...props
    },
    ref,
  ) => {
    const shown = avatars.slice(0, max);
    const overflow = avatars.length - shown.length;
    const hoverClass = disableHover
      ? ""
      : "transition-transform duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-ring hover:z-10";

    return (
      <div
        ref={ref}
        className={cn("flex items-center -space-x-2", className)}
        {...props}
      >
        {shown.map((avatar, i) => (
          <Avatar
            key={`${avatar.src ?? avatar.fallback}-${i}`}
            className={cn(
              "ring-2 ring-background",
              sizeClasses[size],
              hoverClass,
            )}
          >
            {avatar.src ? (
              <AvatarImage
                src={avatar.src}
                alt={avatar.alt ?? avatar.fallback}
              />
            ) : null}
            <AvatarFallback>{avatar.fallback}</AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0 && (
          <Avatar
            className={cn(
              "ring-2 ring-background bg-muted",
              sizeClasses[size],
              hoverClass,
            )}
          >
            <AvatarFallback className="bg-muted text-muted-foreground">
              +{overflow}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
