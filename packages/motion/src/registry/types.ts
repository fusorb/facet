/**
 * @fusorb/facet-motion - registry types
 *
 * Per the motion registry design (archived in `.agent/episodes.md` EP 36).
 * These types define the registry's public contract.
 */

export type Direction =
  | "in"
  | "out"
  | "up"
  | "down"
  | "left"
  | "right"
  | "x"
  | "y"
  | "tracking"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "clockwise"
  | "counterclockwise";

export type Intensity = "subtle" | "soft" | "medium" | "strong" | "dramatic";

export type Duration =
  "instant" | "fast" | "base" | "slow" | "cinematic" | number;

export type Easing =
  "linear" | "standard" | "smooth" | "emphasized" | "spring" | "elastic";

export type TransitionType = "tween" | "spring" | "inertia";

/** Alias matching the spec's `AnimationType` name. */
export type AnimationType = TransitionType;

export interface MotionTransition {
  type?: TransitionType;
  duration?: Duration;
  delay?: number;
  ease?: Easing;
  stiffness?: number;
  damping?: number;
  mass?: number;
  repeat?: number | "infinite";
}

export interface MotionVariant {
  direction?: Direction;
  intensity?: Intensity;
}

/** Keyframe milestone for multi-step authored effects (e.g. aurora's 3-step cycle). */
export interface MotionKeyframe {
  /** Position within the animation cycle (0–100). */
  percent: number;
  /** Style properties at this point. */
  style: Record<string, string | number>;
}

export interface ResolvedMotion {
  from: Record<string, string | number>;
  to: Record<string, string | number>;
  transition: Required<Pick<MotionTransition, "duration" | "ease">> &
    MotionTransition;
  /**
   * Optional intermediate keyframes for multi-step authored effects
   * (e.g. aurora, tilt). Excludes `from` (0%) and `to` (100%).
   */
  keyframes?: MotionKeyframe[];
}

export interface MotionEffectDefinition {
  id: string;
  family: string;
  kind: "generative" | "authored";
  directions?: Direction[];
  intensities?: Intensity[];
  defaultTransition: MotionTransition;
  /** Generative only - pure function, no DOM access. */
  resolve?: (
    variant: MotionVariant,
    transition: MotionTransition,
  ) => ResolvedMotion;
  /** Authored only - reference to a handwritten keyframe/motion-value program. */
  program?: string;
}

export interface MotionPreset {
  id: string;
  effect: string;
  variant?: MotionVariant;
  transition?: MotionTransition;
}

export interface MotionEffectRegistry {
  [id: string]: MotionEffectDefinition;
}

export const DEFAULT_INTENSITY: Intensity = "medium";
export const DEFAULT_EASING: Easing = "standard";
export const DEFAULT_DURATION: Duration = "base";

/**
 * Merge a user transition override with a family default.
 * The returned transition always has `duration` and `ease` filled in.
 */
export function resolveTransition(
  override: MotionTransition | undefined,
  defaultTransition: MotionTransition,
): Required<Pick<MotionTransition, "duration" | "ease">> & MotionTransition {
  const merged = { ...defaultTransition, ...override };
  return {
    type: merged.type,
    duration: merged.duration ?? DEFAULT_DURATION,
    delay: merged.delay,
    ease: merged.ease ?? DEFAULT_EASING,
    stiffness: merged.stiffness,
    damping: merged.damping,
    mass: merged.mass,
    repeat: merged.repeat,
  };
}
