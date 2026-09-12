/**
 * @fusorb/facet-components: ThemeProvider
 *
 * Light / dark / system theming driven by a data attribute on <html>.
 * Persists the choice to localStorage and follows the OS preference
 * when theme is "system". Consumers can override any design-token CSS
 * variable (e.g. --primary, --sub-brand-accent) per brand via overrideVars.
 *
 * Usage:
 *   <ThemeProvider defaultTheme="dark">
 *     <App />
 *   </ThemeProvider>
 */

import * as React from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial theme. Default: "system" */
  defaultTheme?: Theme;
  /** localStorage key. Default: "facet-theme" */
  storageKey?: string;
  /** Allow following the OS preference via "system". Default: true */
  enableSystem?: boolean;
  /** Attribute written on <html>. Default: "data-theme" */
  attribute?: string;
  /** Additional themes to accept (custom data-theme values). */
  themes?: readonly string[];
  /**
   * CSS custom-property overrides applied to <html>, e.g.
   *   { "--primary": "oklch(0.5 0.2 30)", "--sub-brand-accent": "...", }
   */
  overrideVars?: Record<string, string>;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Actual applied theme: "system" resolved to light/dark */
  resolvedTheme: "light" | "dark" | undefined;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "facet-theme";
const SYSTEM_QUERY = "(prefers-color-scheme: light)";

function applyTheme(
  theme: Theme,
  { attribute, enableSystem }: { attribute: string; enableSystem: boolean },
) {
  const root = document.documentElement;
  if (theme === "system" && enableSystem) {
    const systemLight = window.matchMedia(SYSTEM_QUERY).matches;
    root.setAttribute(attribute, systemLight ? "light" : "dark");
    root.style.colorScheme = systemLight ? "light" : "dark";
  } else if (theme === "system") {
    root.removeAttribute(attribute);
    root.style.colorScheme = "light dark";
  } else {
    root.setAttribute(attribute, theme);
    root.style.colorScheme = theme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
  enableSystem = true,
  attribute = "data-theme",
  themes,
  overrideVars,
}: ThemeProviderProps) {
  // Initialise from localStorage without a flash of the wrong theme.
  // Read synchronously in the state initializer (not an effect) so the
  // first client render already matches the shell's no-flash script.
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "light" || stored === "dark") return stored;
      if (stored != null && themes?.includes(stored)) return stored as Theme;
    } catch {
      // Storage unavailable (private mode): fall back to the default.
    }
    return defaultTheme;
  });

  React.useEffect(() => {
    applyTheme(theme, { attribute, enableSystem });
  }, [theme, attribute, enableSystem]);

  // Follow OS preference changes while in "system" mode.
  React.useEffect(() => {
    if (theme !== "system" || !enableSystem) return;
    const mql = window.matchMedia(SYSTEM_QUERY);
    const onChange = () => applyTheme(theme, { attribute, enableSystem });
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme, attribute, enableSystem]);

  // Consumer CSS-variable overrides live on <html> so every component inherits them.
  React.useEffect(() => {
    if (!overrideVars) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(overrideVars)) {
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(overrideVars)) {
        root.style.removeProperty(key);
      }
    };
  }, [overrideVars]);

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // Storage can be unavailable (private mode, SSR): non-fatal.
      }
    },
    [storageKey],
  );

  const resolvedTheme = React.useMemo<"light" | "dark" | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    if (theme !== "system") return theme;
    return window.matchMedia(SYSTEM_QUERY).matches ? "light" : "dark";
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme, toggleTheme }),
    [theme, setTheme, resolvedTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return context;
}
