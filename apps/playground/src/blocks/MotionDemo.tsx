import {
  Motion,
  fintechMotion,
  medMotion,
  eduMotion,
  enterpriseMotion,
  defaultMotion,
} from "@fusorb/facet-motion";
import type {
  DomainMotionConfig,
  Duration,
  Easing,
  Intensity,
} from "@fusorb/facet-motion";

const PRESETS: Record<string, DomainMotionConfig> = {
  fintech: fintechMotion,
  med: medMotion,
  edu: eduMotion,
  enterprise: enterpriseMotion,
  default: defaultMotion,
};

export function MotionDemo({ preset = "fintech" }: { preset?: string }) {
  const cfg = PRESETS[preset] ?? defaultMotion;
  const t = cfg.defaultTransition;

  const motionProps: {
    effect: string;
    intensity: Intensity;
    duration?: Duration;
    ease?: Easing;
  } = {
    effect: "fade",
    intensity: "strong",
  };
  if (t.duration !== undefined) motionProps.duration = t.duration;
  if (t.ease !== undefined) motionProps.ease = t.ease;

  return (
    <Motion
      {...motionProps}
      className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium shadow"
    >
      {preset} motion
    </Motion>
  );
}
