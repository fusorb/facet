/**
 * Layout preset registry tests: registerLayoutPreset / resolveLayoutPreset.
 */

import { describe, it, expect } from "vitest";

import {
  registerLayoutPreset,
  getLayoutPreset,
  hasLayoutPreset,
  listLayoutPresets,
  resolveLayoutPreset,
  enterpriseLayoutPreset,
} from "./index.js";

describe("layout preset registry", () => {
  it("exposes the five built-in layout presets", () => {
    expect(listLayoutPresets()).toEqual(
      expect.arrayContaining([
        "fintech",
        "med",
        "edu",
        "enterprise",
        "default",
      ]),
    );
    expect(hasLayoutPreset("enterprise")).toBe(true);
    expect(getLayoutPreset("enterprise")).toEqual(enterpriseLayoutPreset);
  });

  it("registers a custom layout preset", () => {
    registerLayoutPreset("gov", {
      brand: { name: "GovPort", tagline: "Citizen Identity" },
      navigation: [
        {
          title: "Services",
          items: [{ href: "/services", label: "Services" }],
        },
      ],
    });

    expect(getLayoutPreset("gov").brand.name).toBe("GovPort");
    expect(getLayoutPreset("gov").navigation[0]?.title).toBe("Services");
  });

  it("resolveLayoutPreset merges features overrides", () => {
    const resolved = resolveLayoutPreset("enterprise", {
      features: { tenantSwitcher: false, themeToggle: true },
    });
    expect(resolved.features?.tenantSwitcher).toBe(false);
    expect(resolved.features?.themeToggle).toBe(true);
    // brand + navigation preserved from the enterprise preset
    expect(resolved.brand.name).toBe(enterpriseLayoutPreset.brand.name);
    expect(resolved.navigation.length).toBeGreaterThan(0);
  });

  it("throws on unknown layout preset", () => {
    expect(() => getLayoutPreset("nope")).toThrow(
      /Unknown layout preset "nope"/,
    );
  });
});
