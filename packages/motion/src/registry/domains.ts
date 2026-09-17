/**
 * @fusorb/facet-motion — domain presets.
 *
 * Per `.agent/facet-motion-registry-spec.md` §4, each product domain gets a
 * tailored motion profile that adjusts timing, distance, and allowed effects.
 *
 * Mirrors the auth preset structure (`packages/auth/src/presets.ts`) so the
 * same domain name ("fintech", "med", "edu", etc.) drives both auth behavior
 * and motion behavior.
 *
 * Usage:
 *   import { getDomainMotionConfig } from "@fusorb/facet-motion";
 *
 *   const cfg = getDomainMotionConfig("fintech");
 *   // cfg.defaultTransition, cfg.allowSpring, cfg.distanceScale, ...
 */

import { motionValues } from "@fusorb/facet-tokens";
import type { Easing, Intensity, MotionTransition } from "./types.js";

export interface DomainMotionConfig {
  /** Default transition merged with each effect's own default. */
  defaultTransition: MotionTransition;
  /** Whether spring-based effects (pop, zoom) are enabled in this domain. */
  allowSpring: boolean;
  /** Multiplier applied to translate/blur distances. 1.0 = neutral. */
  distanceScale: number;
  /** Whether reduced-motion is force-enabled regardless of system preference. */
  forceReducedMotion: boolean;
  /** Effect families recommended for this domain (subset of generativeFamilies). */
  preferredFamilies: string[];
  /** Maximum intensity tier permitted (caps "dramatic" etc. down). */
  maxIntensity: Intensity;
}

/* ── Fintech ────────────────────────────────────────────────
   Professional / conservative.
   Short durations, standard easing, minimal movement.
   No spring or bounce — too informal for financial data.
   ───────────────────────────────────────────────────────── */
export const fintechMotion: DomainMotionConfig = {
  defaultTransition: { duration: "fast", ease: "standard", type: "tween" },
  allowSpring: false,
  distanceScale: 0.75,
  forceReducedMotion: false,
  preferredFamilies: ["fade", "slide", "reveal", "panel"],
  maxIntensity: "medium",
};

/* ── Medical / Healthcare ─────────────────────────────────────
   Accessible / clear.
   Standard durations with smooth easing so transitions are
   easy to follow. Spring allowed for positive feedback
   (e.g. form validation). Full travel distance for clarity.
   ───────────────────────────────────────────────────────── */
export const medMotion: DomainMotionConfig = {
  defaultTransition: { duration: "base", ease: "smooth", type: "tween" },
  allowSpring: true,
  distanceScale: 1.0,
  forceReducedMotion: false,
  preferredFamilies: ["fade", "zoom", "panel", "lift"],
  maxIntensity: "strong",
};

/* ── Education ────────────────────────────────────────────────
   Engaging / friendly.
   Spring-based easing for a livelier feel. Increased travel
   distance and scale for visual interest. Full intensity range.
   ───────────────────────────────────────────────────────── */
export const eduMotion: DomainMotionConfig = {
  defaultTransition: { duration: "base", ease: "spring", type: "tween" },
  allowSpring: true,
  distanceScale: 1.2,
  forceReducedMotion: false,
  preferredFamilies: ["fade", "pop", "lift", "glow", "shimmer"],
  maxIntensity: "dramatic",
};

/* ── Enterprise ───────────────────────────────────────────────
   Balanced / professional.
   Standard easing, slightly reduced movement. No spring —
   enterprise apps value predictability.
   ───────────────────────────────────────────────────────── */
export const enterpriseMotion: DomainMotionConfig = {
  defaultTransition: { duration: "base", ease: "standard", type: "tween" },
  allowSpring: false,
  distanceScale: 0.9,
  forceReducedMotion: false,
  preferredFamilies: ["fade", "slide", "reveal", "panel"],
  maxIntensity: "strong",
};

/* ── Default / general-purpose ────────────────────────────────
   Balanced for any consumer that doesn't specify a domain.
   ───────────────────────────────────────────────────────── */
export const defaultMotion: DomainMotionConfig = {
  defaultTransition: { duration: "base", ease: "standard", type: "tween" },
  allowSpring: true,
  distanceScale: 1.0,
  forceReducedMotion: false,
  preferredFamilies: [],
  maxIntensity: "dramatic",
};

/**
 * Resolve an easing token to its cubic-bezier coordinates.
 *
 * Curves are sourced from `@fusorb/facet-tokens` `motionValues.facetEasing`
 * — the same table that `drivers/resolve.ts` derives `EASING_FUNCTIONS` from
 * — so the JS lookup never drifts from the `--facet-motion-ease-*` CSS
 * custom properties (parity is enforced by `scripts/audit-motion-parity.mjs`).
 */
const easingFor = (e: Easing): number[] => {
  const value =
    motionValues.facetEasing[e as keyof typeof motionValues.facetEasing];
  return value === "linear" ? [0, 0, 1, 1] : [...value];
};

/**
 * Resolve a domain name to its motion config, falling back to
 * `defaultMotion` for unknown domains.
 *
 *   getDomainMotionConfig("fintech")  // → fintechMotion
 *   getDomainMotionConfig("unknown")  // → defaultMotion
 */
export function getDomainMotionConfig(
  domain: string | undefined,
): DomainMotionConfig {
  switch (domain) {
    case "fintech":
      return fintechMotion;
    case "med":
      return medMotion;
    case "edu":
      return eduMotion;
    case "enterprise":
      return enterpriseMotion;
    default:
      return defaultMotion;
  }
}

export { easingFor };
