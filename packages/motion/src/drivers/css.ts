/**
 * @fusorb/facet-motion — CSS driver
 *
 * The only driver in Phase 1. It:
 *  1. Detects `prefers-reduced-motion` at the driver boundary —
 *     a component author using the engine directly cannot bypass it.
 *  2. Subscribes to motion values and writes them to `element.style`
 *     (regular CSS properties and CSS custom properties alike).
 *  3. Exposes `resolveDuration` / `resolveEasing` (re-exported from
 *     ./resolve.ts) that convert registry token strings ("fast",
 *     "standard") into the numeric / function values the core loop needs.
 *
 * The ms / bezier values in ./resolve.ts mirror the
 * `--facet-motion-duration-*` / `--facet-motion-ease-*` CSS custom
 * properties in `@fusorb/facet-tokens` so JS-driven and CSS-driven
 * animations stay in sync.
 */

import { resolveDuration, resolveEasing } from "./resolve.js";
import type { MotionValue } from "../values/motion-value.js";
import type {
  DriverTarget,
  DriverBindings,
  DriverHandle,
  MotionDriver,
  Unsubscribe,
} from "./types.js";

/* ---------- prefers-reduced-motion ---------- */

/**
 * Detect whether the user has requested reduced motion.
 *
 * Checked at the driver boundary so it cannot be bypassed by
 * component authors using the engine directly.
 */
export function preferReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false; // SSR / non-browser: no explicit preference
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- cssDriver ---------- */

/**
 * The CSS driver.
 *
 * `apply()` subscribes a set of motion values to an element's `style`
 * and returns a cleanup handle. When `prefers-reduced-motion` is active,
 * it applies the *current* (terminal) values directly with no animation
 * and returns `{ active: false }`.
 */
export const cssDriver: MotionDriver & {
  resolveDuration: typeof resolveDuration;
  resolveEasing: typeof resolveEasing;
  preferReducedMotion: typeof preferReducedMotion;
} = {
  apply(target: DriverTarget, bindings: DriverBindings): DriverHandle {
    const reduced = preferReducedMotion();

    if (reduced) {
      for (const [prop, value] of Object.entries(bindings)) {
        const resolved =
          value && typeof value === "object" && "get" in value
            ? (value as MotionValue).get()
            : value;
        target.style.setProperty(prop, String(resolved));
      }
      return { cleanup: () => {}, active: false };
    }

    const unsubscribers: Unsubscribe[] = [];

    for (const [prop, value] of Object.entries(bindings)) {
      if (value && typeof value === "object" && "subscribe" in value) {
        const mv = value as MotionValue;
        target.style.setProperty(prop, String(mv.get()));
        const unsub = mv.subscribe((v: number) => {
          target.style.setProperty(prop, String(v));
        });
        unsubscribers.push(unsub);
      } else {
        target.style.setProperty(prop, String(value));
      }
    }

    return {
      cleanup: () => {
        unsubscribers.forEach((unsub) => unsub());
      },
      active: true,
    };
  },

  isSupported(): boolean {
    return typeof window !== "undefined" && typeof window.matchMedia === "function";
  },

  resolveDuration,
  resolveEasing,
  preferReducedMotion,
};
