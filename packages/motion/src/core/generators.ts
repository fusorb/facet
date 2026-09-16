/**
 * Core generators — pure math, zero DOM knowledge, zero CSS.
 *
 * Each generator returns a progress function `(elapsedMs) => number`
 * that the animate() loop feeds elapsed-milliseconds into. Tests run
 * in plain Node with no jsdom because these are pure functions.
 */

export type EasingFunction = (t: number) => number;

export interface TweenOpts {
  /** Starting value. */
  from: number;
  /** Ending value. */
  to: number;
  /** Duration in milliseconds. */
  duration: number;
  /**
   * Optional easing function `(progress: 0–1) => easedProgress`.
   * Defaults to linear `(t) => t`.
   */
  ease?: EasingFunction;
}

export interface SpringOpts {
  from: number;
  to: number;
  /** Spring stiffness (N/m). Higher = snappier. */
  stiffness: number;
  /** Damping coefficient. Higher = less bounce. */
  damping: number;
  /** Mass (kg). Defaults to 1. */
  mass?: number;
}

/**
 * Linear or eased interpolation generator.
 *
 * Produces a function that, given elapsed milliseconds, returns the
 * interpolated value between `from` and `to`.
 */
export function tween(opts: TweenOpts): (elapsedMs: number) => number {
  const { from, to, duration, ease = (t: number) => t } = opts;
  const delta = to - from;
  const clampedDuration = Math.max(1, duration);

  return (elapsedMs: number) => {
    const t = clamp01(elapsedMs / clampedDuration);
    return from + delta * ease(t);
  };
}

/**
 * Critically-damped / underdamped harmonic spring generator.
 *
 * Models a damped harmonic oscillator:  m·x'' + c·x' + k·x = 0  where
 * k = stiffness, c = damping, m = mass. The returned function gives the
 * position at `elapsedMs`, approaching `to` from `from`.
 */
export function spring(opts: SpringOpts): (elapsedMs: number) => number {
  const { from, to, stiffness, damping, mass = 1 } = opts;
  const delta = from - to; // displacement from equilibrium

  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  return (elapsedMs: number) => {
    const t = elapsedMs / 1000; // convert ms → seconds
    let envelope: number;

    if (zeta < 1) {
      // underdamped — bouncy, oscillates around the target
      const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
      envelope =
        Math.exp(-zeta * omega0 * t) *
        (Math.cos(omegaD * t) +
          (zeta * omega0 / omegaD) * Math.sin(omegaD * t));
    } else if (Math.abs(zeta - 1) < 1e-6) {
      // critically damped — fastest return without oscillation
      envelope = (1 + omega0 * t) * Math.exp(-omega0 * t);
    } else {
      // overdamped — slow exponential return, no oscillation
      const sqrtTerm = omega0 * Math.sqrt(zeta * zeta - 1);
      const r1 = -zeta * omega0 + sqrtTerm;
      const r2 = -zeta * omega0 - sqrtTerm;
      envelope =
        (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
    }

    return to + delta * envelope;
  };
}

/** Clamp a number to the [0, 1] range. */
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
