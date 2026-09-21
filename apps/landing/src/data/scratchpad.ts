/**
 * Data module adapted from the facet scratchpad SPA design.
 *
 * These structures power the borrowed UI sections (Architecture,
 * Motion preview, Token explorer) and the dedicated route pages
 * (Component Catalog, Auth Lab, Motion Lab, Token Explorer).
 *
 * Package versions come from the auto-generated site-data layer so
 * the landing never shows a stale version string.
 */

import type { SystemNode } from "@fusorb/facet-components";
import { SITE_PACKAGES } from "./site-data.generated.js";

// ─── System Layers ────────────────────────────────────────────────────────────

/**
 * Facet is structured in four composable layers.  Each layer builds on
 * the one below and every layer is independently usable.
 */
export const SYSTEM_LAYERS: SystemNode[] = [
  {
    id: "application",
    label: "Application",
    sub: "your product",
    desc:
      "Built with facet. Owned by you - configure tokens, swap presets, " +
      "and override slots without touching upstream source.",
    icon: "layout-dashboard",
    color: "oklch(0.82 0.13 220)",
    children: [
      {
        id: "domain",
        label: "Auth · Layout · Motion",
        sub: "domain layer",
        desc:
          "Domain-customizable product surfaces and shells. Presets for " +
          "fintech, healthcare, and education - or bring your own.",
        icon: "layers",
        color: "oklch(0.65 0.2 160)",
        children: [
          {
            id: "components",
            label: "Components",
            sub: "@fusorb/facet-components",
            pkg: "@fusorb/facet-components",
            desc: "114+ primitives, composed surfaces, and ready-to-use pages. Every component is independently versionable.",
            icon: "boxes",
            color: "oklch(0.72 0.18 270)",
            children: [
              {
                id: "tokens",
                label: "Tokens",
                sub: "@fusorb/facet-tokens",
                pkg: "@fusorb/facet-tokens",
                desc: "Color, typography, spacing, radius, motion - the source of truth.",
                icon: "palette",
                color: "oklch(0.78 0.16 75)",
              },
            ],
          },
        ],
      },
    ],
  },
];

/** The three customization axes - how consumers tailor facet to their brand. */
export const CUSTOMIZATION_AXES = [
  {
    axis: "appearance",
    label: "Styling",
    desc: "Swap the Alpha Palette, fonts, and surface colors via CSS custom properties.",
    color: "oklch(0.75 0.15 230)",
  },
  {
    axis: "config",
    label: "Behavior",
    desc: "Pass domain presets (fintech, med, edu) to change motion and auth behavior.",
    color: "oklch(0.72 0.18 140)",
  },
  {
    axis: "slots",
    label: "Structure",
    desc: "Override individual component sub-elements through render slots and props.",
    color: "oklch(0.78 0.18 290)",
  },
];

// ─── Packages (ecosystem layers) ──────────────────────────────────────────────

export interface PackageInfo {
  name: string;
  short: string;
  desc: string;
  layer: number;
  status: "stable" | "experimental";
  version: string;
  colorClass: string;
}

const LAYER_LABELS = [
  "Foundation",
  "UI Layer",
  "Domain Layer",
  "Infrastructure",
  "Toolchain",
];

const PACKAGE_LAYER: Record<string, number> = {
  tokens: 0,
  components: 1,
  auth: 2,
  layout: 2,
  motion: 2,
  sdk: 3,
  store: 3,
  emails: 4,
  docs: 4,
  cli: 4,
  sandbox: 4,
  native: 4,
};

const PACKAGE_STATUS: Record<string, "stable" | "experimental"> = {
  sandbox: "experimental",
  native: "experimental",
};

/** Color used to tint each package's badge in the ecosystem view. */
const PACKAGE_COLOR: Record<string, string> = {
  tokens: "text-emerald-400",
  components: "text-sky-400",
  auth: "text-violet-400",
  layout: "text-blue-400",
  motion: "text-pink-400",
  sdk: "text-amber-400",
  store: "text-orange-400",
  docs: "text-slate-400",
  emails: "text-slate-400",
  cli: "text-slate-400",
  sandbox: "text-slate-400",
  native: "text-slate-400",
};

const PACKAGE_DESCRIPTIONS: Record<string, string> = {
  tokens: "Design tokens - color, spacing, radius, motion",
  components: "114+ production-ready UI surfaces",
  auth: "Domain-customizable auth state machine",
  layout: "ConsoleLayout, AuthLayout, LandingLayout + router",
  motion: "Composable animation engine with domain presets",
  sdk: "Domain SDK client - auth, tenant, identity",
  store: "Framework-agnostic auth + tenant state",
  docs: "Installable documentation engine",
  emails: "Email renderer + React bridge",
  cli: "Component copy, icon gen, package audit",
  sandbox: "Framework-agnostic code preview",
  native: "React Native motion bridge",
};

/**
 * Build the full package list from the generated site data (versions) plus
 * the layer/status/color metadata that site-data doesn't track.
 */
export const PACKAGES: PackageInfo[] = (() => {
  const byShort: Record<string, string> = {};
  for (const pkg of SITE_PACKAGES) {
    const short = pkg.name.replace("@fusorb/facet-", "");
    byShort[short] = pkg.version;
  }

  return Object.keys(PACKAGE_LAYER).map((short) => ({
    name: `@fusorb/facet-${short}`,
    short,
    desc: PACKAGE_DESCRIPTIONS[short] ?? "",
    layer: PACKAGE_LAYER[short] ?? 4,
    status: PACKAGE_STATUS[short] ?? "stable",
    version: byShort[short] ?? "0.0.0",
    colorClass: PACKAGE_COLOR[short] ?? "text-slate-400",
  }));
})();

export const PACKAGE_LAYERS = LAYER_LABELS.map((label, layer) => ({
  label,
  packages: PACKAGES.filter((p) => p.layer === layer),
}));

// ─── Auth State Machine ──────────────────────────────────────────────────────

export interface AuthState {
  id: string;
  label: string;
  desc: string;
  colorClass: string;
}

/**
 * The facet-auth state machine: 10 states from idle to authenticated
 * (or recoverable error).  Used by the AuthLabPage for interactive
 * exploration and by the AuthShowcaseSection for a quick preview.
 */
export const AUTH_MACHINE: AuthState[] = [
  {
    id: "idle",
    label: "Idle",
    desc: "Session not initialized. No tokens in storage.",
    colorClass: "text-muted-foreground",
  },
  {
    id: "check-session",
    label: "Check Session",
    desc: "Validating an existing token against the API.",
    colorClass: "text-sky-400",
  },
  {
    id: "select-method",
    label: "Select Method",
    desc: "User chooses: password, magic link, passkey, or SSO.",
    colorClass: "text-violet-400",
  },
  {
    id: "login-form",
    label: "Login Form",
    desc: "Email + password entry with inline validation.",
    colorClass: "text-blue-400",
  },
  {
    id: "magic-link",
    label: "Magic Link",
    desc: "Verification email dispatched, awaiting click.",
    colorClass: "text-blue-400",
  },
  {
    id: "passkey",
    label: "Passkey",
    desc: "WebAuthn credential creation or sign-in challenge.",
    colorClass: "text-blue-400",
  },
  {
    id: "check-mfa",
    label: "Check MFA",
    desc: "Evaluating whether the tenant requires MFA.",
    colorClass: "text-amber-400",
  },
  {
    id: "mfa-challenge",
    label: "MFA Challenge",
    desc: "TOTP code, SMS code, or recovery-code entry.",
    colorClass: "text-amber-400",
  },
  {
    id: "complete",
    label: "Complete",
    desc: "Session established. Auth context populated with profile.",
    colorClass: "text-green-400",
  },
  {
    id: "error",
    label: "Error",
    desc: "Recoverable failure. Error boundary surfaces the message.",
    colorClass: "text-destructive",
  },
];

// ─── Motion Effects ────────────────────────────────────────────────────────────

export type MotionCategory = "generative" | "authored";

export type MotionDirection =
  | "in"
  | "out"
  | "up"
  | "down"
  | "left"
  | "right"
  | "x"
  | "y"
  | "clockwise"
  | "counterclockwise"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "tracking";

export type MotionIntensity =
  "subtle" | "soft" | "medium" | "strong" | "dramatic";

export interface MotionEffectSpec {
  id: string;
  label: string;
  category: MotionCategory;
  desc: string;
}

/**
 * The 15 generative animation families: single source of truth for the
 * Motion Preview section on the landing page, the Motion Lab page, and
 * any consumer that wants to enumerate family metadata.  Each entry
 * carries its own OKLCH accent color (so cards on the landing are
 * diverse, not monochrome), its direction set, and its intensity tiers.
 */
export interface MotionFamily {
  id: string;
  label: string;
  desc: string;
  /** OKLCH color string: tints the card accent and the preview element. */
  color: string;
  directions: MotionDirection[];
  intensities: MotionIntensity[];
}

export const MOTION_FAMILIES: MotionFamily[] = [
  {
    id: "fade",
    label: "Fade",
    desc: "Fade in/out, overlay in/out",
    color: "oklch(0.82 0.13 220)",
    directions: ["in", "out", "up", "down", "left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "zoom",
    label: "Zoom",
    desc: "Zoom in/out with spring easing",
    color: "oklch(0.68 0.2 320)",
    directions: ["in", "out", "up", "down", "left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "pop",
    label: "Pop",
    desc: "Pop with spring physics",
    color: "oklch(0.72 0.2 20)",
    directions: ["in", "out"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "slide",
    label: "Slide",
    desc: "Slide in four directions",
    color: "oklch(0.78 0.15 180)",
    directions: ["up", "down", "left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "reveal",
    label: "Reveal",
    desc: "Content slides into frame",
    color: "oklch(0.84 0.16 45)",
    directions: ["up", "down"],
    intensities: [],
  },
  {
    id: "blur",
    label: "Blur",
    desc: "Blur in/out",
    color: "oklch(0.75 0.14 250)",
    directions: ["in", "out"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "flip",
    label: "Flip",
    desc: "3D flip with spring",
    color: "oklch(0.76 0.18 340)",
    directions: ["x", "y", "top-left", "bottom-right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "spin",
    label: "Spin",
    desc: "Rotate by degrees",
    color: "oklch(0.7 0.2 290)",
    directions: ["clockwise", "counterclockwise"],
    intensities: [],
  },
  {
    id: "panel",
    label: "Panel",
    desc: "Accordion-style expand",
    color: "oklch(0.78 0.13 150)",
    directions: ["up", "down", "left", "right", "top-left", "top-right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "lift",
    label: "Lift",
    desc: "Float up with shadow",
    color: "oklch(0.82 0.14 195)",
    directions: [],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "press",
    label: "Press",
    desc: "Press-down micro-effect",
    color: "oklch(0.85 0.15 35)",
    directions: ["in", "out"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "ring",
    label: "Ring",
    desc: "Ripple ring",
    color: "oklch(0.8 0.16 205)",
    directions: [],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "glow",
    label: "Glow",
    desc: "Pulsing glow",
    color: "oklch(0.9 0.12 80)",
    directions: [],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "shimmer",
    label: "Shimmer",
    desc: "Gradient sweep",
    color: "oklch(0.83 0.14 110)",
    directions: ["left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "text-reveal",
    label: "Text Reveal",
    desc: "Reveal by words or chars",
    color: "oklch(0.78 0.18 270)",
    directions: ["up", "down", "tracking"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
];

export const MOTION_EFFECTS: MotionEffectSpec[] = [
  {
    id: "aurora",
    label: "Aurora",
    category: "generative",
    desc: "Gradient sweep across an element boundary, animated with motion tokens.",
  },
  {
    id: "beams",
    label: "Beams",
    category: "generative",
    desc: "Radial light beams radiating from a cursor point.",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    category: "generative",
    desc: "Directional spotlight that follows pointer movement.",
  },
  {
    id: "grid",
    label: "Grid",
    category: "generative",
    desc: "Animated grid pattern with travel-distance offsets.",
  },
  {
    id: "typewriter",
    label: "Typewriter",
    category: "authored",
    desc: "Sequential character reveal with caret blink.",
  },
  {
    id: "reveal",
    label: "Reveal",
    category: "authored",
    desc: "Height-based content reveal using duration-base.",
  },
  {
    id: "glow",
    label: "Glow",
    category: "authored",
    desc: "Pulse glow using the primary token color.",
  },
  {
    id: "ripple",
    label: "Ripple",
    category: "authored",
    desc: "Circular ripple from interaction point.",
  },
  {
    id: "magnetic",
    label: "Magnetic",
    category: "authored",
    desc: "Element follows cursor with spring easing.",
  },
  {
    id: "tilt",
    label: "Tilt",
    category: "authored",
    desc: "3D perspective tilt on hover.",
  },
  {
    id: "shine",
    label: "Shine",
    category: "authored",
    desc: "Sweeping highlight across a surface.",
  },
];

// ─── Token Categories ────────────────────────────────────────────────────────

export interface TokenSpec {
  name: string;
  cssVar: string;
  value: string;
}

export interface TokenCategory {
  label: string;
  tokens: TokenSpec[];
}

/**
 * Token groups that surface in the token explorer.  Variable names and
 * sample values mirror the real @fusorb/facet-tokens CSS custom properties.
 */
export const TOKEN_CATEGORIES: TokenCategory[] = [
  {
    label: "Color",
    tokens: [
      {
        name: "background",
        cssVar: "--background",
        value: "oklch(0.12 0.02 240)",
      },
      {
        name: "foreground",
        cssVar: "--foreground",
        value: "oklch(0.95 0.01 240)",
      },
      { name: "primary", cssVar: "--primary", value: "oklch(0.82 0.13 220)" },
      {
        name: "primary-foreground",
        cssVar: "--primary-foreground",
        value: "oklch(0.17 0.03 240)",
      },
      {
        name: "secondary",
        cssVar: "--secondary",
        value: "oklch(0.19 0.02 240)",
      },
      { name: "muted", cssVar: "--muted", value: "oklch(0.19 0.02 240)" },
      {
        name: "muted-foreground",
        cssVar: "--muted-foreground",
        value: "oklch(0.65 0.02 240)",
      },
      { name: "accent", cssVar: "--accent", value: "oklch(0.22 0.03 240)" },
      { name: "border", cssVar: "--border", value: "oklch(0.22 0.02 240)" },
      {
        name: "destructive",
        cssVar: "--destructive",
        value: "oklch(0.577 0.245 27.325)",
      },
      { name: "success", cssVar: "--success", value: "oklch(0.527 0.154 150)" },
      { name: "card", cssVar: "--card", value: "oklch(0.155 0.02 240)" },
    ],
  },
  {
    label: "Typography",
    tokens: [
      { name: "font-heading", cssVar: "--font-heading", value: '"Montserrat"' },
      { name: "font-body", cssVar: "--font-body", value: '"Inter"' },
      { name: "font-mono", cssVar: "--font-mono", value: '"JetBrains Mono"' },
      {
        name: "font-technical",
        cssVar: "--font-technical",
        value: '"Rajdhani"',
      },
    ],
  },
  {
    label: "Spacing",
    tokens: [
      { name: "space-1", cssVar: "--space-1", value: "0.25rem" },
      { name: "space-2", cssVar: "--space-2", value: "0.5rem" },
      { name: "space-4", cssVar: "--space-4", value: "1rem" },
      { name: "space-8", cssVar: "--space-8", value: "2rem" },
      { name: "space-16", cssVar: "--space-16", value: "4rem" },
      { name: "space-24", cssVar: "--space-24", value: "6rem" },
      { name: "space-32", cssVar: "--space-32", value: "8rem" },
    ],
  },
  {
    label: "Radius",
    tokens: [
      { name: "radius", cssVar: "--radius", value: "0.5rem" },
      { name: "radius-sm", cssVar: "--radius-sm", value: "0.3rem" },
      { name: "radius-md", cssVar: "--radius-md", value: "0.4rem" },
      { name: "radius-lg", cssVar: "--radius-lg", value: "0.5rem" },
      { name: "radius-xl", cssVar: "--radius-xl", value: "0.7rem" },
      { name: "radius-2xl", cssVar: "--radius-2xl", value: "0.9rem" },
      { name: "radius-3xl", cssVar: "--radius-3xl", value: "1.1rem" },
    ],
  },
  {
    label: "Motion",
    tokens: [
      {
        name: "duration-fast",
        cssVar: "--facet-motion-duration-fast",
        value: "150ms",
      },
      {
        name: "duration-base",
        cssVar: "--facet-motion-duration-base",
        value: "250ms",
      },
      {
        name: "duration-slow",
        cssVar: "--facet-motion-duration-slow",
        value: "500ms",
      },
      {
        name: "ease-standard",
        cssVar: "--motion-ease-standard",
        value: "cubic-bezier(0.2, 0, 0, 1)",
      },
      {
        name: "ease-spring",
        cssVar: "--motion-ease-spring",
        value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      {
        name: "ease-emphasized",
        cssVar: "--motion-ease-emphasized",
        value: "cubic-bezier(0.2, 0, 0, 1)",
      },
    ],
  },
];

// ─── Component Catalog ────────────────────────────────────────────────────────

export const COMPONENT_CATEGORIES: Record<string, string[]> = {
  Foundations: ["Icon", "Theme", "Typography", "Tokens"],
  Inputs: [
    "Input",
    "PasswordInput",
    "OTP",
    "Select",
    "Combobox",
    "DatePicker",
    "Form",
    "TagInput",
    "Slider",
    "MultiCombobox",
    "PhoneInput",
    "RichTextEditor",
  ],
  "Data Display": [
    "Table",
    "DataTable",
    "Avatar",
    "AvatarGroup",
    "Badge",
    "Pill",
    "Kbd",
    "Tree",
    "NotificationDrawer",
  ],
  Feedback: [
    "Alert",
    "Dialog",
    "AlertDialog",
    "Drawer",
    "Sheet",
    "Popover",
    "Tooltip",
    "Progress",
    "Spinner",
    "Skeleton",
    "Toast",
    "EmptyState",
  ],
  Layout: [
    "Card",
    "Tabs",
    "Accordion",
    "Separator",
    "Breadcrumb",
    "Pagination",
    "Resizable",
    "Navbar",
    "NavigationMenu",
    "ContextMenu",
    "DropdownMenu",
  ],
  "Ready-to-use": [
    "Stepper",
    "WizardFormPage",
    "KanbanBoard",
    "ApiKeyManager",
    "ActivityFeed",
    "StatCard",
    "InviteTeam",
    "AccountSettings",
    "PageHeader",
    "PricingComparison",
    "QRCode",
    "Dropzone",
  ],
  Motion: [
    "Spotlight",
    "Aurora",
    "Beams",
    "Grid",
    "Typewriter",
    "Reveal",
    "Glow",
    "Shine",
    "Ripple",
    "Magnetic",
    "Tilt",
  ],
};

const CATEGORY_PACKAGE: Record<string, string> = {
  Foundations: "@fusorb/facet-components",
  Inputs: "@fusorb/facet-components",
  "Data Display": "@fusorb/facet-components",
  Feedback: "@fusorb/facet-components",
  Layout: "@fusorb/facet-components",
  "Ready-to-use": "@fusorb/facet-components",
  Motion: "@fusorb/facet-motion",
};

export interface ComponentEntry {
  name: string;
  category: string;
  pkg: string;
}

export const ALL_COMPONENTS: ComponentEntry[] = Object.entries(
  COMPONENT_CATEGORIES,
).flatMap(([cat, names]) =>
  names.map((name) => ({
    name,
    category: cat,
    pkg: CATEGORY_PACKAGE[cat] ?? "@fusorb/facet-components",
  })),
);

export const COMPONENT_CATEGORIES_LIST = Object.keys(COMPONENT_CATEGORIES);

// ─── Layout Modes ─────────────────────────────────────────────────────────────

export type LayoutMode = "full" | "rail" | "collapsed";

export const LAYOUT_MODES: LayoutMode[] = ["full", "rail", "collapsed"];

// ─── Auth Lab Domain Presets ──────────────────────────────────────────────────

export interface LabDomain {
  id: string;
  label: string;
  accent: string;
  authMethods: string[];
  density: string;
  desc: string;
}

export const LAB_DOMAINS: LabDomain[] = [
  {
    id: "default",
    label: "Default",
    accent: "#38bdf8",
    authMethods: ["Email / Password", "Magic Link", "OAuth"],
    density: "Comfortable",
    desc: "Balanced defaults for general-purpose applications.",
  },
  {
    id: "fintech",
    label: "Fintech",
    accent: "#34d399",
    authMethods: ["Email / Password", "MFA Required", "Passkey"],
    density: "Compact",
    desc: "MFA-first, high-trust session model with passkey support.",
  },
  {
    id: "med",
    label: "MedTech",
    accent: "#60a5fa",
    authMethods: ["Email / Password", "MFA Required", "SSO"],
    density: "Comfortable",
    desc: "Compliance-ready session management, SSO for org-level access.",
  },
  {
    id: "edu",
    label: "EdTech",
    accent: "#a78bfa",
    authMethods: ["Email / Password", "OAuth", "Passkey"],
    density: "Comfortable",
    desc: "OAuth-first for institutional logins, passkeys for students.",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    accent: "#f59e0b",
    authMethods: ["SSO Required", "MFA Required", "Passkey"],
    density: "Compact",
    desc: "SSO-gated access with forced MFA, tenant-aware session model.",
  },
];
