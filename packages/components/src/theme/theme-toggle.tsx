/**
 * @fusorb/facet-components: ThemeToggle
 *
 * Single-button theme switcher: by default it inherits the system theme
 * (no explicit choice) and a click toggles between light and dark.
 * Requires a <ThemeProvider> ancestor. The icon reflects the currently
 * applied (resolved) theme.
 */

import * as React from "react";
import { LightIcon } from "../icon/light-icon.js";
import { cn } from "../utils.js";
import { useTheme } from "./theme-provider.js";
import { Button } from "../ui/button.js";

export interface ThemeToggleProps {
  className?: string;
  /** Accessible label for the trigger. Default: "Toggle theme" */
  label?: string;
}

export function ThemeToggle({
  className,
  label = "Toggle theme",
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  // SSR-safe: the resolved theme is unknown until the client mounts, so
  // render the icon only after mount to avoid a server/client mismatch.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {mounted ? (
        <span className="relative flex h-4 w-4 items-center justify-center">
          <LightIcon
            name="sun"
            size={16}
            className={cn(
              "absolute transition-all duration-300 ease-in-out",
              isDark
                ? "opacity-0 scale-50 rotate-90"
                : "opacity-100 scale-100 rotate-0",
            )}
          />
          <LightIcon
            name="moon"
            size={16}
            className={cn(
              "absolute transition-all duration-300 ease-in-out",
              isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 -rotate-90",
            )}
          />
        </span>
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
