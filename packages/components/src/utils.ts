/**
 * Utility functions for component styling
 */

/**
 * Merge class names with Tailwind support.
 * Re-exported from @fusorb/facet-motion (the canonical owner — motion sits
 * lower in the dependency DAG: components → motion → tokens, so motion owns
 * shared styling utilities and components re-exports to avoid a cycle).
 */
export { cn } from "@fusorb/facet-motion";

/**
 * True when running on macOS. Used to pick the correct modifier-key
 * symbol for shortcut hints (⌘ on macOS, Ctrl elsewhere).
 */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/i.test(
    navigator.platform || navigator.userAgent,
  );
}

/**
 * Modifier-key label for the current platform: "⌘" on macOS, "Ctrl" elsewhere.
 */
export function getModSymbol(): "⌘" | "Ctrl" {
  return isMac() ? "⌘" : "Ctrl";
}
