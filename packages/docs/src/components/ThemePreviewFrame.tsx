import * as React from "react";
import { cn, useTheme } from "@fusorb/facet-components/light";

export interface ThemePreviewFrameProps {
  children: React.ReactNode;
  /** Optional className for the outer container. */
  className?: string;
  /** Optional label shown in the corner. */
  label?: string;
}

/**
 * ThemePreviewFrame: preview surface that mirrors the global theme so
 * components preview correctly in both light and dark mode. The frame
 * applies `data-theme` from the app-level ThemeProvider, so the docs
 * theme toggle restyles every preview block with no per-frame toggle.
 */
export function ThemePreviewFrame({
  children,
  className,
  label,
}: ThemePreviewFrameProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme ?? "light";

  return (
    <div
      data-theme={theme}
      className={cn(
        "relative flex w-full items-start justify-start gap-4 overflow-visible bg-background p-6 text-foreground transition-colors",
        className,
      )}
      style={{ colorScheme: theme }}
    >
      {label && (
        <span className="absolute left-2 top-2 z-10 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
