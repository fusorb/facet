/**
 * @fusorb/facet-layout: shared viewport hook
 *
 * True when the viewport is at the desktop (lg = 1024px) breakpoint or wider.
 * Shared by ConsoleLayout and ChatLayout so the shell breakpoints can never
 * drift apart.
 */

import * as React from "react";

/** The Tailwind `lg` breakpoint, in px. */
export const DESKTOP_BREAKPOINT = 1024;

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
