/**
 * Utility functions for component styling
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind support.
 * Combines clsx and tailwind-merge for conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

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
