/**
 * @fusorb/facet-components: Theme system
 *
 * Light / dark / system theming with localStorage persistence and
 * per-brand CSS-variable overrides.
 *
 * Usage:
 *   import { ThemeProvider, ThemeToggle, useTheme } from "@fusorb/facet-components";
 *
 *   <ThemeProvider defaultTheme="dark">
 *     <ThemeToggle />
 *   </ThemeProvider>
 */

export { ThemeProvider, useTheme } from "./theme-provider.js";
export type { Theme, ThemeProviderProps } from "./theme-provider.js";

export { ThemeToggle } from "./theme-toggle.js";
export type { ThemeToggleProps } from "./theme-toggle.js";
