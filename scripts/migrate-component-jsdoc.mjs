#!/usr/bin/env node
/**
 * One-time migration: add @category/@summary JSDoc to ui components that lack it.
 * Usage: node scripts/migrate-component-jsdoc.mjs [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uiDir = path.join(root, "packages/components/src/ui");
const dry = process.argv.includes("--dry");

// Category map mirrored from scripts/gen-docs-manifest.mjs (F9 source of truth
// until migration completes). Kept in sync manually for this one-time pass.
const CATEGORY = {
  accordion: "layout", breadcrumb: "layout", collapsible: "layout", menubar: "layout",
  navbar: "layout", "navigation-menu": "layout", pagination: "layout", "scroll-area": "layout",
  separator: "layout", sheet: "layout", tabs: "layout", alert: "feedback", "alert-dialog": "feedback",
  dialog: "feedback", "dropdown-menu": "feedback", "empty-state": "feedback", popover: "feedback",
  progress: "feedback", skeleton: "feedback", sonner: "feedback", spinner: "feedback",
  tooltip: "feedback", "context-menu": "feedback", checkbox: "inputs", combobox: "inputs",
  "country-code-input": "inputs", form: "inputs", input: "inputs", "input-otp": "inputs",
  label: "inputs", "mail-input": "inputs", "number-input": "inputs", "radio-group": "inputs",
  select: "inputs", slider: "inputs", switch: "inputs", textarea: "inputs", toggle: "inputs",
  "toggle-group": "inputs", "date-picker": "inputs", "date-input": "inputs",
  "date-range-picker": "inputs", "location-picker": "inputs", "mention-input": "inputs",
  "multi-combobox": "inputs", "otp-input": "inputs", "password-input": "inputs",
  "phone-input": "inputs", "range-slider": "inputs", "rating-input": "inputs",
  "rich-text-editor": "inputs", "tag-input": "inputs", avatar: "data-display",
  "avatar-group": "data-display", badge: "data-display", pill: "data-display", button: "data-display",
  "button-group": "data-display", card: "data-display", "data-table": "data-display", kbd: "data-display",
  table: "data-display", "notification-drawer": "data-display", "color-picker": "ready-to-use",
  chart: "ready-to-use", command: "ready-to-use", "consent-capture": "ready-to-use",
  "cookie-banner": "ready-to-use", dropzone: "ready-to-use", "infinite-scroll": "ready-to-use",
  marquee: "ready-to-use", "pricing-comparison": "ready-to-use", qrcode: "ready-to-use",
  "qr-scanner": "ready-to-use", roadmap: "ready-to-use", tree: "ready-to-use", animated: "animation",
  "text-animations": "animation", "micro-interactions": "animation", "animated-button": "animation",
  "card-animations": "animation", "shine-border-card": "animation", "aspect-ratio": "layout",
  carousel: "data-display", "input-group": "inputs", resizable: "layout", "feedback-page": "pages",
  footer: "pages", "billing-page": "pages", "billing-page-table": "pages",
  "billing-page-freemium": "pages", "not-found": "pages", "data-table-page": "pages",
  "empty-state-page": "pages", "wizard-form-page": "pages", "otp-verification-card": "ready-to-use",
  "two-factor-setup-panel": "ready-to-use", "password-strength-meter": "ready-to-use",
  "api-key-manager": "ready-to-use", "invite-team-form": "ready-to-use",
  "account-settings-panel": "ready-to-use", "security-section-card": "ready-to-use",
  "announcement-bar": "ready-to-use", "cookie-consent": "ready-to-use",
  "testimonial-showcase": "ready-to-use", "faq-section": "ready-to-use", "page-header": "ready-to-use",
  "stat-card": "ready-to-use", "activity-feed": "ready-to-use", "kanban-board": "ready-to-use",
  "changelog-card": "ready-to-use", "changelog-feed": "ready-to-use", stepper: "ready-to-use",
};

function humanize(slug) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

let changed = 0;
let skipped = 0;
for (const file of fs.readdirSync(uiDir).filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx")).sort()) {
  const slug = file.replace(/\.tsx$/, "");
  const full = path.join(uiDir, file);
  const src = fs.readFileSync(full, "utf-8");
  if (/@category\b/.test(src)) { skipped++; continue; }
  const category = CATEGORY[slug] ?? "general";
  const summary = humanize(slug);
  const block = `/**\n * @category ${category}\n * @summary ${summary}\n */\n`;
  const next = block + src;
  if (dry) {
    console.log(`would tag: ${slug} -> ${category}`);
  } else {
    fs.writeFileSync(full, next, "utf-8");
  }
  changed++;
}
console.log(`${dry ? "dry-run: " : ""}tagged ${changed} files, skipped ${skipped} already-tagged.`);