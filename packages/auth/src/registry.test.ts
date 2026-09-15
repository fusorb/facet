/**
 * Preset registry tests: registerPreset / getPreset / resolvePreset.
 */

import { describe, it, expect } from "vitest";

import {
  registerPreset,
  getPreset,
  hasPreset,
  listPresets,
  resolvePreset,
  defaultPreset,
  fintechPreset,
} from "./index.js";

describe("preset registry", () => {
  it("exposes the five built-in presets", () => {
    expect(listPresets()).toEqual(
      expect.arrayContaining([
        "fintech",
        "med",
        "edu",
        "enterprise",
        "default",
      ]),
    );
    expect(hasPreset("fintech")).toBe(true);
    expect(getPreset("fintech")).toEqual(fintechPreset);
  });

  it("registers a custom preset and resolves it", () => {
    registerPreset("gov", {
      requireMfa: true,
      allowPasskey: false,
      allowMagicLink: false,
      sessionTtl: 20,
      requireEmailVerification: true,
      requireStepUp: true,
      oauthProviders: ["saml"],
    });

    expect(hasPreset("gov")).toBe(true);
    expect(getPreset("gov").sessionTtl).toBe(20);
    expect(getPreset("gov").oauthProviders).toEqual(["saml"]);
  });

  it("allows overriding a built-in preset", () => {
    registerPreset("fintech", { ...fintechPreset, sessionTtl: 10 });
    expect(getPreset("fintech").sessionTtl).toBe(10);
  });

  it("throws on unknown preset", () => {
    expect(() => getPreset("nope")).toThrow(/Unknown auth preset "nope"/);
  });

  it("resolvePreset accepts a name or inline config and applies overrides", () => {
    const resolved = resolvePreset("edu", { sessionTtl: 720 });
    expect(resolved.sessionTtl).toBe(720);
    // edu defaults preserved
    expect(resolved.allowPasskey).toBe(true);
    expect(resolved.oauthProviders).toEqual(["google", "microsoft", "clever"]);

    const inline = resolvePreset({ ...defaultPreset, requireMfa: true });
    // default preset fills the gaps
    expect(inline.requireMfa).toBe(true);
    expect(inline.sessionTtl).toBe(defaultPreset.sessionTtl);
  });
});
