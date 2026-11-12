#!/usr/bin/env node
/**
 * Keeps the two version claims in the root README.md in sync with each package's
 * package.json version:
 *
 *   1. the package table's `✅ <version>` cells
 *   2. the "Current versions:" summary line
 *
 * This exists because `changeset version` bumps the manifests and leaves both
 * pointing at the previous release, which failed `pnpm check:readme` on main and
 * - because the publish job is gated on `ci` - blocked the release entirely.
 *
 * It is wired into the release flow rather than left to a developer: the root
 * `version-packages` script runs it immediately after `changeset version`, and
 * `.github/workflows/ci-cd.yml` passes that as the `version-script` of
 * changesets/action. The action commits everything the script changed, so the
 * "Version Packages" PR carries the updated README and passes the check on its
 * own. There is no `version` lifecycle hook to lean on here: the installed
 * @changesets/cli has no process spawning at all, so it would never be invoked.
 *
 * Deliberately never exits non-zero. This runs inside the release job, and a
 * documentation shape it doesn't recognise must not be able to block a release.
 * `pnpm check:readme` in CI is the backstop that makes any remaining drift
 * visible.
 *
 * Run: node scripts/sync-readme-versions.mjs   (or: pnpm sync:readme)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readmePath = path.join(root, "README.md");
const lines = fs.readFileSync(readmePath, "utf-8").split("\n");

const packageDirs = fs
  .readdirSync(path.join(root, "packages"))
  .filter((d) => fs.existsSync(path.join(root, "packages", d, "package.json")));

/** Short name as used in the summary line -> published version. */
const shortVersions = new Map();
const updated = [];

for (const dir of packageDirs) {
  const pj = JSON.parse(
    fs.readFileSync(path.join(root, "packages", dir, "package.json"), "utf-8"),
  );
  const { name, version } = pj;
  if (!name || !name.startsWith("@fusorb/") || !version) continue;

  shortVersions.set(name.slice("@fusorb/facet-".length), version);

  // The table row whose first cell is this package name - the same rule
  // check-readme uses, so a description naming another package cannot confuse it.
  const i = lines.findIndex((line) => line.trimStart().startsWith(`| \`${name}\``));
  if (i === -1) continue; // not in the table (e.g. private/workspace-only)

  const current = lines[i].match(/✅\s*(\d+\.\d+\.\d+)/);
  if (!current) continue; // a row without a version cell, e.g. the private one

  if (current[1] === version) continue;

  // Replace just the version, keeping the cell's trailing padding. A longer
  // version widens the row by a character, which markdown does not care about.
  lines[i] = lines[i].replace(/✅\s*\d+\.\d+\.\d+/, `✅ ${version}`);
  updated.push(`table ${name}: ${current[1]} -> ${version}`);
}

// The "Current versions:" summary line: rewrite "<short> <x.y.z>" in place.
const summaryIndex = lines.findIndex((line) => line.startsWith("Current versions:"));
if (summaryIndex !== -1) {
  lines[summaryIndex] = lines[summaryIndex].replace(
    /\b([a-z][a-z-]*) (\d+\.\d+\.\d+)/g,
    (match, short, version) => {
      const latest = shortVersions.get(short);
      if (!latest || latest === version) return match;
      updated.push(`summary ${short}: ${version} -> ${latest}`);
      return `${short} ${latest}`;
    },
  );
}

if (updated.length > 0) {
  fs.writeFileSync(readmePath, lines.join("\n"));
  console.log(`sync-readme-versions: updated ${updated.length} version mention(s) in README.md`);
  for (const line of updated) console.log(`  ${line}`);
} else {
  console.log("sync-readme-versions: README.md already in sync");
}
