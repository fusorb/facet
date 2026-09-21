/**
 * @fusorb/facet-motion - authored / signature effects.
 *
 * 18 handwritten effects from the original registry design (archived in
 * `.agent/episodes.md` EP 36), plus 9 landscaped authored effects that power
 * the landing-page preview lab. Each registers into the same
 * `MotionEffectDefinition` shape (`kind: "authored"`).
 *
 * The original 18 effects have NO `resolve()` - they carry a `program`
 * string only and `resolveMotion()` throws a clear "deferred to Phase 4"
 * error. A subset of authored effects that originated in the landing
 * preview lab DO ship with `resolve()` so consumers can generate CSS
 * keyframes from the motion package directly rather than borrowing hardcoded
 * CSS.
 */

import type {
  MotionEffectDefinition,
  MotionTransition,
  MotionVariant,
  ResolvedMotion,
} from "./types.js";
import { resolveTransition } from "./types.js";

const AUTHORED_DEFAULT_TRANSITION: MotionTransition = {
  duration: "base",
  ease: "standard",
};

const LANDSCAPE_DEFAULT_TRANSITION: MotionTransition = {
  duration: "slow",
  ease: "standard",
  repeat: "infinite",
};

function tr(
  override: MotionTransition | undefined,
  def: MotionTransition,
): ResolvedMotion["transition"] {
  return resolveTransition(override, def);
}

function authored(
  id: string,
  program: string,
  directions: MotionEffectDefinition["directions"] = [],
  resolve?: (
    variant: MotionVariant,
    transition: MotionTransition,
  ) => ResolvedMotion,
): MotionEffectDefinition {
  return {
    id,
    family: "authored",
    kind: "authored",
    directions,
    defaultTransition: resolve
      ? LANDSCAPE_DEFAULT_TRANSITION
      : AUTHORED_DEFAULT_TRANSITION,
    program,
    resolve,
  };
}

export const authoredEffects: MotionEffectDefinition[] = [
  authored(
    "shake",
    "shakeX/Y: multi-step oscillation rotate(-15deg)↔(15deg)↔(0)deg)",
    ["x", "y"],
  ),
  authored(
    "wobble",
    "wobble: elastic multi-axis skew+rotate distortion, 10 keyframes",
  ),
  authored("jello", "jello: 9-step skewX sequence, non-uniform deformation"),
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

  /* ---------- Landscape authored effects (landing preview lab) ---------- */

  authored(
    "aurora",
    "aurora: 3-step scale+rotate+opacity cycle, continuous back-and-forth",
    [],
    (_variant, transition) => ({
      from: { opacity: 1, transform: "scale(1) rotate(0deg)" },
      to: { opacity: 1, transform: "scale(1) rotate(-2deg)" },
      keyframes: [
        {
          percent: 50,
          style: { opacity: 0.8, transform: "scale(1.05) rotate(2deg)" },
        },
      ],
      transition: tr(transition, {
        type: "tween",
        duration: "cinematic",
        ease: "smooth",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "beams",
    "beams: staggered vertical beam wave (component renders multiple elements)",
    [],
    (_variant, transition) => ({
      from: { opacity: 0.1, transform: "scaleY(0.6)" },
      to: { opacity: 0.7, transform: "scaleY(1)" },
      transition: tr(transition, {
        type: "tween",
        duration: "cinematic",
        ease: "smooth",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "spotlight",
    "spotlight: continuous 360deg radial sweep",
    [],
    (_variant, transition) => ({
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(360deg)" },
      transition: tr(transition, {
        type: "tween",
        duration: "cinematic",
        ease: "linear",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "grid",
    "grid: animated diagonal background sweep",
    [],
    (_variant, transition) => ({
      from: { transform: "translate(-20%, -20%)" },
      to: { transform: "translate(20%, 20%)" },
      transition: tr(transition, {
        type: "tween",
        duration: "slow",
        ease: "standard",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "ripple",
    "ripple: concentric ring expand+fade (component renders multiple rings)",
    [],
    (_variant, transition) => ({
      from: { opacity: 0.8, transform: "scale(0.5)" },
      to: { opacity: 0, transform: "scale(3)" },
      transition: tr(transition, {
        type: "tween",
        duration: "slow",
        ease: "standard",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "tilt",
    "tilt: 3D perspective rotation cycle",
    [],
    (_variant, transition) => ({
      from: {
        transform: "perspective(800px) rotateX(8deg) rotateY(-8deg)",
      },
      to: {
        transform: "perspective(800px) rotateX(8deg) rotateY(-8deg)",
      },
      keyframes: [
        {
          percent: 50,
          style: {
            transform: "perspective(800px) rotateX(-4deg) rotateY(6deg)",
          },
        },
      ],
      transition: tr(transition, {
        type: "tween",
        duration: "cinematic",
        ease: "standard",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "shine",
    "shine: gradient sweep via background-position",
    [],
    (_variant, transition) => ({
      from: { "background-position": "-200% 0" },
      to: { "background-position": "200% 0" },
      transition: tr(transition, {
        type: "tween",
        duration: "slow",
        ease: "standard",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "typewriter",
    "typewriter: caret blink + sequential text reveal (component renders text)",
    [],
    (_variant, transition) => ({
      from: { opacity: 1 },
      to: { opacity: 1 },
      keyframes: [{ percent: 50, style: { opacity: 0 } }],
      transition: tr(transition, {
        type: "tween",
        duration: "fast",
        ease: "linear",
        repeat: "infinite",
      }),
    }),
  ),

  authored(
    "magnetic",
    "magnetic: spring follow with live pointer tracking (component handles cursor)",
    [],
    (_variant, transition) => ({
      from: { transform: "translate(0px, 0px)" },
      to: { transform: "translate(0px, 0px)" },
      transition: tr(transition, {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: "base",
        ease: "spring",
      }),
    }),
  ),
];

export const authoredRegistry: Record<string, MotionEffectDefinition> =
  Object.fromEntries(authoredEffects.map((e) => [e.id, e]));
