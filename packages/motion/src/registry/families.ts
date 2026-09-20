/**
 * @fusorb/facet-motion - 15 generative families.
 *
 * Each entry is a `MotionEffectDefinition` with a pure `resolve()` function
 * that maps (effect × direction × intensity × duration × easing) into a
 * `ResolvedMotion` - framework-agnostic keyframe data with no DOM access.
 *
 * Intensity tables per the registry design (archived in `.agent/episodes.md` EP 36).
 * Where the sheet gave only one tier (e.g. flip's 90° example), the
 * remaining tiers are filled with a sensible geometric progression -
 * see the open-decision comment in registry/index.ts.
 */

import type {
  Direction,
  Easing,
  Intensity,
  MotionEffectDefinition,
  MotionTransition,
  MotionEffectRegistry,
  ResolvedMotion,
  MotionVariant,
} from "./types.js";
import { resolveTransition, DEFAULT_INTENSITY } from "./types.js";

/* ---------- intensity tables ---------- */

const DISTANCE: Record<Intensity, number> = {
  subtle: 6,
  soft: 20,
  medium: 28,
  strong: 40,
  dramatic: 100,
};

const SCALE: Record<Intensity, number> = {
  subtle: 0.98,
  soft: 0.9,
  medium: 0.85,
  strong: 0.8,
  dramatic: 0.6,
};

const BLUR_RADIUS: Record<Intensity, number> = {
  subtle: 4,
  soft: 8,
  medium: 12,
  strong: 16,
  dramatic: 20,
};

/** Open-decision §5.1 - rotation degrees per intensity tier. */
const FLIP_ROTATION: Record<Intensity, number> = {
  subtle: 15,
  soft: 30,
  medium: 45,
  strong: 90,
  dramatic: 180,
};

/** Open-decision §5.1 - text-reveal distance per intensity tier. */
const TEXT_DISTANCE: Record<Intensity, number> = {
  subtle: 4,
  soft: 12,
  medium: 20,
  strong: 32,
  dramatic: 56,
};

const POP_OVERSHOOT: Record<Intensity, number> = {
  subtle: 1.05,
  soft: 1.15,
  medium: 1.25,
  strong: 1.35,
  dramatic: 1.5,
};

const LIFT_TRANSLATE: Record<Intensity, number> = {
  subtle: -4,
  soft: -6,
  medium: -8,
  strong: -12,
  dramatic: -16,
};

const LIFT_SHADOW_TIER: Record<Intensity, number> = {
  subtle: 1,
  soft: 2,
  medium: 2,
  strong: 3,
  dramatic: 3,
};

const PRESS_SCALE: Record<Intensity, number> = {
  subtle: 0.97,
  soft: 0.96,
  medium: 0.94,
  strong: 0.92,
  dramatic: 0.9,
};

const RING_WIDTH: Record<Intensity, number> = {
  subtle: 1,
  soft: 2,
  medium: 3,
  strong: 4,
  dramatic: 6,
};

const GLOW_RADIUS: Record<Intensity, number> = {
  subtle: 4,
  soft: 8,
  medium: 12,
  strong: 16,
  dramatic: 24,
};

const PANEL_PARAMS: Record<
  Intensity,
  { distance: number; scale: number }
> = {
  subtle: { distance: 10, scale: 0.97 },
  soft: { distance: 20, scale: 0.95 },
  medium: { distance: 30, scale: 0.93 },
  strong: { distance: 40, scale: 0.9 },
  dramatic: { distance: 100, scale: 0.85 },
};

const PANEL_EASING: Easing = "emphasized";

const LIFT_SHADOWS: Record<number, string> = {
  1: "0 2px 4px rgba(0,0,0,0.1)",
  2: "0 4px 6px rgba(0,0,0,0.1)",
  3: "0 10px 15px rgba(0,0,0,0.1)",
};

/* ---------- helpers ---------- */

function getDir(v: MotionVariant): Direction | undefined {
  return v.direction;
}

function getInt(v: MotionVariant): Intensity {
  return v.intensity ?? DEFAULT_INTENSITY;
}

function tr(
  override: MotionTransition | undefined,
  def: MotionTransition,
): ResolvedMotion["transition"] {
  return resolveTransition(override, def);
}

/* ---------- family definitions ---------- */

export const fade: MotionEffectDefinition = {
  id: "fade",
  family: "fade",
  kind: "generative",
  directions: ["in", "out", "up", "down", "left", "right"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "base", ease: "standard" },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const dist = DISTANCE[getInt(variant)];

    let from: Record<string, string | number> = { opacity: 0 };
    let to: Record<string, string | number> = { opacity: 1 };

    if (dir === "up") {
      from = { opacity: 0, transform: `translateY(${dist}px)` };
      to = { opacity: 1, transform: "translateY(0)" };
    } else if (dir === "down") {
      from = { opacity: 0, transform: `translateY(-${dist}px)` };
      to = { opacity: 1, transform: "translateY(0)" };
    } else if (dir === "left") {
      from = { opacity: 0, transform: `translateX(${dist}px)` };
      to = { opacity: 1, transform: "translateX(0)" };
    } else if (dir === "right") {
      from = { opacity: 0, transform: `translateX(-${dist}px)` };
      to = { opacity: 1, transform: "translateX(0)" };
    } else if (dir === "out") {
      from = { opacity: 1 };
      to = { opacity: 0 };
    }

    return { from, to, transition: tr(transition, fade.defaultTransition) };
  },
};

export const zoom: MotionEffectDefinition = {
  id: "zoom",
  family: "zoom",
  kind: "generative",
  directions: ["in", "out", "up", "down", "left", "right"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: {
    type: "spring",
    stiffness: 260,
    damping: 22,
    duration: "base",
    ease: "spring",
  },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const s = SCALE[getInt(variant)];
    const dist = DISTANCE[getInt(variant)];

    if (dir === "out") {
      return {
        from: { opacity: 1, transform: "scale(1)" },
        to: { opacity: 0, transform: `scale(${s})` },
        transition: tr(transition, zoom.defaultTransition),
      };
    }

    if (dir === "up") {
      return {
        from: { opacity: 0, transform: `scale(${s}) translateY(${dist}px)` },
        to: { opacity: 1, transform: "scale(1) translateY(0)" },
        transition: tr(transition, zoom.defaultTransition),
      };
    }

    if (dir === "down") {
      return {
        from: { opacity: 0, transform: `scale(${s}) translateY(-${dist}px)` },
        to: { opacity: 1, transform: "scale(1) translateY(0)" },
        transition: tr(transition, zoom.defaultTransition),
      };
    }

    if (dir === "left") {
      return {
        from: { opacity: 0, transform: `scale(${s}) translateX(${dist}px)` },
        to: { opacity: 1, transform: "scale(1) translateX(0)" },
        transition: tr(transition, zoom.defaultTransition),
      };
    }

    if (dir === "right") {
      return {
        from: { opacity: 0, transform: `scale(${s}) translateX(-${dist}px)` },
        to: { opacity: 1, transform: "scale(1) translateX(0)" },
        transition: tr(transition, zoom.defaultTransition),
      };
    }

    // "in" (no direction) - scale only
    return {
      from: { opacity: 0, transform: `scale(${s})` },
      to: { opacity: 1, transform: "scale(1)" },
      transition: tr(transition, zoom.defaultTransition),
    };
  },
};

export const pop: MotionEffectDefinition = {
  id: "pop",
  family: "pop",
  kind: "generative",
  directions: ["in", "out"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: {
    type: "spring",
    stiffness: 300,
    damping: 20,
    duration: "base",
    ease: "spring",
  },
  resolve: (variant, transition): ResolvedMotion => {
    const overshoot = POP_OVERSHOOT[getInt(variant)];

    if (getDir(variant) === "out") {
      return {
        from: { opacity: 1, transform: "scale(1)" },
        to: { opacity: 0, transform: `scale(${overshoot})` },
        transition: tr(transition, pop.defaultTransition),
      };
    }

    return {
      from: { opacity: 0, transform: `scale(${overshoot})` },
      to: { opacity: 1, transform: "scale(1)" },
      transition: tr(transition, pop.defaultTransition),
    };
  },
};

export const slide: MotionEffectDefinition = {
  id: "slide",
  family: "slide",
  kind: "generative",
  directions: ["up", "down", "left", "right"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "base", ease: "emphasized" },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const dist = DISTANCE[getInt(variant)];

    switch (dir) {
      case "up":
        return {
          from: { transform: `translateY(${dist}px)` },
          to: { transform: "translateY(0)" },
          transition: tr(transition, slide.defaultTransition),
        };
      case "down":
        return {
          from: { transform: `translateY(-${dist}px)` },
          to: { transform: "translateY(0)" },
          transition: tr(transition, slide.defaultTransition),
        };
      case "left":
        return {
          from: { transform: `translateX(${dist}px)` },
          to: { transform: "translateX(0)" },
          transition: tr(transition, slide.defaultTransition),
        };
      case "right":
        return {
          from: { transform: `translateX(-${dist}px)` },
          to: { transform: "translateX(0)" },
          transition: tr(transition, slide.defaultTransition),
        };
      default:
        return {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(0)" },
          transition: tr(transition, slide.defaultTransition),
        };
    }
  },
};

export const reveal: MotionEffectDefinition = {
  id: "reveal",
  family: "reveal",
  kind: "generative",
  directions: ["up", "down"],
  defaultTransition: { duration: "fast", ease: "standard" },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const origin = dir === "up" ? "bottom" : "top";

    return {
      from: { transform: "scaleY(0)", "transform-origin": origin },
      to: { transform: "scaleY(1)", "transform-origin": origin },
      transition: tr(transition, reveal.defaultTransition),
    };
  },
};

export const blur: MotionEffectDefinition = {
  id: "blur",
  family: "blur",
  kind: "generative",
  directions: ["in", "out"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "base", ease: "smooth" },
  resolve: (variant, transition): ResolvedMotion => {
    const blurVal = BLUR_RADIUS[getInt(variant)];
    const dir = getDir(variant);

    if (dir === "out") {
      return {
        from: { opacity: 1, filter: "blur(0px)" },
        to: { opacity: 0, filter: `blur(${blurVal}px)` },
        transition: tr(transition, blur.defaultTransition),
      };
    }

    return {
      from: { opacity: 0, filter: `blur(${blurVal}px)` },
      to: { opacity: 1, filter: "blur(0px)" },
      transition: tr(transition, blur.defaultTransition),
    };
  },
};

export const flip: MotionEffectDefinition = {
  id: "flip",
  family: "flip",
  kind: "generative",
  directions: ["x", "y", "top-left", "bottom-right"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "slow", ease: "standard" },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const angle = FLIP_ROTATION[getInt(variant)];

    if (dir === "x") {
      return {
        from: { transform: `rotateX(${angle}deg)` },
        to: { transform: "rotateX(0)" },
        transition: tr(transition, flip.defaultTransition),
      };
    }

    if (dir === "y") {
      return {
        from: { transform: `rotateY(${angle}deg)` },
        to: { transform: "rotateY(0)" },
        transition: tr(transition, flip.defaultTransition),
      };
    }

    if (dir === "top-left") {
      return {
        from: { transform: `rotateX(${angle}deg) rotateY(-${angle}deg)` },
        to: { transform: "rotateX(0) rotateY(0)" },
        transition: tr(transition, flip.defaultTransition),
      };
    }

    // bottom-right
    return {
      from: { transform: `rotateX(-${angle}deg) rotateY(${angle}deg)` },
      to: { transform: "rotateX(0) rotateY(0)" },
      transition: tr(transition, flip.defaultTransition),
    };
  },
};

export const spin: MotionEffectDefinition = {
  id: "spin",
  family: "spin",
  kind: "generative",
  directions: ["clockwise", "counterclockwise"],
  defaultTransition: {
    type: "tween",
    duration: "cinematic",
    ease: "linear",
    repeat: "infinite",
  },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const rotation = dir === "counterclockwise" ? "-360deg" : "360deg";

    return {
      from: { transform: "rotate(0deg)" },
      to: { transform: `rotate(${rotation})` },
      transition: tr(transition, spin.defaultTransition),
    };
  },
};

export const panel: MotionEffectDefinition = {
  id: "panel",
  family: "panel",
  kind: "generative",
  directions: ["up", "down", "left", "right", "top-left", "top-right"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "base", ease: PANEL_EASING },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const p = PANEL_PARAMS[getInt(variant)];
    const d = p.distance;
    const s = p.scale;

    switch (dir) {
      case "up":
        return {
          from: { opacity: 0, transform: `translateY(${d}px) scale(${s})` },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
          transition: tr(transition, panel.defaultTransition),
        };
      case "down":
        return {
          from: { opacity: 0, transform: `translateY(-${d}px) scale(${s})` },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
          transition: tr(transition, panel.defaultTransition),
        };
      case "left":
        return {
          from: { opacity: 0, transform: `translateX(${d}px) scale(${s})` },
          to: { opacity: 1, transform: "translateX(0) scale(1)" },
          transition: tr(transition, panel.defaultTransition),
        };
      case "right":
        return {
          from: { opacity: 0, transform: `translateX(-${d}px) scale(${s})` },
          to: { opacity: 1, transform: "translateX(0) scale(1)" },
          transition: tr(transition, panel.defaultTransition),
        };
      case "top-left":
        return {
          from: {
            opacity: 0,
            transform: `translate(${d}px, ${d}px) scale(${s})`,
            "transform-origin": "top left",
          },
          to: {
            opacity: 1,
            transform: "translate(0, 0) scale(1)",
            "transform-origin": "top left",
          },
          transition: tr(transition, panel.defaultTransition),
        };
      case "top-right":
        return {
          from: {
            opacity: 0,
            transform: `translate(-${d}px, ${d}px) scale(${s})`,
            "transform-origin": "top right",
          },
          to: {
            opacity: 1,
            transform: "translate(0, 0) scale(1)",
            "transform-origin": "top right",
          },
          transition: tr(transition, panel.defaultTransition),
        };
      default:
        return {
          from: { opacity: 0, transform: `scale(${s})` },
          to: { opacity: 1, transform: "scale(1)" },
          transition: tr(transition, panel.defaultTransition),
        };
    }
  },
};

export const lift: MotionEffectDefinition = {
  id: "lift",
  family: "lift",
  kind: "generative",
  directions: [],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "fast", ease: "standard" },
  resolve: (variant, transition): ResolvedMotion => {
    const ty = LIFT_TRANSLATE[getInt(variant)];
    const shadowTier = LIFT_SHADOW_TIER[getInt(variant)];

    return {
      from: {
        transform: "translateY(0)",
        "box-shadow": "0 0 0 0px rgba(0,0,0,0)",
      },
      to: {
        transform: `translateY(${ty}px)`,
        "box-shadow": LIFT_SHADOWS[shadowTier] ?? "0 0 0 0px rgba(0,0,0,0)",
      },
      transition: tr(transition, lift.defaultTransition),
    };
  },
};

export const press: MotionEffectDefinition = {
  id: "press",
  family: "press",
  kind: "generative",
  directions: ["in", "out"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "instant", ease: "standard" },
  resolve: (variant, transition): ResolvedMotion => {
    const s = PRESS_SCALE[getInt(variant)];

    if (getDir(variant) === "out") {
      return {
        from: { transform: `scale(${s})` },
        to: { transform: "scale(1)" },
        transition: tr(transition, press.defaultTransition),
      };
    }

    return {
      from: { transform: "scale(1)" },
      to: { transform: `scale(${s})` },
      transition: tr(transition, press.defaultTransition),
    };
  },
};

export const ring: MotionEffectDefinition = {
  id: "ring",
  family: "ring",
  kind: "generative",
  directions: [],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "fast", ease: "standard" },
  resolve: (variant, transition): ResolvedMotion => {
    const w = RING_WIDTH[getInt(variant)];

    return {
      from: { "box-shadow": "0 0 0 0px rgba(0,0,0,0)" },
      to: { "box-shadow": `0 0 0 ${w}px rgba(0, 0, 0, 0.3)` },
      transition: tr(transition, ring.defaultTransition),
    };
  },
};

export const glow: MotionEffectDefinition = {
  id: "glow",
  family: "glow",
  kind: "generative",
  directions: [],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: {
    type: "tween",
    duration: "slow",
    ease: "smooth",
    repeat: "infinite",
  },
  resolve: (variant, transition): ResolvedMotion => {
    const r = GLOW_RADIUS[getInt(variant)];

    return {
      from: { opacity: 0.9, filter: "brightness(1)" },
      to: { opacity: 1, filter: `brightness(${1 + r / 20})` },
      transition: tr(transition, glow.defaultTransition),
    };
  },
};

export const shimmer: MotionEffectDefinition = {
  id: "shimmer",
  family: "shimmer",
  kind: "generative",
  directions: ["left", "right"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: {
    type: "tween",
    duration: "slow",
    ease: "linear",
    repeat: "infinite",
  },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const sweep = SHIMMER_SWEEP[getInt(variant)];

    if (dir === "right") {
      return {
        from: { transform: `translateX(${sweep}%)` },
        to: { transform: `translateX(-${sweep}%)` },
        transition: tr(transition, shimmer.defaultTransition),
      };
    }

    return {
      from: { transform: `translateX(-${sweep}%)` },
      to: { transform: `translateX(${sweep}%)` },
      transition: tr(transition, shimmer.defaultTransition),
    };
  },
};

const SHIMMER_SWEEP: Record<Intensity, number> = {
  subtle: 50,
  soft: 75,
  medium: 100,
  strong: 150,
  dramatic: 200,
};

export const textReveal: MotionEffectDefinition = {
  id: "text-reveal",
  family: "text-reveal",
  kind: "generative",
  directions: ["up", "down", "tracking"],
  intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  defaultTransition: { duration: "base", ease: "emphasized" },
  resolve: (variant, transition): ResolvedMotion => {
    const dir = getDir(variant);
    const d = TEXT_DISTANCE[getInt(variant)];

    if (dir === "tracking") {
      return {
        from: { opacity: 0, "letter-spacing": `${d}px` },
        to: { opacity: 1, "letter-spacing": "0" },
        transition: tr(transition, textReveal.defaultTransition),
      };
    }

    if (dir === "down") {
      return {
        from: {
          opacity: 0,
          transform: `translateY(-${d}px)`,
          "letter-spacing": "-0.03em",
        },
        to: { opacity: 1, transform: "translateY(0)", "letter-spacing": "0" },
        transition: tr(transition, textReveal.defaultTransition),
      };
    }

    // "up"
    return {
      from: {
        opacity: 0,
        transform: `translateY(${d}px)`,
        "letter-spacing": "-0.03em",
      },
      to: { opacity: 1, transform: "translateY(0)", "letter-spacing": "0" },
      transition: tr(transition, textReveal.defaultTransition),
    };
  },
};

/* ---------- registry export ---------- */

export const generativeFamilies: MotionEffectRegistry = {
  fade,
  zoom,
  pop,
  slide,
  reveal,
  blur,
  flip,
  spin,
  panel,
  lift,
  press,
  ring,
  glow,
  shimmer,
  "text-reveal": textReveal,
};

/** Keys of `generativeFamilies` - the 15 family IDs. */
export const GENERATIVE_FAMILY_IDS = Object.keys(generativeFamilies);
