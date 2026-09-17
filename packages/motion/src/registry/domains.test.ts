/**
 * Tests for motion domain presets.
 *
 * Mirrors the auth domain presets (packages/auth/src/presets.ts) so the
 * same domain name drives both auth behaviour and motion behaviour.
 */

import { describe, expect, it } from "vitest";
import { GENERATIVE_FAMILY_IDS } from "./families.js";
import type { Easing } from "./index.js";
import {
  fintechMotion,
  medMotion,
  eduMotion,
  enterpriseMotion,
  defaultMotion,
  getDomainMotionConfig,
  easingFor,
  resolveMotion,
} from "./index.js";

describe("domain presets", () => {
  describe("fintech", () => {
    it("uses fast duration + standard easing", () => {
      expect(fintechMotion.defaultTransition).toMatchObject({
        duration: "fast",
        ease: "standard",
        type: "tween",
      });
    });

    it("disables spring", () => {
      expect(fintechMotion.allowSpring).toBe(false);
    });

    it("reduces travel distance", () => {
      expect(fintechMotion.distanceScale).toBeLessThan(1);
    });

    it("caps intensity at medium", () => {
      expect(fintechMotion.maxIntensity).toBe("medium");
    });

    it("recommends only professional families", () => {
      const allowed = new Set(fintechMotion.preferredFamilies);
      // Every preferred family must be a registered generative family.
      for (const f of fintechMotion.preferredFamilies) {
        expect(GENERATIVE_FAMILY_IDS).toContain(f);
      }
      // No playful families allowed in fintech.
      expect(allowed.has("pop")).toBe(false);
      expect(allowed.has("glow")).toBe(false);
    });
  });

  describe("med", () => {
    it("uses base duration + smooth easing", () => {
      expect(medMotion.defaultTransition).toMatchObject({
        duration: "base",
        ease: "smooth",
      });
    });

    it("allows spring for confirmation states", () => {
      expect(medMotion.allowSpring).toBe(true);
    });

    it("keeps full travel distance", () => {
      expect(medMotion.distanceScale).toBe(1);
    });

    it("caps intensity at strong", () => {
      expect(medMotion.maxIntensity).toBe("strong");
    });
  });

  describe("edu", () => {
    it("uses spring easing for engagement", () => {
      expect(eduMotion.defaultTransition).toMatchObject({
        duration: "base",
        ease: "spring",
      });
    });

    it("allows spring", () => {
      expect(eduMotion.allowSpring).toBe(true);
    });

    it("increases travel distance", () => {
      expect(eduMotion.distanceScale).toBeGreaterThan(1);
    });

    it("permits playful families", () => {
      expect(eduMotion.preferredFamilies).toContain("pop");
      expect(eduMotion.preferredFamilies).toContain("glow");
    });

    it("allows full intensity", () => {
      expect(eduMotion.maxIntensity).toBe("dramatic");
    });
  });

  describe("enterprise", () => {
    it("uses base duration + standard easing", () => {
      expect(enterpriseMotion.defaultTransition).toMatchObject({
        duration: "base",
        ease: "standard",
      });
    });

    it("disables spring", () => {
      expect(enterpriseMotion.allowSpring).toBe(false);
    });

    it("slightly reduces travel distance", () => {
      expect(enterpriseMotion.distanceScale).toBeLessThan(1);
    });
  });

  describe("default", () => {
    it("provides a balanced fallback", () => {
      expect(defaultMotion.allowSpring).toBe(true);
      expect(defaultMotion.distanceScale).toBe(1);
      expect(defaultMotion.maxIntensity).toBe("dramatic");
    });
  });

  describe("getDomainMotionConfig", () => {
    it("returns the correct preset for known domains", () => {
      expect(getDomainMotionConfig("fintech")).toBe(fintechMotion);
      expect(getDomainMotionConfig("med")).toBe(medMotion);
      expect(getDomainMotionConfig("edu")).toBe(eduMotion);
      expect(getDomainMotionConfig("enterprise")).toBe(enterpriseMotion);
    });

    it("falls back to default for unknown domains", () => {
      expect(getDomainMotionConfig("unknown")).toBe(defaultMotion);
    });

    it("falls back to default for undefined", () => {
      expect(getDomainMotionConfig(undefined)).toBe(defaultMotion);
    });
  });

  describe("integration with resolveMotion", () => {
    it("resolveMotion still works with default transition for fintech domain", () => {
      // The domain preset's defaultTransition should be usable with resolveMotion.
      const resolved = resolveMotion(
        "fade",
        { direction: "up" },
        fintechMotion.defaultTransition,
      );
      expect(resolved).not.toBeNull();
      expect(resolved).toHaveProperty("from");
      expect(resolved).toHaveProperty("to");
      expect(resolved).toHaveProperty("transition");
    });

    it("resolveMotion with a non-registered effect returns null", () => {
      expect(resolveMotion("nonexistent", {}, fintechMotion.defaultTransition)).toBeNull();
    });
  });

  describe("easingFor", () => {
    const EASING_CURVES: Record<Easing, number[]> = {
      linear: [0, 0, 1, 1],
      standard: [0.2, 0, 0, 1],
      smooth: [0.4, 0, 0.2, 1],
      emphasized: [0.2, 0, 0, 1],
      spring: [0.34, 1.56, 0.64, 1],
      elastic: [0.25, 0.1, 0.25, 5],
    };

    it("returns cubic-bezier coordinates for each easing name", () => {
      for (const [name, expected] of Object.entries(EASING_CURVES)) {
        expect(easingFor(name as keyof typeof EASING_CURVES)).toEqual(expected);
      }
    });
  });
});
