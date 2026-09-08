// Generates packages/docs/src/manifest.ts from the real component files,
// so the docs sidebar and component list stay in sync with the library.
//
// For each file in packages/components/src/ui/, emits:
//   { name, slug, description, category }
// where description is the first JSDoc block line (if any), falling back
// to the file base name. Non-`ui/` exports (icon registry, theme) are
// appended as "foundations" entries.
//
// Run: node scripts/gen-docs-manifest.mjs
// Writes: packages/docs/src/manifest.ts

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiDir = path.join(root, "packages/components/src/ui");
const outFile = path.join(root, "packages/docs/src/manifest.ts");

/** Sidebar sub-group for a component slug. */
const CATEGORY = {
  // Layout & navigation primitives
  accordion: "layout",
  breadcrumb: "layout",
  collapsible: "layout",
  menubar: "layout",
  navbar: "layout",
  "navigation-menu": "layout",
  pagination: "layout",
  "scroll-area": "layout",
  separator: "layout",
  sheet: "layout",
  tabs: "layout",
  // Feedback & overlay primitives
  alert: "feedback",
  "alert-dialog": "feedback",
  dialog: "feedback",
  "dropdown-menu": "feedback",
  "empty-state": "feedback",
  "hover-card": "feedback",
  popover: "feedback",
  progress: "feedback",
  skeleton: "feedback",
  sonner: "feedback",
  spinner: "feedback",
  tooltip: "feedback",
  "context-menu": "feedback",
  // Inputs & forms
  checkbox: "inputs",
  combobox: "inputs",
  "country-code-input": "inputs",
  form: "inputs",
  input: "inputs",
  "input-otp": "inputs",
  label: "inputs",
  "mail-input": "inputs",
  "number-input": "inputs",
  "radio-group": "inputs",
  select: "inputs",
  slider: "inputs",
  switch: "inputs",
  textarea: "inputs",
  toggle: "inputs",
  "toggle-group": "inputs",
  "date-picker": "inputs",
  "date-input": "inputs",
  "date-range-picker": "inputs",
  "location-picker": "inputs",
  "mention-input": "inputs",
  "multi-combobox": "inputs",
  "otp-input": "inputs",
  "password-input": "inputs",
  "phone-input": "inputs",
  "range-slider": "inputs",
  "rating-input": "inputs",
  "rich-text-editor": "inputs",
  "tag-input": "inputs",
  // Data display
  avatar: "data-display",
  "avatar-group": "data-display",
  badge: "data-display",
  pill: "data-display",
  button: "data-display",
  "button-group": "data-display",
  card: "data-display",
  "data-table": "data-display",
  kbd: "data-display",
  table: "data-display",
  "notification-drawer": "data-display",
  // Ready-to-use composites
  "color-picker": "ready-to-use",
  chart: "ready-to-use",
  command: "ready-to-use",
  "consent-capture": "ready-to-use",
  "cookie-banner": "ready-to-use",
  dropzone: "ready-to-use",
  "infinite-scroll": "ready-to-use",
  marquee: "ready-to-use",
  "pricing-comparison": "ready-to-use",
  qrcode: "ready-to-use",
  "qr-scanner": "ready-to-use",
  roadmap: "ready-to-use",
  tree: "ready-to-use",
  // Animation family (text + surfaces + micro-interactions + card effects)
  animated: "animation",
  // "typewriter-text" is excluded from the docs manifest; documented as
  // tabs on the text-animations page instead.
  "text-animations": "animation",
  "micro-interactions": "animation",
  "animated-button": "animation",
  "card-animations": "animation",
  "glow-border-card": "animation",
  "shine-border-card": "animation",
  // Composable building blocks
  "aspect-ratio": "layout",
  carousel: "data-display",
  drawer: "feedback",
  "input-group": "inputs",
  resizable: "layout",
  // Full page components (new "Pages" section)
  "feedback-page": "pages",
  footer: "pages",
  "billing-page": "pages",
  "billing-page-table": "pages",
   "billing-page-freemium": "pages",
   "not-found": "pages",
  "data-table-page": "pages",
  "empty-state-page": "pages",
  "wizard-form-page": "pages",
  // Ready-to-use: auth & security
  "otp-verification-card": "ready-to-use",
  "two-factor-setup-panel": "ready-to-use",
  "password-strength-meter": "ready-to-use",
  "api-key-manager": "ready-to-use",
  "invite-team-form": "ready-to-use",
  "account-settings-panel": "ready-to-use",
  "security-section-card": "ready-to-use",
  // Ready-to-use: marketing
  "announcement-bar": "ready-to-use",
  "cookie-consent": "ready-to-use",
  "testimonial-showcase": "ready-to-use",
  "faq-section": "ready-to-use",
  // Ready-to-use: dashboard
  "page-header": "ready-to-use",
  "stat-card": "ready-to-use",
  "activity-feed": "ready-to-use",
  // Ready-to-use: project & tracking
  "kanban-board": "ready-to-use",
  "changelog-list": "ready-to-use",
  // Headless-first primitives
  stepper: "ready-to-use",
};

/** Slugs excluded from the docs manifest entirely (documented elsewhere). */
const EXCLUDED = new Set(["typewriter-text"]);

function firstDocLine(filePath) {
  const src = fs.readFileSync(filePath, "utf-8");
  const m = src.match(/\/\*\*\s*\n\s*\*\s*([^*].*)/);
  if (!m) return "";
  return m[1].trim();
}

// "alert-dialog" -> "Alert Dialog"
function humanize(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const components = fs
  .readdirSync(uiDir)
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
  .filter((f) => !EXCLUDED.has(f.replace(/\.tsx$/, "")))
  .map((f) => f.replace(/\.tsx$/, ""))
  .sort()
  .map((name) => {
    const file = path.join(uiDir, `${name}.tsx`);
    const entry = {
      name: humanize(name),
      slug: name,
      description: firstDocLine(file),
      category: CATEGORY[name] ?? "general",
    };
    return entry;
  });

const foundations = [
  {
    name: "Icon",
    slug: "icon",
    description:
      "Semantic icon registry: built-in lucide map, registerIcon overrides, IconProvider per-domain overrides.",
    category: "foundations",
  },
  {
    name: "Theme",
    slug: "theme",
    description: "ThemeProvider / useTheme / ThemeToggle: light, dark, and system theming.",
    category: "foundations",
  },
];

const entries = [...components, ...foundations];

const body = `// AUTO-GENERATED by scripts/gen-docs-manifest.mjs, do not edit by hand.
// Regenerate with: node scripts/gen-docs-manifest.mjs

export interface DocsManifestEntry {
  name: string;
  slug: string;
  description: string;
  category: string;
}

export const docsManifest: DocsManifestEntry[] = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(outFile, body, "utf-8");
console.log(`✨ Wrote ${entries.length} entries to ${path.relative(root, outFile)}`);
