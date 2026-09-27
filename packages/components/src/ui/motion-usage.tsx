/**
 * Shared overlay open-state context.
 *
 * Each overlay Root (Dialog, DropdownMenu, Popover, Select, ...) wraps its
 * Radix primitive in an <OverlayProvider> so that the Content side can read the
 * current open state and drive <Presence> + <Motion> exit animations.
 */
"use client";

import { createContext, useContext } from "react";

export interface OverlayOpenContextValue {
  open: boolean;
}

export const OverlayContext = createContext<OverlayOpenContextValue | null>(
  null,
);

/**
 * Read the open state of the nearest overlay Root.
 * Returns `false` when used outside any overlay (safe fallback).
 */
export function useOverlayOpen(): boolean {
  const ctx = useContext(OverlayContext);
  return ctx?.open ?? false;
}
