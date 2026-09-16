/**
 * @fusorb/facet-motion — authored / signature effects.
 *
 * 18 handwritten effects from `.agent/facet-motion-registry-spec.md` §3.
 * Each registers into the same `MotionEffectDefinition` shape
 * (`kind: "authored"`) so `<Motion effect="shake" />` works identically
 * from the consumer's side.
 *
 * Per the architecture doc, these are NOT implemented in Phase 1 —
 * `resolve()` is absent and `resolveMotion()` throws a clear
 * "deferred to Phase 4" error. Consumers can still branch on
 * `registry.get(id).kind === "authored"`.
 *
 * NOTE: the spec text says "14 authored effects" but the §3 table
 * enumerates 18 rows. All 18 are registered here to avoid a silent
 * gap — the count discrepancy is a spec drafting error, not a design
 * decision.
 */

import type { MotionEffectDefinition, MotionTransition } from "./types.js";

const AUTHORED_DEFAULT_TRANSITION: MotionTransition = { duration: "base", ease: "standard" };

function authored(
  id: string,
  program: string,
  directions: MotionEffectDefinition["directions"] = [],
): MotionEffectDefinition {
  return {
    id,
    family: "authored",
    kind: "authored",
    directions,
    defaultTransition: AUTHORED_DEFAULT_TRANSITION,
    program,
  };
}

export const authoredEffects: MotionEffectDefinition[] = [
  authored("shake", "shakeX/Y: multi-step oscillation rotate(-15deg)↔(15deg)↔(0)deg)", [
    "x",
    "y",
  ]),
  authored(
    "wobble",
    "wobble: elastic multi-axis skew+rotate distortion, 10 keyframes",
  ),
  authored(
    "jello",
    "jello: 9-step skewX sequence, non-uniform deformation",
  ),
  authored(
    "rubber-band",
    "rubberBand: non-uniform scaleX/scaleY sequence with overshoot",
  ),
  authored(
    "tada",
    "tada: combined scale+rotate celebratory sequence (scale↔1.1, rotate↔5deg)",
  ),
  authored("heartbeat", "heartbeat: 4-beat scale sequence (1→1.3→1→1.3→1)"),
  authored("swing", "swing: pendulum rotation, fixed origin at top center"),
  authored(
    "bounce-in",
    "bounceIn: animate.css multi-step overshoot, distinct from pop's single spring",
  ),
  authored("flash", "flash: opacity strobe sequence (1→0→1→0→1)"),
  authored(
    "pulse-radar",
    "pulse-radar: ::after pseudo-element radial pulse, not a transform on the element itself",
  ),
  authored(
    "text-glitch",
    "text-glitch: RGB-split + jitter, randomized-feeling offsets over 3 frames",
  ),
  authored(
    "text-gradient-flow",
    "text-gradient-flow: animated background-position + background-clip: text, needs gradient paint",
  ),
  authored(
    "svg-draw",
    "svg-draw: stroke-dasharray/stroke-dashoffset based on path length, runtime measurement required",
  ),
  authored(
    "blob-morph",
    "blob-morph: organic border-radius keyframe morph sequence, no parameterized form",
  ),
  authored(
    "magnetic-hover",
    "magnetic-hover: live pointer-position tracking required, needs runtime event listener",
  ),
  authored(
    "isometric-lift",
    "isometric-lift: fixed 3D projection angles (perspective 800px, rotateX 60deg), non-parameterizable",
  ),
  authored(
    "fold-unfold",
    "fold-unfold: 3D origin-locked fold, single correct configuration with clip-path",
  ),
  authored(
    "typing-wave",
    "typing-wave: fixed 3-dot composite wave, users expect verbatim reproduction",
  ),
];

export const authoredRegistry: Record<string, MotionEffectDefinition> =
  Object.fromEntries(authoredEffects.map((e) => [e.id, e]));
