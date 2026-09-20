import { describe, it, expect, afterEach } from "vitest";
import { motionValues } from "@fusorb/facet-tokens";
import {
  toEasingCurve,
  resolveNativeTransition,
  nativeDriver,
  bindAnimated,
  unbindAnimated,
  isBound,
  setReduceMotion,
} from "./native-driver.js";
import type {
  NativeAnimatedAPI,
  NativeValue,
  NativeMotionValue,
} from "./native-driver.js";

/* ---------- test fixtures ---------- */

/** A minimal observable number - structurally compatible with
 *  facet-motion's MotionValue, so a real MotionValue can be passed in. */
interface TestMotionValue extends NativeMotionValue {
  set(v: number): void;
}

function createMotionValue(initial: number): TestMotionValue {
  const listeners = new Set<(v: number) => void>();
  let value = initial;
  return {
    get: () => value,
    set: (v: number) => {
      value = v;
      listeners.forEach((l) => l(v));
    },
    subscribe: (listener: (v: number) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** A mock Animated module that records every created node and the
 *  setValue calls made against it. */
function createMockAnimated(): NativeAnimatedAPI & {
  nodes: NativeValue[];
  calls: number[][];
} {
  const nodes: NativeValue[] = [];
  const calls: number[][] = [];
  return {
    createValue(_initial: number): NativeValue {
      const record: number[] = [];
      calls.push(record);
      const node: NativeValue = {
        setValue(v: number) {
          record.push(v);
        },
      };
      nodes.push(node);
      return node;
    },
    nodes,
    calls,
  };
}

afterEach(() => {
  nativeDriver.unbindAnimated();
  setReduceMotion(false);
});

/* ---------- toEasingCurve ---------- */

describe("toEasingCurve", () => {
  it("resolves token names to cubic-bezier coordinates", () => {
    expect(toEasingCurve("standard")).toEqual([0.2, 0, 0, 1]);
    expect(toEasingCurve("smooth")).toEqual([0.4, 0, 0.2, 1]);
  });

  it("resolves linear to identity", () => {
    expect(toEasingCurve("linear")).toEqual([0, 0, 1, 1]);
  });

  it("parses var(--motion-ease-*) references", () => {
    expect(toEasingCurve("var(--motion-ease-standard)")).toEqual([0.2, 0, 0, 1]);
    expect(toEasingCurve("var(--motion-ease-spring)")).toEqual([
      0.34, 1.56, 0.64, 1,
    ]);
  });

  it("parses var(--facet-motion-ease-*) references", () => {
    expect(toEasingCurve("var(--facet-motion-ease-spring)")).toEqual([
      0.34, 1.56, 0.64, 1,
    ]);
    expect(toEasingCurve("var(--facet-motion-ease-elastic)")).toEqual([
      0.25, 0.1, 0.25, 5,
    ]);
  });

  it("passes through array easing values unchanged", () => {
    const curve = [0.4, 0, 0.2, 1] as [number, number, number, number];
    expect(toEasingCurve(curve)).toBe(curve);
  });

  it("falls back to linear for unknown tokens", () => {
    expect(toEasingCurve("nonexistent")).toEqual([0, 0, 1, 1]);
    expect(toEasingCurve("var(--motion-ease-nope)")).toEqual([0, 0, 1, 1]);
  });
});

/* ---------- resolveNativeTransition ---------- */

describe("resolveNativeTransition", () => {
  it("applies defaults for an empty spec", () => {
    const spec = resolveNativeTransition({});
    expect(spec.duration).toBe(motionValues.facetDuration.base);
    expect(spec.easing).toEqual(motionValues.facetEasing.standard);
    expect(spec.delay).toBeUndefined();
    expect(spec.distance).toBeUndefined();
    expect(spec.scale).toBeUndefined();
    expect(spec.blur).toBeUndefined();
  });

  it("resolves named durations", () => {
    expect(resolveNativeTransition({ duration: "slow" }).duration).toBe(
      motionValues.facetDuration.slow,
    );
    expect(resolveNativeTransition({ duration: "cinematic" }).duration).toBe(
      motionValues.facetDuration.cinematic,
    );
  });

  it("passes through numeric durations", () => {
    expect(resolveNativeTransition({ duration: 333 }).duration).toBe(333);
  });

  it("falls back to base for unknown durations", () => {
    expect(
      resolveNativeTransition({ duration: "nope" as never }).duration,
    ).toBe(motionValues.facetDuration.base);
  });

  it("resolves easing token names and var references", () => {
    expect(resolveNativeTransition({ easing: "smooth" }).easing).toEqual([
      0.4, 0, 0.2, 1,
    ]);
    expect(
      resolveNativeTransition({ easing: "var(--motion-ease-spring)" }).easing,
    ).toEqual([0.34, 1.56, 0.64, 1]);
  });

  it("passes through array easing values", () => {
    const curve: [number, number, number, number] = [0.1, 0.2, 0.3, 0.4];
    expect(resolveNativeTransition({ easing: curve }).easing).toBe(curve);
  });

  it("resolves distance / scale / blur tokens", () => {
    expect(resolveNativeTransition({ distance: "md" }).distance).toBe(
      motionValues.distance.md,
    );
    expect(resolveNativeTransition({ scale: "pop" }).scale).toBe(
      motionValues.scale.pop,
    );
    expect(resolveNativeTransition({ blur: "inactive" }).blur).toBe(
      motionValues.blur.inactive,
    );
  });

  it("passes through delay", () => {
    expect(resolveNativeTransition({ delay: 100 }).delay).toBe(100);
  });
});

/* ---------- nativeDriver ---------- */

describe("nativeDriver (unbound shell)", () => {
  it("is not supported until an Animated module is bound", () => {
    expect(nativeDriver.isSupported()).toBe(false);
    expect(isBound()).toBe(false);
  });

  it("apply() is a no-op returning an inactive handle", () => {
    const handle = nativeDriver.apply({}, {});
    expect(handle.active).toBe(false);
    expect(typeof handle.cleanup).toBe("function");
    handle.cleanup();
  });

  it("exposes the resolution helpers", () => {
    expect(nativeDriver.toEasingCurve).toBe(toEasingCurve);
    expect(nativeDriver.resolveNativeTransition).toBe(resolveNativeTransition);
  });
});

describe("nativeDriver (bound)", () => {
  it("becomes supported once an Animated module is bound", () => {
    bindAnimated(createMockAnimated());
    expect(isBound()).toBe(true);
    expect(nativeDriver.isSupported()).toBe(true);
    unbindAnimated();
    expect(isBound()).toBe(false);
    expect(nativeDriver.isSupported()).toBe(false);
  });

  it("apply() drives motion values through the bound Animated", () => {
    const animated = createMockAnimated();
    bindAnimated(animated);

    const opacity = createMotionValue(0);
    const target = {} as Record<string, unknown>;
    const handle = nativeDriver.apply(target, {
      opacity,
      scale: 1.5,
    });

    expect(handle.active).toBe(true);
    // only the motion value creates a native node
    expect(animated.nodes).toHaveLength(1);
    expect(animated.calls).toHaveLength(1);
    // the motion value is bound to the created node
    expect(target.opacity).toBe(animated.nodes[0]);
    // static values are written directly, no node
    expect(target.scale).toBe(1.5);

    // driving the motion value pushes through to the native node
    opacity.set(0.7);
    expect(animated.calls[0]).toEqual([0.7]);

    handle.cleanup();
  });

  it("cleanup() stops driving native nodes", () => {
    const animated = createMockAnimated();
    bindAnimated(animated);

    const opacity = createMotionValue(0);
    const handle = nativeDriver.apply({}, { opacity });
    opacity.set(0.4);
    expect(animated.calls[0]).toEqual([0.4]);

    handle.cleanup();
    opacity.set(0.9);
    // after cleanup the node is no longer driven
    expect(animated.calls[0]).toEqual([0.4]);
  });

  it("respects reduce-motion: applies terminal values, inactive", () => {
    bindAnimated(createMockAnimated());
    setReduceMotion(true);

    const opacity = createMotionValue(0.4);
    const target = {} as Record<string, unknown>;
    const handle = nativeDriver.apply(target, { opacity });

    expect(handle.active).toBe(false);
    // terminal value written directly; no native node created
    expect(target.opacity).toBe(0.4);
    expect(nativeDriver.isSupported()).toBe(false);
  });
});
