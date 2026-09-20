import { describe, it, expect } from "vitest";
import { resolveMotion, get, registry, generativeFamilies, authoredRegistry } from "./index.js";
import { resolveTransition, DEFAULT_INTENSITY, DEFAULT_EASING, DEFAULT_DURATION } from "./index.js";
import type { MotionVariant } from "./index.js";

describe("registry", () => {
  describe("generativeFamilies", () => {
    it("registers exactly 15 generative families", () => {
      expect(Object.keys(generativeFamilies)).toHaveLength(15);
    });

    it("includes all expected family ids", () => {
      const ids = Object.keys(generativeFamilies);
      expect(ids).toContain("fade");
      expect(ids).toContain("zoom");
      expect(ids).toContain("pop");
      expect(ids).toContain("slide");
      expect(ids).toContain("reveal");
      expect(ids).toContain("blur");
      expect(ids).toContain("flip");
      expect(ids).toContain("spin");
      expect(ids).toContain("panel");
      expect(ids).toContain("lift");
      expect(ids).toContain("press");
      expect(ids).toContain("ring");
      expect(ids).toContain("glow");
      expect(ids).toContain("shimmer");
      expect(ids).toContain("text-reveal");
    });

    it("marks all families as kind: generative", () => {
      for (const fam of Object.values(generativeFamilies)) {
        expect(fam.kind).toBe("generative");
      }
    });
  });

  describe("authoredRegistry", () => {
    it("registers at least 14 authored effects", () => {
      expect(Object.keys(authoredRegistry).length).toBeGreaterThanOrEqual(14);
    });

    it("marks all authored effects with kind: authored", () => {
      for (const effect of Object.values(authoredRegistry)) {
        expect(effect.kind).toBe("authored");
      }
    });
  });

  describe("registry (combined)", () => {
    it("contains all generative families", () => {
      for (const [id, fam] of Object.entries(generativeFamilies)) {
        expect(registry[id]).toBe(fam);
      }
    });

    it("contains all authored effects", () => {
      for (const [id, effect] of Object.entries(authoredRegistry)) {
        expect(registry[id]).toBe(effect);
      }
    });
  });

  describe("get()", () => {
    it("returns a generative definition by id", () => {
      const def = get("fade");
      expect(def).toBeDefined();
      expect(def!.id).toBe("fade");
      expect(def!.kind).toBe("generative");
    });

    it("returns an authored definition by id", () => {
      const def = get("shake");
      expect(def).toBeDefined();
      expect(def!.kind).toBe("authored");
      expect(def!.program).toBeDefined();
    });

    it("returns undefined for unknown id", () => {
      expect(get("nonexistent")).toBeUndefined();
    });
  });

  describe("resolveMotion - worked examples (spec §4)", () => {
    it("fade / up / soft / fast", () => {
      const result = resolveMotion("fade", { direction: "up", intensity: "soft" }, { duration: "fast" });
      expect(result).toEqual({
        from: { opacity: 0, transform: "translateY(20px)" },
        to: { opacity: 1, transform: "translateY(0)" },
        transition: { duration: "fast", ease: "standard" },
      });
    });

    it("zoom / in / dramatic / spring", () => {
      const result = resolveMotion("zoom", { direction: "in", intensity: "dramatic" }, { type: "spring" });
      expect(result).toEqual({
        from: { opacity: 0, transform: "scale(0.6)" },
        to: { opacity: 1, transform: "scale(1)" },
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 22,
          duration: "base",
          ease: "spring",
        },
      });
    });

    it("panel / top-right / defaults", () => {
      const result = resolveMotion("panel", { direction: "top-right" }, {});
      expect(result).not.toBeNull();
      expect(result!.from.opacity).toBe(0);
      expect(result!.to.opacity).toBe(1);
      expect(result!.transition).toMatchObject({
        duration: "base",
        ease: "emphasized",
      });
    });
  });

  describe("resolveMotion - all 15 generative families resolve", () => {
    const cases: Array<[string, MotionVariant]> = [
      ["fade", { direction: "up", intensity: "soft" }],
      ["zoom", { direction: "in", intensity: "medium" }],
      ["pop", { direction: "in", intensity: "soft" }],
      ["slide", { direction: "left", intensity: "medium" }],
      ["reveal", { direction: "up", intensity: "medium" }],
      ["blur", { direction: "in", intensity: "soft" }],
      ["flip", { direction: "x", intensity: "medium" }],
      ["spin", { direction: "clockwise" }],
      ["panel", { direction: "top-right", intensity: "medium" }],
      ["lift", { intensity: "medium" }],
      ["press", { intensity: "soft" }],
      ["ring", { intensity: "medium" }],
      ["glow", { intensity: "medium" }],
      ["shimmer", { direction: "left" }],
      ["text-reveal", { direction: "up", intensity: "medium" }],
    ];

    it.each(cases)("resolves %s with provided variant", (id, variant) => {
      const result = resolveMotion(id, variant, {});
      expect(result).not.toBeNull();
      expect(result!.from).toBeTypeOf("object");
      expect(result!.to).toBeTypeOf("object");
      expect(result!.transition).toBeTypeOf("object");
      expect(result!.transition.duration).toBeDefined();
      expect(result!.transition.ease).toBeDefined();
    });
  });

  describe("resolveMotion - authored effects throw", () => {
    it.each(["shake", "wobble", "jello", "tada", "heartbeat", "flash"])(
      "throws for authored effect %s",
      (id) => {
        expect(() => resolveMotion(id, {}, {})).toThrow(/authored effect/);
      },
    );
  });

  describe("resolveMotion - unknown effect returns null", () => {
    it("returns null for unknown effect id", () => {
      expect(resolveMotion("nonexistent", {}, {})).toBeNull();
    });
  });

  describe("resolveTransition", () => {
    it("fills in default duration and ease", () => {
      const result = resolveTransition({}, { duration: "base", ease: "standard" });
      expect(result.duration).toBe("base");
      expect(result.ease).toBe("standard");
    });

    it("respects override values", () => {
      const result = resolveTransition(
        { duration: "fast", ease: "smooth" },
        { duration: "base", ease: "standard" },
      );
      expect(result.duration).toBe("fast");
      expect(result.ease).toBe("smooth");
    });
  });

  describe("default exports", () => {
    it("DEFAULT_INTENSITY is medium", () => {
      expect(DEFAULT_INTENSITY).toBe("medium");
    });
    it("DEFAULT_EASING is standard", () => {
      expect(DEFAULT_EASING).toBe("standard");
    });
    it("DEFAULT_DURATION is base", () => {
      expect(DEFAULT_DURATION).toBe("base");
    });
  });
});
