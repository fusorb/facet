/**
 * @fusorb/facet-motion - CSS keyframe generation utilities.
 *
 * These helpers convert a `ResolvedMotion` into CSS `@keyframes` rules that the
 * CSS animation path of `<Motion>` injects into the document `<head>`.
 * The JS `animate()` path (for single numeric props) is unaffected.
 */
import type { CSSProperties } from "react";
import type { MotionKeyframe, ResolvedMotion } from "../registry/types.js";

const injected = new Set<string>();

/** Serialize a style record into a CSS declaration block (without braces). */
function serializeStyle(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([prop, value]) => `${prop}: ${typeof value === "number" ? value : value};`)
    .join(" ");
}

/** Deterministic hash from a string → short identifier. */
function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return `f${(h >>> 0).toString(36)}`;
}

/**
 * Build a stable, unique `@keyframes` name for a resolved motion.
 * Same effect+params always map to the same name → cached `<style>` injection.
 */
export function animationName(effectId: string, resolved: ResolvedMotion): string {
  const parts = [
    effectId,
    JSON.stringify(resolved.from),
    JSON.stringify(resolved.to),
    ...(resolved.keyframes ?? []).map((kf) => `${kf.percent}:${JSON.stringify(kf.style)}`),
  ];
  return `facet-motion-${hash(parts.join("|"))}`;
}

/**
 * Generate the full `@keyframes` CSS rule string from a resolved motion.
 */
export function buildKeyframesCSS(name: string, resolved: ResolvedMotion): string {
  const stops: MotionKeyframe[] = [{ percent: 0, style: resolved.from }];
  if (resolved.keyframes) {
    stops.push(...resolved.keyframes);
  }
  stops.push({ percent: 100, style: resolved.to });
  stops.sort((a, b) => a.percent - b.percent);

  return `@keyframes ${name} { ${stops
    .map((s) => `${s.percent}% { ${serializeStyle(s.style)} }`)
    .join(" ")} }`;
}

/** Inject a `<style>` tag into `document.head` exactly once per name. */
export function injectStyle(name: string, css: string): void {
  if (injected.has(name)) return;
  if (typeof document === "undefined") return;
  injected.add(name);
  const style = document.createElement("style");
  style.setAttribute("data-facet-motion", name);
  style.textContent = css;
  document.head.appendChild(style);
}

export interface AnimationOpts {
  repeat?: number | "infinite";
  repeatType?: "loop" | "reverse";
  delay?: number;
  playing?: boolean;
}

/**
 * Build a `CSSProperties` object containing the individual `animation-*`
 * properties for a CSS-driven motion.
 */
export function buildAnimationProperties(
  resolved: ResolvedMotion,
  name: string,
  opts: AnimationOpts = {},
): CSSProperties {
  const t = resolved.transition;
  const durCSS =
    typeof t.duration === "number"
      ? `${t.duration}ms`
      : `var(--facet-motion-duration-${t.duration})`;
  const easeCSS = `var(--facet-motion-ease-${t.ease ?? "standard"})`;

  const iteration: string =
    opts.repeat !== undefined && opts.repeat !== 0
      ? opts.repeat === "infinite"
        ? "infinite"
        : String(opts.repeat + 1)
      : "1";

  const direction = opts.repeatType === "loop" ? "normal" : "alternate";

  const props: CSSProperties = {
    animationName: name,
    animationDuration: durCSS,
    animationTimingFunction: easeCSS,
    animationIterationCount: iteration,
    animationDirection: direction,
    animationFillMode: "forwards",
  };

  if (opts.delay && opts.delay > 0) {
    props.animationDelay = `${opts.delay}ms`;
  }

  props.animationPlayState = opts.playing === false ? "paused" : "running";

  return props;
}

/**
 * Decide whether the CSS `@keyframes` path should be used instead of the
 * per-property JS `animate()` engine.
 *
 * Rationale: the JS path animates a single `MotionValue<number>` per numeric
 * property, so it cannot express multi-step keyframes or looping. When the
 * resolved transition carries `keyframes` (authored effects) or a non-zero
 * `repeat` (looping effects), we emit a CSS `@keyframes` animation instead.
 */
export function shouldUseCSSAnimation(
  resolved: ResolvedMotion | null,
  repeat?: number | "infinite",
): boolean {
  if (!resolved) return false;
  if (resolved.keyframes && resolved.keyframes.length > 0) return true;
  return repeat !== undefined && repeat !== 0;
}
