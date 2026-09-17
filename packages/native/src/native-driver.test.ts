import { describe, it, expect } from "vitest";
import { motionValues } from "@fusorb/facet-tokens";
import {
  toEasingCurve,
  resolveNativeTransition,
  nativeDriver,
} from "./native-driver.js";

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

describe("nativeDriver", () => {
  it("is not supported until bound to a real Animated module", () => {
    expect(nativeDriver.isSupported()).toBe(false);
  });

  it("apply() returns an inactive handle (shell)", () => {
    const handle = nativeDriver.apply();
    expect(handle.active).toBe(false);
    expect(typeof handle.cleanup).toBe("function");
    handle.cleanup();
  });

  it("exposes toEasingCurve and resolveNativeTransition", () => {
    expect(nativeDriver.toEasingCurve).toBe(toEasingCurve);
    expect(nativeDriver.resolveNativeTransition).toBe(resolveNativeTransition);
  });
});
