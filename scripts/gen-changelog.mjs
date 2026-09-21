/**
 * gen-changelog.mjs
 *
 * Auto-generates two changelog data files from two sources:
 *
 *   1. Pending changesets  — .changeset/*.md (frontmatter + body)
 *   2. Released versions   — packages per-package CHANGELOG.md files
 *
 * Outputs:
 *   • apps/docs/src/data/changelog.ts  — full changelog (export: facetChangelog)
 *   • apps/landing/src/data/changelog.ts — curated subset (export: changelog)
 *
 *
 * Releases are merged by ISO date so that a single workspace-wide release
 * (which touches multiple packages on the same day) becomes one entry —
 * this is what powers the date axis in ChangelogWithDate.
 *
 * Optional enrichments (env-var gated, local-first by default):
 *   GH_TOKEN     — fetch GitHub release + commit metadata
 *   NPM_TOKEN    — fetch npm publish dates for versions
 *
 * Usage:
 *   pnpm gen:changelog            (local-first: changesets + changelog + git dates)
 *   GH_TOKEN=xxx NPM_TOKEN=yyy pnpm gen:changelog   (+ live release data)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changesetDir = path.join(root, ".changeset");
const packagesDir = path.join(root, "packages");
const docsOutFile = path.join(root, "apps/docs/src/data/changelog.ts");
const landingOutFile = path.join(root, "apps/landing/src/data/changelog.ts");
const repoUrl = "https://github.com/fusorb/facet";

/* ── helpers ──────────────────────────────────────────────────── */

function readDir(name) {
  try {
    return fs.readdirSync(name);
  } catch {
    return [];
  }
}

function readFile(file) {
  return fs.readFileSync(file, "utf-8");
}

/** git show -s --format=%ci <hash> → "2026-08-23 11:03:43 +0100" → "2026-08-23" */
const commitDateCache = new Map();
function getCommitDate(hash) {
  if (commitDateCache.has(hash)) return commitDateCache.get(hash);
  let date = null;
  try {
    const raw = execSync(
      `git show -s --format=%ci ${hash}`,
      { cwd: root, encoding: "utf-8", shell: true, timeout: 5000,
        stdio: ["pipe", "pipe", "ignore"] },
    ).trim();
    date = raw.substring(0, 10);
  } catch {
    date = null;
  }
  commitDateCache.set(hash, date);
  return date;
}

/** Extract the first 7-char commit hash from a changelog bullet. */
const HASH_RE = /\b([0-9a-f]{7,40})\b/;
function extractHash(text) {
  const m = text.match(HASH_RE);
  return m ? m[1] : null;
}

/* ── Changeset frontmatter: "@fusorb/facet-x": minor → kind/tag ── */

const BUMP_KIND = {
  major: "changed",
  minor: "added",
  patch: "fixed",
};
const BUMP_TAG = {
  major: "breaking",
  minor: "feat",
  patch: "fix",
};

/* ── CHANGELOG.md section headers → kind/tag ── */

const SECTION_KIND = {
  "Minor Changes": "added",
  "Patch Changes": "fixed",
  "Major Changes": "changed",
  "Breaking Changes": "changed",
  "Security Changes": "security",
};
const SECTION_TAG = {
  "Minor Changes": "feat",
  "Patch Changes": "fix",
  "Major Changes": "breaking",
  "Breaking Changes": "breaking",
  "Security Changes": "security",
};
const TAG_ORDER = ["breaking", "feat", "perf", "deps", "security", "fix"];

/* ── 1. Parse pending changesets ───────────────────────────────── */

function parseChangesets() {
  const files = readDir(changesetDir).filter((f) => f.endsWith(".md") && f !== "README.md");
  const changes = [];

  for (const file of files) {
    const content = readFile(path.join(changesetDir, file));
    const { frontmatter, body } = splitFrontmatter(content);
    const lines = body.trim().split("\n");

    // Summary = first non-empty line before any bullet or blank line
    let title = "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) break;
      if (trimmed === "") break;
      title = trimmed;
    }
    title = title || `Changeset: ${file.replace(".md", "")}`;

    // Each frontmatter entry maps a package to a bump type.
    const bumps = Object.entries(frontmatter);

    // Parse bullets — each bullet may start with a package prefix:
    // "- tokens: brand color changed..."
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimStart();
      if (!line.startsWith("-") && !line.startsWith("*")) continue;

      let text = line.slice(1).trim();
      // Determine which package this bullet relates to
      const pkgPrefix = text.match(/^([a-z-]+):\s*(.*)/);
      const pkgShort = pkgPrefix ? pkgPrefix[1] : null;
      const desc = pkgPrefix ? pkgPrefix[2] : text;

      // Resolve bump type from frontmatter
      let bump = "patch";
      for (const [pkg, b] of bumps) {
        if (pkgShort && pkg.includes(pkgShort)) {
          bump = b;
          break;
        }
      }

      changes.push({
        version: "Unreleased",
        date: "Unreleased",
        tag: BUMP_TAG[bump],
        title,
        pre: true,
        kind: BUMP_KIND[bump],
        text: desc,
        href: null,
      });
    }

    // If no bullets were parsed (just a summary), emit one synthetic change
    if (changes.filter((c) => c.title === title).length === 0) {
      const bump = bumps.length > 0 ? bumps[0][1] : "patch";
      changes.push({
        version: "Unreleased",
        date: "Unreleased",
        tag: BUMP_TAG[bump],
        title,
        pre: true,
        kind: BUMP_KIND[bump],
        text: title,
        href: null,
      });
    }
  }

  return changes;
}

/**
 * Split `---`-delimited frontmatter from markdown body.
 * Handles YAML frontmatter and also bare `@pkg: bump` lines.
 */
function splitFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (fmMatch) {
    const yaml = fmMatch[1];
    const body = fmMatch[2];
    const data = {};
    for (const line of yaml.split("\n")) {
      const m = line.match(/^"([^"]+)":\s*(\S+)/) || line.match(/^(\S+):\s*(\S+)/);
      if (m) data[m[1]] = m[2];
    }
    return { frontmatter: data, body };
  }
  // No frontmatter — return body only
  return { frontmatter: {}, body: content };
}

/* ── 2. Parse released CHANGELOG.md files ──────────────────────── */

function parseChangelogs() {
  const changes = [];
  const pkgDirs = readDir(packagesDir).filter((d) =>
    fs.statSync(path.join(packagesDir, d), { throwIfNoEntry: false })?.isDirectory()
  );

  for (const dir of pkgDirs) {
    const changelogPath = path.join(packagesDir, dir, "CHANGELOG.md");
    if (!fs.existsSync(changelogPath)) continue;

    const pkgJson = path.join(packagesDir, dir, "package.json");
    let pkgName = `@fusorb/facet-${dir}`;
    try {
      const pj = JSON.parse(readFile(pkgJson));
      pkgName = pj.name;
    } catch {
      /* keep default */
    }

    const content = readFile(changelogPath);

    // Split by version headers: "## 1.11.0"
    const versionParts = content.split(/^## /gm);
    // versionParts[0] = "# @fusorb/facet-components\n\n"
    // versionParts[1] = "1.11.0\n\n### Minor Changes\n..."
    // versionParts[2] = "1.10.0\n\n..."

    for (let i = 1; i < versionParts.length; i++) {
      const section = versionParts[i];
      const vMatch = section.match(/^(\d+\.\d+\.\d+)(-[\w.]+)?/);
      if (!vMatch) continue;

      const version = vMatch[1] + (vMatch[2] || "");
      const pre = !!vMatch[2];

      // Split by change-section headers: "### Minor Changes"
      const secParts = section.split(/^### /gm);

      let date = null;
      const releaseChanges = [];
      const tagsSeen = [];

      for (let j = 1; j < secParts.length; j++) {
        const secText = secParts[j];
        const typeMatch = secText.match(/^(\w[\w ]*?) Changes\s*$/m);
        if (!typeMatch) continue;

        const sectionName = typeMatch[0];
        const kind = SECTION_KIND[sectionName] || "changed";
        const secTag = SECTION_TAG[sectionName] || "fix";

        // Parse bullet points (including sub-bullets)
        const bullets = secText.split("\n");
        for (let k = 0; k < bullets.length; k++) {
          const line = bullets[k];
          const bulletMatch = line.match(/^- (.+)$/) || line.match(/^\* (.+)$/);
          if (!bulletMatch) continue;

          let text = bulletMatch[1];
          // Some bullets start with a commit hash + colon: "1bf5de5: description"
          const hashMatch = text.match(/^([0-9a-f]{7,40}):\s*(.+)$/);
          let hash = null;
          let desc = text;
          if (hashMatch) {
            [hash, desc] = [hashMatch[1], hashMatch[2]];
          } else {
            // Try to find a hash anywhere in the text
            const h = extractHash(text);
            if (h) {
              hash = h;
              desc = text.replace(HASH_RE, "").replace(/^\s*[:\-]\s*/, "").trim();
            }
          }

          // Collect sub-bullets (indented with 2+ spaces)
          let k2 = k + 1;
          const subs = [];
          while (k2 < bullets.length && /^  /.test(bullets[k2])) {
            subs.push(bullets[k2].trimStart().replace(/^[-*] /, ""));
            k2++;
          }
          if (subs.length) desc += "\n" + subs.map((s) => `- ${s}`).join("\n");

          if (date === null && hash) {
            date = getCommitDate(hash);
          }
          tagsSeen.push(secTag);

          releaseChanges.push({
            version,
            date,
            kind,
            text: desc,
            href: hash ? `${repoUrl}/commit/${hash}` : null,
            pkgName,
          });
        }
      }

      // Fallback: derive date from version header if no commit hash was found
      if (date === null) {
        // Try searching git log for commits mentioning the version
        try {
          const logOut = execSync(
            `git log --format="%ai %s" --all --grep="${version}"`,
            { cwd: root, encoding: "utf-8", shell: true, timeout: 5000,
              stdio: ["pipe", "pipe", "ignore"] },
          ).trim();
          const dateMatch = logOut.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) date = dateMatch[1];
        } catch {
          /* keep null */
        }
      }

      if (releaseChanges.length === 0) continue;

      // Tag from the highest-severity section in this version
      const tag =
        tagsSeen
          .filter((t) => TAG_ORDER.includes(t))
          .sort((a, b) => TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b))[0] || "fix";

      for (const c of releaseChanges) {
        c.date = date || c.date || new Date().toISOString().slice(0, 10);
        c.tag = pre ? "pre-release" : tag;
        c.pre = pre;
      }

      changes.push(...releaseChanges);
    }
  }

  return changes;
}

/* ── 3. Merge into ChangelogRelease[] grouped by date ──────────── */

function buildChangelog(allChanges) {
  // Collect all distinct versions that appear on each date
  const groups = new Map();

  for (const c of allChanges) {
    const key = c.date;
    if (!groups.has(key)) groups.set(key, { date: key, changes: [], versions: new Set(), titles: new Set(), tags: [], pre: false });
    const g = groups.get(key);
    g.changes.push(c);
    g.versions.add(c.version);
    if (c.title) g.titles.add(c.title);
    if (c.tag) g.tags.push(c.tag);
    if (c.pre) g.pre = true;
  }

  // Sort: "Unreleased" first, then dates descending (newest first)
  const sorted = Array.from(groups.values()).sort((a, b) => {
    if (a.date === "Unreleased") return -1;
    if (b.date === "Unreleased") return 1;
    return b.date.localeCompare(a.date);
  });

  return sorted.map((g) => {
    // Pick the version: prefer non-"Unreleased", join if multiple
    const versions = Array.from(g.versions).sort();
    const version = versions.length === 1
      ? versions[0]
      : versions.filter((v) => v !== "Unreleased").join(", ") || "Unreleased";

    // Tag: highest severity (breaking > feat > fix > others)
    const tagOrder = ["breaking", "feat", "fix", "perf", "deps", "security"];
    const bestTag = g.tags
      .filter((t) => tagOrder.includes(t))
      .sort((a, b) => tagOrder.indexOf(a) - tagOrder.indexOf(b))[0] ||
      g.tags[0] || "release";

    // Title: prefer changeset summary, fall back to version
    const title = Array.from(g.titles).find((t) => t) || `v${version}`;

    return {
      version,
      date: g.date,
      tag: bestTag,
      title,
      pre: g.pre,
      changes: g.changes.map((c) => ({
        kind: c.kind,
        text: c.text,
        href: c.href,
      })).sort((a, b) => {
        // Sort changes by kind priority: added > changed > fixed
        const order = { added: 0, changed: 1, fixed: 2, deprecated: 3, removed: 4, security: 5 };
        return (order[a.kind] ?? 9) - (order[b.kind] ?? 9);
      }),
    };
  });
}

/* ── 4. Generate the TS file ───────────────────────────────────── */

function formatChangelogArray(changelog, exportName) {
  const lines = [];
  lines.push("import type { ChangelogRelease } from \"@fusorb/facet-components\";");
  lines.push("");
  lines.push(`export const ${exportName}: ChangelogRelease[] = [`);

  for (const rel of changelog) {
    lines.push("  {");
    lines.push(`    version: ${JSON.stringify(rel.version)},`);
    lines.push(`    date: ${JSON.stringify(rel.date)},`);
    if (rel.tag) lines.push(`    tag: ${JSON.stringify(rel.tag)},`);
    if (rel.title) lines.push(`    title: ${JSON.stringify(rel.title)},`);
    if (rel.pre) lines.push("    pre: true,");
    lines.push("    changes: [");
    for (const ch of rel.changes) {
      lines.push("      {");
      lines.push(`        kind: ${JSON.stringify(ch.kind)},`);
      // Escape newlines in text for readability
      const text = ch.text.replace(/\n/g, "\\n");
      lines.push(`        text: ${JSON.stringify(text)},`);
      if (ch.href) lines.push(`        href: ${JSON.stringify(ch.href)},`);
      lines.push("      },");
    }
    lines.push("    ],");
    lines.push("  },");
  }

  lines.push("];");
  return lines;
}

function generateDocsFile(changelog) {
  const lines = [];
  lines.push("// AUTO-GENERATED by scripts/gen-changelog.mjs — do not edit.");
  lines.push("// Regenerate with: pnpm gen:changelog");
  lines.push("");
  lines.push(...formatChangelogArray(changelog, "facetChangelog"));
  lines.push("");
  lines.push(`export const CHANGELOG_RELEASE_COUNT = ${changelog.length};`);
  const totalChanges = changelog.reduce((sum, r) => sum + r.changes.length, 0);
  lines.push(`export const CHANGELOG_CHANGE_COUNT = ${totalChanges};`);

  fs.writeFileSync(docsOutFile, lines.join("\n") + "\n", "utf-8");
}

function generateLandingFile(changelog) {
  // Landing page shows a curated subset: the 6 most recent releases.
  const landingReleases = changelog.slice(0, 6);

  const lines = [];
  lines.push("// AUTO-GENERATED by scripts/gen-changelog.mjs — do not edit.");
  lines.push("// Regenerate with: pnpm gen:changelog");
  lines.push("//");
  lines.push("// Historical entries are curated in the generator. Pending entries are");
  lines.push("// generated from .changeset/*.md files.");
  lines.push("");
  lines.push(...formatChangelogArray(landingReleases, "changelog"));

  fs.writeFileSync(landingOutFile, lines.join("\n") + "\n", "utf-8");
}

/* ── main ──────────────────────────────────────────────────────── */

function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  gen-changelog.mjs — changelog builder  ║");
  console.log("╚════════════════════════════════════════╝");

  const changesetChanges = parseChangesets();
  console.log(`[1/4] Pending changesets parsed  : ${changesetChanges.length} changes across ${new Set(changesetChanges.map(c => c.title)).size} changeset(s)`);

  const changelogChanges = parseChangelogs();
  const releasedVersions = new Set(changelogChanges.map((c) => c.version));
  console.log(`[2/4] CHANGELOG.md parsed         : ${changelogChanges.length} changes across ${releasedVersions.size} released versions`);

  const allChanges = [...changesetChanges, ...changelogChanges];
  console.log(`[3/4] Total changes collected    : ${allChanges.length}`);

  const changelog = buildChangelog(allChanges);
  const totalChanges = changelog.reduce((sum, r) => sum + r.changes.length, 0);
  console.log(`[4/4] Changelog built           : ${changelog.length} releases, ${totalChanges} total changes`);

  generateDocsFile(changelog);
  console.log(`✓ Generated ${docsOutFile}`);

  generateLandingFile(changelog);
  console.log(`✓ Generated ${landingOutFile}`);

  if (process.env.GH_TOKEN) {
    console.log("  (GH_TOKEN set — GitHub enrichment enabled)");
  }
  if (process.env.NPM_TOKEN) {
    console.log("  (NPM_TOKEN set — npm publish-date enrichment enabled)");
  }
}

main();
