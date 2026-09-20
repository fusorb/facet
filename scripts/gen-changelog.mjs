/**
 * gen-changelog.mjs - generate apps/landing/src/data/changelog.ts
 *
 * Reads pending .changeset/*.md files and emits a data-driven changelog.
 * Historical entries are curated in the generator so the script is the
 * single source of truth. Run before build:
 *
 *   node scripts/gen-changelog.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BUMP_RANK = { patch: 0, minor: 1, major: 2 };

// Changesets already reflected in the curated HISTORICAL entries below.
const CONSUMED = new Set([
  "ready-to-use-components-1.12.md",
  "stepper-kanban-changelog.md",
]);

// ─── Historical (already released + curated) entries ───────────────────────
const HISTORICAL = [
  {
    version: "1.12.0",
    date: "2026-08-27",
    tag: "release",
    changes: [
      { kind: "added", text: "WizardFormPage - react-hook-form + zod + Stepper orchestration" },
      { kind: "added", text: "DateRangePicker - single-date and range modes with quick presets" },
      { kind: "added", text: "Chart - dependency-free line / bar / area chart in pure SVG" },
      { kind: "added", text: "EmptyStatePage - full-page empty state with CTA + illustration slot" },
      { kind: "added", text: "QrScanner - browser getUserMedia QR / barcode scanner" },
      { kind: "added", text: "ConsentCapture - scroll-to-accept legal consent + signature pad" },
      { kind: "added", text: "PricingComparison - mobile-friendly tier cards + feature matrix" },
      { kind: "added", text: "Tree - collapsible nested list with selection + keyboard nav" },
      { kind: "added", text: "MultiCombobox - multi-select chips with search + keyboard nav" },
      { kind: "added", text: "TagInput - free-form tag/chip input with separator / paste handling" },
      { kind: "added", text: "RangeSlider - two-thumb range slider with active-track highlight" },
      { kind: "added", text: "RatingInput - 5-star / N-item rating with half-star + keyboard" },
      { kind: "added", text: "CookieBanner - top-bar cookie notice with accept / reject / manage" },
      { kind: "added", text: "OtpInput - standalone OTP input with auto-advance + paste" },
      { kind: "added", text: "RichTextEditor - lightweight contenteditable + toolbar" },
      { kind: "added", text: "PhoneInput - country-code dropdown + E.164 formatting" },
      { kind: "added", text: "MentionInput - @mention autocomplete with paste handling" },
      { kind: "added", text: "ShineBorderCard - card with animated border shine" },
      { kind: "added", text: "GlowBorderCard - card with pulsing border glow" },
      { kind: "added", text: "PasswordStrengthMeter - standalone strength meter" },
      { kind: "added", text: "KanbanCard action menu (edit / duplicate / export / delete)" },
      { kind: "fixed", text: "Chart hover now tracks the nearest series" },
      { kind: "fixed", text: "Navbar hover dropdowns no longer blink" },
    ],
  },
  {
    version: "1.11.0",
    date: "2026-08-26",
    tag: "release",
    changes: [
      { kind: "added", text: "Stepper primitive (headless useStepper + StepperNav / StepperPanel / StepperFooter)" },
      { kind: "added", text: "KanbanBoard with native HTML5 drag-and-drop, move/add/remove cards" },
      { kind: "added", text: "ChangelogList with filter chips and kind-grouped bullets" },
      { kind: "fixed", text: "SignIn mfa_challenge wired to MfaVerifyForm" },
    ],
  },
  {
    version: "1.10.0",
    date: "2026-08-18",
    tag: "release",
    changes: [
      { kind: "added", text: "AccountSettingsPanel nav + section content" },
      { kind: "added", text: "SecuritySectionCard grid" },
      { kind: "added", text: "ActivityFeed + StatCard + PageHeader for console surfaces" },
      { kind: "changed", text: "NotFound component gains gradient animation variant" },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-08-12",
    tag: "release",
    changes: [
      { kind: "added", text: "FaqSection component" },
      { kind: "added", text: "IconRegistry (IconProvider / Icon / registerIcon)" },
      { kind: "fixed", text: "Billing interval toggle now honors the active state" },
      { kind: "removed", text: "Storybook + 48 story fixtures (replaced by docs inventory drift gate)" },
    ],
  },
];

// ─── Changeset parsing ─────────────────────────────────────────────────────

/** Infer change kind from both bump type and body content. */
function inferKind(bumps, body) {
  const b = body.toLowerCase();
  if (b.includes("fix") || b.includes("correct") || b.includes("bail") ||
      b.includes("jitter") || b.includes("blink") || b.includes("align") ||
      b.includes("tracking") || b.includes("snap") || b.includes("reconcile"))
    return "fixed";
  if (b.includes("evolve") || b.includes("rebuild") || b.includes("de-brand") ||
      b.includes("de-brand") || b.includes("neutralize") || b.includes("migration") ||
      b.includes("migrate") || b.includes("removed") || b.includes("drop") ||
      b.includes("removing"))
    return "changed";
  if (b.includes("add") || b.includes("new") || b.includes("introduce") ||
      b.includes("preset") || b.includes("scaffold") || b.includes("export"))
    return "added";
  const rank = Math.max(...bumps.map((x) => BUMP_RANK[x] ?? 0));
  if (rank === 2) return "changed";
  if (rank === 1) return "added";
  return "fixed";
}

/** Extract a concise description from the changeset body. */
function extractText(body) {
  const lines = body.trim().split("\n");
  let summary = "";
  let detail = "";
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;           // skip markdown headings
    if (t.startsWith("- ")) {
      if (!detail) detail = t.slice(2);        // first bullet = detail
      break;
    }
    if (t.startsWith("**")) {
      // "**Label**: description" → use the description part
      const m = t.match(/^\*\*[\w-]+\*\*\s*:?\s*(.+)/);
      if (m) { if (!detail) detail = m[1]; break; }
    }
    // First non-heading, non-bullet line = summary
    if (!summary) summary = t;
  }
  let text = summary || detail;
  // If summary ended with ":", drop the colon
  text = text.replace(/:$/, "").trim();
  // Clean markdown
  text = text.replace(/\*\*/g, "").replace(/`/g, "").replace(/\\/g, "");
  // Deduplicate the summary+detail (avoid "Summary: Summary detail")
  if (detail && summary && detail.startsWith(summary)) {
    text = detail;
  }
  // Truncate
  if (text.length > 200) text = text.substring(0, 197) + "...";
  return text || "See changeset for details";
}

function parseChangeset(file) {
  const raw = readFileSync(file, "utf8");
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return null;
  const [, fm, body] = fmMatch;
  const bumps = [];
  for (const line of fm.split("\n")) {
    const m = line.match(/^"(.+?)":\s*(\w+)/);
    if (m) bumps.push(m[2]);
  }
  if (bumps.length === 0) return null;
  const kind = inferKind(bumps, body);
  const text = extractText(body);
  return { kind, text };
}

function generate() {
  const changesetDir = join(ROOT, ".changeset");
  const files = readdirSync(changesetDir).filter(
    (f) => f.endsWith(".md") && f !== "README.md" && !CONSUMED.has(f),
  );

  const changes = [];
  for (const f of files) {
    const parsed = parseChangeset(join(changesetDir, f));
    if (parsed) changes.push(parsed);
  }

  // Determine release version from highest bump
  const changesetData = new Set();
  for (const f of files) {
    const raw = readFileSync(join(changesetDir, f), "utf8");
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    for (const line of fmMatch[1].split("\n")) {
      const m = line.match(/^"(.+?)":\s*(\w+)/);
      if (m) changesetData.add(m[2]);
    }
  }
  const hasMajor = changesetData.has("major");
  const hasMinor = changesetData.has("minor");

  const version = hasMajor
    ? "2.0.0"
    : hasMinor
      ? "1.13.0"
      : "1.12.1";

  const today = new Date().toISOString().split("T")[0];

  // Sort changes by kind for readability
  const order = ["added", "changed", "fixed", "removed"];
  changes.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

  const pending = {
    version,
    date: today,
    tag: "release",
    title: `${version} - Facet workspace evolution`,
    changes,
  };

  const all = [pending, ...HISTORICAL];

  const out = `// AUTO-GENERATED by scripts/gen-changelog.mjs, do not edit by hand.
// Regenerate with: node scripts/gen-changelog.mjs
//
// Historical entries are curated in the generator. Pending entries are
// generated from .changeset/*.md files.

import type { ChangelogRelease } from "@fusorb/facet-components";

export const changelog: ChangelogRelease[] = ${JSON.stringify(all, null, 2)};
`;

  const outPath = join(ROOT, "apps/landing/src/data/changelog.ts");
  writeFileSync(outPath, out + "\n");
  console.log(`Generated changelog: v${version} (${today}) with ${changes.length} changes, plus ${HISTORICAL.length} historical releases.`);
}

generate();
