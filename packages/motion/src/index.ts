/**
 * @fusorb/facet-motion - domain-customizable animation engine.
 *
 * Layered architecture (archived in `.agent/episodes.md` EP 36):
 *   core/   → animate(), sequence(), stagger(), tween, spring (zero DOM)
 *   values/ → motionValue() observable (get/set/subscribe)
 *   drivers/ → cssDriver (applies values to element.style, prefers-reduced-motion)
 *   registry/ → 15 generative families + 18 authored effects with resolve()
 *   react/   → <Motion>, <Presence>, <Reveal>, <Stagger> thin JSX bindings
 *
 * Duration/easing tokens resolve against @fusorb/facet-tokens CSS custom
 * properties - the registry never hardcodes a millisecond or bezier value.
 */

// utils
export { cn } from "@fusorb/facet-utils";

// core - framework-agnostic generators + orchestration
export {
  animate,
  sequence,
  stagger,
  defaultScheduler,
  tween,
  spring,
} from "./core/index.js";
export type {
  AnimateOptions,
  AnimationController,
  SequenceStep,
  StaggerOptions,
  StaggerOrigin,
  EasingFunction,
  TweenOpts,
  SpringOpts,
  Scheduler,
  TickCallback,
  Unscheduler,
} from "./core/index.js";

// values - observable motion value (seam between core and drivers)
export { motionValue } from "./values/index.js";
export type { MotionValue, MotionValueSubscriber } from "./values/index.js";

// drivers - the only layer that touches a real target (CSS / DOM)
export {
  cssDriver,
  preferReducedMotion,
  resolveDuration,
  resolveEasing,
} from "./drivers/index.js";
export type {
  MotionDriver,
  DriverTarget,
  DriverBindings,
  DriverHandle,
  Unsubscribe,
} from "./drivers/index.js";

// registry - data-driven effect resolution
export {
  resolveMotion,
  get,
  registry,
  generativeFamilies,
  authoredRegistry,
  resolveTransition,
  DEFAULT_INTENSITY,
  DEFAULT_EASING,
  DEFAULT_DURATION,
  // Phase 3: domain motion presets
  fintechMotion,
  medMotion,
  eduMotion,
  enterpriseMotion,
  defaultMotion,
  getDomainMotionConfig,
  registerDomainMotion,
  hasDomainMotionConfig,
  listDomainMotionConfigs,
  easingFor,
  GENERATIVE_FAMILY_IDS,
} from "./registry/index.js";
export type {
  Direction,
  Intensity,
  Duration,
  Easing,
  AnimationType,
  TransitionType,
  MotionTransition,
  MotionVariant,
  ResolvedMotion,
  MotionKeyframe,
  MotionEffectDefinition,
  MotionPreset,
  MotionEffectRegistry,
  DomainMotionConfig,
} from "./registry/index.js";

// react - thin JSX bindings (no animation logic)
export { Motion, Presence, Reveal, Stagger } from "./react/index.js";
export type {
  MotionProps,
  PresenceProps,
  RevealProps,
  StaggerProps,
} from "./react/index.js";
export { PresenceContext, StaggerContext } from "./react/index.js";
export { usePresence, useStagger } from "./react/index.js";
