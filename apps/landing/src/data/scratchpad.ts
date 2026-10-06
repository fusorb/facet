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
    color: "var(--chart-1)",
    children: [
      {
        id: "domain",
        label: "Auth · Layout · Motion",
        sub: "domain layer",
        desc:
          "Domain-customizable product surfaces and shells. Presets for " +
          "fintech, healthcare, and education - or bring your own.",
        icon: "layers",
        color: "var(--success)",
        children: [
          {
            id: "components",
            label: "Components",
            sub: "@fusorb/facet-components",
            pkg: "@fusorb/facet-components",
            desc: "116 primitives, composed surfaces, and ready-to-use pages. Every component is independently versionable.",
            icon: "boxes",
            color: "var(--chart-2)",
            children: [
              {
                id: "tokens",
                label: "Tokens",
                sub: "@fusorb/facet-tokens",
                pkg: "@fusorb/facet-tokens",
                desc: "Color, typography, spacing, radius, motion - the source of truth.",
                icon: "palette",
                color: "var(--warning)",
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
    color: "var(--primary)",
  },
  {
    axis: "config",
    label: "Behavior",
    desc: "Pass domain presets (fintech, med, edu) to change motion and auth behavior.",
    color: "var(--success)",
  },
  {
    axis: "slots",
    label: "Structure",
    desc: "Override individual component sub-elements through render slots and props.",
    color: "var(--chart-3)",
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
  utils: 0,
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

/**
 * Color used to tint each package's badge in the ecosystem view.
 * References facet design tokens (never raw palette classes) so the badges
 * retint with the active palette alongside everything else.
 */
const PACKAGE_COLOR: Record<string, string> = {
  tokens: "text-chart-3",
  utils: "text-muted-foreground",
  components: "text-chart-1",
  auth: "text-chart-2",
  layout: "text-chart-4",
  motion: "text-accent-fuchsia",
  sdk: "text-warning",
  store: "text-destructive",
  docs: "text-muted-foreground",
  emails: "text-muted-foreground",
  cli: "text-muted-foreground",
  sandbox: "text-muted-foreground",
  native: "text-muted-foreground",
};

const PACKAGE_DESCRIPTIONS: Record<string, string> = {
  tokens: "Design tokens - color, spacing, radius, motion",
  utils: "Shared helpers - className composition, guards",
  components: "116 production-ready UI surfaces",
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
    colorClass: PACKAGE_COLOR[short] ?? "text-muted-foreground",
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
    colorClass: "text-chart-1",
  },
  {
    id: "select-method",
    label: "Select Method",
    desc: "User chooses: password, magic link, passkey, or SSO.",
    colorClass: "text-chart-2",
  },
  {
    id: "login-form",
    label: "Login Form",
    desc: "Email + password entry with inline validation.",
    colorClass: "text-chart-4",
  },
  {
    id: "magic-link",
    label: "Magic Link",
    desc: "Verification email dispatched, awaiting click.",
    colorClass: "text-chart-4",
  },
  {
    id: "passkey",
    label: "Passkey",
    desc: "WebAuthn credential creation or sign-in challenge.",
    colorClass: "text-chart-4",
  },
  {
    id: "check-mfa",
    label: "Check MFA",
    desc: "Evaluating whether the tenant requires MFA.",
    colorClass: "text-warning",
  },
  {
    id: "mfa-challenge",
    label: "MFA Challenge",
    desc: "TOTP code, SMS code, or recovery-code entry.",
    colorClass: "text-warning",
  },
  {
    id: "complete",
    label: "Complete",
    desc: "Session established. Auth context populated with profile.",
    colorClass: "text-success",
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
 * references a facet design token for its accent (so cards stay diverse
 * while still retinting with the active palette), its direction set, and
 * its intensity tiers.
 */
export interface MotionFamily {
  id: string;
  label: string;
  desc: string;
  /** facet token reference (e.g. `var(--chart-1)`): tints the card accent and the preview element. */
  color: string;
  directions: MotionDirection[];
  intensities: MotionIntensity[];
}

export const MOTION_FAMILIES: MotionFamily[] = [
  {
    id: "fade",
    label: "Fade",
    desc: "Fade in/out, overlay in/out",
    color: "var(--chart-1)",
    directions: ["in", "out", "up", "down", "left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "zoom",
    label: "Zoom",
    desc: "Zoom in/out with spring easing",
    color: "var(--chart-2)",
    directions: ["in", "out", "up", "down", "left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "pop",
    label: "Pop",
    desc: "Pop with spring physics",
    color: "var(--destructive)",
    directions: ["in", "out"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "slide",
    label: "Slide",
    desc: "Slide in four directions",
    color: "var(--chart-4)",
    directions: ["up", "down", "left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "reveal",
    label: "Reveal",
    desc: "Content slides into frame",
    color: "var(--warning)",
    directions: ["up", "down"],
    intensities: [],
  },
  {
    id: "blur",
    label: "Blur",
    desc: "Blur in/out",
    color: "var(--chart-5)",
    directions: ["in", "out"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "flip",
    label: "Flip",
    desc: "3D flip with spring",
    color: "var(--chart-3)",
    directions: ["x", "y", "top-left", "bottom-right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "spin",
    label: "Spin",
    desc: "Rotate by degrees",
    color: "var(--accent)",
    directions: ["clockwise", "counterclockwise"],
    intensities: [],
  },
  {
    id: "panel",
    label: "Panel",
    desc: "Accordion-style expand",
    color: "var(--success)",
    directions: ["up", "down", "left", "right", "top-left", "top-right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "lift",
    label: "Lift",
    desc: "Float up with shadow",
    color: "var(--primary)",
    directions: [],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "press",
    label: "Press",
    desc: "Press-down micro-effect",
    color: "var(--accent-fuchsia)",
    directions: ["in", "out"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "ring",
    label: "Ring",
    desc: "Ripple ring",
    color: "var(--chart-1)",
    directions: [],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "glow",
    label: "Glow",
    desc: "Pulsing glow",
    color: "var(--warning)",
    directions: [],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "shimmer",
    label: "Shimmer",
    desc: "Gradient sweep",
    color: "var(--chart-3)",
    directions: ["left", "right"],
    intensities: ["subtle", "soft", "medium", "strong", "dramatic"],
  },
  {
    id: "text-reveal",
    label: "Text Reveal",
    desc: "Reveal by words or chars",
    color: "var(--chart-2)",
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
