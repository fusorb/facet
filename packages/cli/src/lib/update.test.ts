import { describe, expect, it } from "vitest";
import {
  currentCliVersion,
  globalInstallCommand,
  checkForCliUpdate,
  isCiEnvironment,
  npxRunCommand,
} from "./update.js";

describe("currentCliVersion", () => {
  it("returns a valid semver string from package.json", () => {
    const v = currentCliVersion();
    expect(v).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("globalInstallCommand", () => {
  it("returns a global install command for @fusorb/facet-cli", () => {
    const cmd = globalInstallCommand();
    expect(cmd).toContain("@fusorb/facet-cli@latest");
    // One of the supported global install patterns.
    expect(cmd).toMatch(/^(npm i -g|pnpm add -g|bun add -g|yarn global add)/);
  });
});

describe("npxRunCommand", () => {
  it("returns an npx command for @fusorb/facet-cli", () => {
    expect(npxRunCommand()).toBe("npx @fusorb/facet-cli@latest");
  });
});

describe("isCiEnvironment", () => {
  it("returns true when CI=true", () => {
    const prev = process.env.CI;
    process.env.CI = "true";
    try {
      expect(isCiEnvironment()).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.CI;
      else process.env.CI = prev;
    }
  });

  it("returns true when CI=1", () => {
    const prev = process.env.CI;
    process.env.CI = "1";
    try {
      expect(isCiEnvironment()).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.CI;
      else process.env.CI = prev;
    }
  });

  it("returns false when CI is unset", () => {
    const prev = process.env.CI;
    delete process.env.CI;
    try {
      expect(isCiEnvironment()).toBe(false);
    } finally {
      if (prev !== undefined) process.env.CI = prev;
    }
  });
});

describe("checkForCliUpdate", () => {
  it("returns null in CI environments when CI=true", async () => {
    const prev = process.env.CI;
    process.env.CI = "true";
    try {
      const state = await checkForCliUpdate();
      expect(state).toBeNull();
    } finally {
      if (prev === undefined) delete process.env.CI;
      else process.env.CI = prev;
    }
  });

  it("returns null in CI environments when CI=1", async () => {
    const prev = process.env.CI;
    process.env.CI = "1";
    try {
      const state = await checkForCliUpdate();
      expect(state).toBeNull();
    } finally {
      if (prev === undefined) delete process.env.CI;
      else process.env.CI = prev;
    }
  });
});
