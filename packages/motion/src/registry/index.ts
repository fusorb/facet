/**
 * @fusorb/facet-motion — registry: effect lookup + resolution.
 *
 * Combines the 15 generative families with the authored placeholders into
 * a single lookup table. Public entry-point: `resolveMotion()`.
 *
 * ---------------------------------------------------------------------------
 * OPEN DECISIONS (from .agent/facet-motion-registry-spec.md §5) — resolved:
 *
 * 5.1 — Exact px/scale/degree tables for `flip` and `text-reveal`:
 *   Defined sensible geometric progressions where the sheet gave only
 *   one example: FLIP_ROTATION = { 15°, 30°, 45°, 90°, 180° } and
 *   TEXT_DISTANCE = { 4px, 12px, 20px, 32px, 56px }.
 *
 * 5.2 — press/ring/lift: same registry or separate interactions/ ?
 *   Decision: same registry. They share the MotionEffectDefinition shape,
 *   and a single resolver means one code path. If interaction-specific
 *   metadata grows beyond Phase 1, a separate namespace can be layered on
 *   top without changing the resolve() contract.
 *
 * 5.3 — spin/glow/shimmer: distinct LoopMotionEffectDefinition ?
 *   Decision: No separate type. Loop families return a standard
 *   ResolvedMotion whose transition carries `repeat: "infinite"`.
 *   The CSS driver reads `repeat` and creates a CSS animation; the
 *   from/to represent one cycle.
 * ---------------------------------------------------------------------------
 */

import type {
  AnimationType,
  Direction,
  Duration,
  Easing,
  Intensity,
  MotionEffectDefinition,
  MotionEffectRegistry,
  MotionPreset,
  MotionTransition,
  MotionVariant,
  ResolvedMotion,
  TransitionType,
} from "./types.js";
import {
  DEFAULT_DURATION,
  DEFAULT_EASING,
  DEFAULT_INTENSITY,
  resolveTransition,
} from "./types.js";
import { generativeFamilies } from "./families.js";
import { authoredRegistry } from "./authored.js";

/* ---- combined registry ---- */

/**
 * All registered motion effects — generative + authored.
 * Generative effects resolve to { from, to, transition }.
 * Authored effects have a `program` string and throw on resolve().
 */
export const registry: MotionEffectRegistry = {
  ...generativeFamilies,
  ...authoredRegistry,
};

/**
 * Look up a single effect definition by id.
 * Returns `undefined` if the id is not registered.
 *
 * Callers can branch on `.kind === "authored"` without triggering
 * a resolve() call.
 */
export function get(id: string): MotionEffectDefinition | undefined {
  return registry[id];
}

/* ---- resolve ---- */

/**
 * Resolve an effect variant + transition override into a concrete
 * { from, to, transition } keyframe object.
 *
 * Returns `null` if the effect id is unknown.
 * Throws if the effect is authored (kind: "authored") — those are
 * deferred to Phase 4.
 */
export function resolveMotion(
  effectId: string,
  variant: MotionVariant,
  transition: MotionTransition = { duration: "base", ease: "standard" },
): ResolvedMotion | null {
  const def = registry[effectId];
  if (!def) return null;

  if (def.kind === "authored" || !def.resolve) {
    throw new Error(
      `"${effectId}" is an authored effect — implementation deferred to Phase 4.`,
    );
  }

  return def.resolve(variant, transition);
}

/* ---- re-exports ---- */

export { generativeFamilies, authoredRegistry };
export {
  DEFAULT_INTENSITY,
  DEFAULT_EASING,
  DEFAULT_DURATION,
  resolveTransition,
};

export type {
  AnimationType,
  Direction,
  Duration,
  Easing,
  Intensity,
  MotionEffectDefinition,
  MotionEffectRegistry,
  MotionPreset,
  MotionTransition,
  MotionVariant,
  ResolvedMotion,
  TransitionType,
};
