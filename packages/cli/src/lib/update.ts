/**
 * CLI self-update: check the npm registry for a newer @fusorb/facet-cli
 * release and show a pnpm-style notification box when one exists.
 *
 * The check is best-effort: it never blocks the CLI, never throws, and
 * respects CI + a 24h cache so the notification doesn't fire every run.
 */
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { statSync, writeFileSync } from "node:fs";
import { resolveLatestVersion } from "./registry.js";
import { compareVersions } from "./types.js";

const require = createRequire(import.meta.url);

const CLI_PACKAGE = "@fusorb/facet-cli";
const CHECK_CACHE_MS = 1000 * 60 * 60 * 24; // 24h between notifications

export interface CliVersionState {
  current: string;
  latest: string | undefined;
  outdated: boolean;
}

/** Read the current facet-cli version from the bundled package.json. */
export function currentCliVersion(): string {
  try {
    const mod = require("../package.json") as { version?: string };
    return mod.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/** Temp-file path for the update-cache timestamp. */
function cachePath(): string {
  return join(tmpdir(), "facet-cli-update-check");
}

function cacheAgeMs(): number {
  try {
    return Date.now() - statSync(cachePath()).mtimeMs;
  } catch {
    return Infinity;
  }
}

function touchCache(): void {
  try {
    writeFileSync(cachePath(), String(Date.now()));
  } catch {
    // best-effort: directory not writable etc.
  }
}

/**
 * Check for a newer facet-cli release. Returns the version state, or null
 * when the check should be skipped (CI, cache too fresh, network error).
 */
export async function checkForCliUpdate(): Promise<CliVersionState | null> {
  if (isCiEnvironment()) return null;
  if (cacheAgeMs() < CHECK_CACHE_MS) return null;

  const current = currentCliVersion();
  const latest = await resolveLatestVersion(CLI_PACKAGE);
  touchCache();

  if (!latest) return null;

  return {
    current,
    latest,
    outdated: compareVersions(current, latest) < 0,
  };
}

/** Print a pnpm-style boxed notification for a stale CLI. */
export function printUpdateNotification(state: CliVersionState): void {
  const updateCmd = globalInstallCommand();
  const line = "=".repeat(55);
  console.log("");
  console.log(line);
  console.log(`  facet-cli update available: ${state.current} -> ${state.latest}`);
  console.log(`  Run: ${updateCmd}`);
  console.log(line);
  console.log("");
}

/** True when running inside a CI environment where global installs are
 *  not appropriate (no interactive shell, no global write permissions). */
export function isCiEnvironment(): boolean {
  return process.env.CI === "true" || process.env.CI === "1";
}

/** Return the global update command for facet-cli.
 *  Prefers the PM that installed the CLI (detected via npm_config_user_agent),
 *  falling back to npm (always available). */
export function globalInstallCommand(): string {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.includes("pnpm")) return "pnpm add -g @fusorb/facet-cli@latest";
  if (ua.includes("yarn")) return "yarn global add @fusorb/facet-cli@latest";
  if (ua.includes("bun")) return "bun add -g @fusorb/facet-cli@latest";
  return "npm i -g @fusorb/facet-cli@latest";
}

/** Ephemeral command that runs the latest facet-cli without a global install.
 *  Works in restricted/CI environments that lack global write permissions. */
export function npxRunCommand(): string {
  return "npx @fusorb/facet-cli@latest";
}
