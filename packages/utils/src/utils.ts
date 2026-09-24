/**
 * Platform detection utilities
 */

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
