/**
 * @fusorb/facet-tokens: Motion tokens
 *
 * Runtime constants for motion durations, easings, travel distances,
 * and scales. Each value is a CSS custom-property reference so that the
 * actual timing/easing/distance values stay defined in tokens.css
 * (and are overridable per-theme).
 *
 * Usage:
 *   import { motion } from "@fusorb/facet-tokens";
 *
 *   // programmatic
 *   motion.duration["200"]          // → "var(--motion-duration-200)"
 *   motion.easing.spring             // → "var(--motion-ease-spring)"
 *   motion.distance.md               // → "var(--motion-distance-md)"
 *   motion.staggerDelay              // → "var(--motion-delay-stagger)"
 *
 *   // CSS class (Tailwind arbitrary value)
 *   className="duration-[var(--motion-duration-200)]"
 */

import type { MotionTokens } from "./types.js";

export const motion: MotionTokens = {
  duration: {
    "0": "var(--motion-duration-0)",
    "50": "var(--motion-duration-50)",
    "100": "var(--motion-duration-100)",
    "150": "var(--motion-duration-150)",
    "200": "var(--motion-duration-200)",
    "250": "var(--motion-duration-250)",
    "300": "var(--motion-duration-300)",
    "350": "var(--motion-duration-350)",
    "500": "var(--motion-duration-500)",
    "700": "var(--motion-duration-700)",
    "1000": "var(--motion-duration-1000)",
  },
  easing: {
    standard: "var(--motion-ease-standard)",
    "standard-decelerate": "var(--motion-ease-standard-decelerate)",
    "standard-accelerate": "var(--motion-ease-standard-accelerate)",
    emphasized: "var(--motion-ease-emphasized)",
    "emphasized-decelerate": "var(--motion-ease-emphasized-decelerate)",
    "emphasized-accelerate": "var(--motion-ease-emphasized-accelerate)",
    spring: "var(--motion-ease-spring)",
    bounce: "var(--motion-ease-bounce)",
  },
  distance: {
    sm: "var(--motion-distance-sm)",
    md: "var(--motion-distance-md)",
    lg: "var(--motion-distance-lg)",
    xl: "var(--motion-distance-xl)",
    "2xl": "var(--motion-distance-2xl)",
  },
  scale: {
    inactive: "var(--motion-scale-inactive)",
    pop: "var(--motion-scale-pop)",
  },
  blur: {
    inactive: "var(--motion-blur-inactive)",
  },
  staggerDelay: "var(--motion-delay-stagger)",
  facetDuration: {
    instant: "var(--facet-motion-duration-instant)",
    fast: "var(--facet-motion-duration-fast)",
    base: "var(--facet-motion-duration-base)",
    slow: "var(--facet-motion-duration-slow)",
    cinematic: "var(--facet-motion-duration-cinematic)",
  },
  facetEasing: {
    linear: "var(--facet-motion-ease-linear)",
    standard: "var(--facet-motion-ease-standard)",
    smooth: "var(--facet-motion-ease-smooth)",
    emphasized: "var(--facet-motion-ease-emphasized)",
    spring: "var(--facet-motion-ease-spring)",
    elastic: "var(--facet-motion-ease-elastic)",
  },
} as const satisfies MotionTokens;
