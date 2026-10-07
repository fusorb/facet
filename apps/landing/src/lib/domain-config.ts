/**
 * Domain content configuration for the facet landing page.
 *
 * Every string, icon, feature, and CTA on the landing page flows from this
 * file - nothing is hardcoded in section components themselves.
 *
 * The `authPreset` field wires the domain to the matching auth preset
 * exported from @fusorb/facet-auth, so the live auth surfaces and motion
 * profiles re-theme automatically.
 */

import type { IconName } from "@fusorb/facet-components";
import {
  SITE_PACKAGES_COUNT,
  COMPONENT_COUNT,
  ICON_COUNT,
} from "../data/site-data.generated.js";

export const DOMAIN_IDS = ["default"] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

/** Maps a domain to the matching preset exported from @fusorb/facet-auth. */
export type AuthPresetId = DomainId;

/**
 * Every call-to-action button is an action, never a raw URL.  The shell
 * (Navbar / CTA sections) translates the action into a side-effect
 * (open docs, scroll to install, open GitHub, …) so the config stays
 * decoupled from routing and window APIs.
 */
export type CtaAction = "docs" | "install" | "github" | "pricing" | "feedback";

export interface CtaButton {
  label: string;
  action: CtaAction;
}

export interface DomainBadge {
  label: string;
  icon: IconName;
}

export interface DomainFeature {
  title: string;
  desc: string;
  icon: IconName;
}

export interface DomainStat {
  value: string;
  label: string;
}

/** Pricing tier shown in the pricing-teaser section. */
export interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  bullets: string[];
  highlight?: boolean;
  badge?: string;
}

/** Section header content block: Pill label/icon + centered heading + subtitle. */
export interface SectionContent {
  label: string;
  labelIcon: IconName;
  title: string;
  subtitle: string;
}

/**
 * Each domain defines its complete landing-page content.
 */
export interface DomainContent {
  /** Unique id, matches an auth + layout preset name. */
  id: DomainId;
  /** Human-readable label shown in the DomainToggle. */
  name: string;
  /** Short tagline shown in the footer / meta. */
  tagline: string;
  /** Auth preset this domain maps to (drives live auth demos). */
  authPreset: AuthPresetId;

  hero: {
    headline: string;
    headlineAccent: string;
    subtext: string;
    phrases: string[];
    badges: DomainBadge[];
    primaryCta: CtaButton;
    secondaryCta: CtaButton;
  };

  featuresSection: {
    label: string;
    labelIcon: IconName;
    title: string;
    subtitle: string;
  };
  features: DomainFeature[];

  showcaseSection: {
    label: string;
    labelIcon: IconName;
    title: string;
    subtitle: string;
  };
  /** Demo tabs shown in the live-demo section. Order is configurable per domain. */
  showcaseDemos: Array<{ id: string; label: string }>;

  authSection: {
    label: string;
    labelIcon: IconName;
    title: string;
    subtitle: string;
  };

  stats: DomainStat[];

  ctaSection: {
    label: string;
    labelIcon: IconName;
    title: string;
    subtitle: string;
  };
  ctaButtons: {
    primary: CtaButton;
    secondary: CtaButton;
  };

  pricing: {
    header: {
      label: string;
      labelIcon: IconName;
      title: string;
      subtitle: string;
    };
    tierCta: string;
    footerLink: string;
    tiers: PricingTier[];
  };

  faqSection: SectionContent;
  installSection: SectionContent;
}

/* ────────────────────────────────────────────────────────────── *
 * Shared building blocks (used to compose each domain below)
 * ────────────────────────────────────────────────────────────── */

const SHARED_BADGES: DomainBadge[] = [
  { label: "Open source", icon: "globe" },
  { label: "Radix powered", icon: "layers" },
  { label: "MIT licensed", icon: "check" },
];

/**
 * Live demos available in the DemoShowcaseSection.  These are generic
 * UI component previews (not domain-specific), so every domain can
 * reference the same set - but the *order* and *which ones are shown*
 * is configurable per domain.
 */
const ALL_SHOWCASE_DEMOS = [
  { id: "buttons", label: "Buttons" },
  { id: "controls", label: "Controls" },
  { id: "theme", label: "Theme" },
  { id: "qr", label: "QR Code" },
  { id: "color", label: "Color" },
  { id: "marquee", label: "Marquee" },
  { id: "sparkle", label: "Sparkle" },
];

/** Core product stats — dynamically detected from the workspace at build time. */
export const BASE_STATS: DomainStat[] = [
  { value: String(SITE_PACKAGES_COUNT), label: "Packages" },
  { value: String(COMPONENT_COUNT), label: "Components" },
];

/** Product-level stats that are real (from gen-site-data.mjs), domain-agnostic. */
const SHARED_STATS: DomainStat[] = [
  ...BASE_STATS,
  { value: String(ICON_COUNT), label: "Icons" },
  { value: "1", label: "Domain preset" },
];

const SHARED_PRICING: {
  header: {
    label: string;
    labelIcon: IconName;
    title: string;
    subtitle: string;
  };
  tierCta: string;
  footerLink: string;
  tiers: PricingTier[];
} = {
  header: {
    label: "Pricing",
    labelIcon: "credit-card",
    title: "Everything ships free, MIT-licensed",
    subtitle:
      "Components, auth, layout, SDK, store, tokens, docs, emails, CLI. " +
      "All on npm, all free. Pick the pieces you need.",
  },
  tierCta: "See all packages",
  footerLink: "See the full pricing breakdown",
  tiers: [
    {
      id: "oss",
      name: "Open source",
      price: "Free",
      description: "Every package, MIT-licensed. npm-install, ship.",
      bullets: [
        `All ${SITE_PACKAGES_COUNT} packages on npm`,
        "MIT license",
        "Community-driven",
      ],
    },
    {
      id: "components",
      name: "Components",
      price: "Free",
      description: "Styled Radix components, themed with the Alpha Palette.",
      bullets: ["Drop-in ready", "Tree-shaken icons", "CI-verified coverage"],
      highlight: true,
      badge: "Most useful",
    },
    {
      id: "auth",
      name: "Auth + SDK",
      price: "Free",
      description: "Domain-customizable auth + a typed SovGrant SDK + store.",
      bullets: [
        "State machine + presets",
        "Endpoints audited",
        "Plug-in storage",
      ],
    },
  ],
};

const SHARED_FAQ_SECTION: SectionContent = {
  label: "FAQ",
  labelIcon: "circle-question-mark",
  title: "Frequently Asked Questions",
  subtitle: "Quick answers to the questions consumers ask most.",
};

const SHARED_INSTALL_SECTION: SectionContent = {
  label: "Install",
  labelIcon: "terminal",
  title: "Get started in minutes",
  subtitle: "Install one command, import what you need, ship your app.",
};

/* ────────────────────────────────────────────────────────────── *
 * Per-domain definitions
 * ────────────────────────────────────────────────────────────── */

export const domainDefs: Record<DomainId, DomainContent> = {
  default: {
    id: "default",
    name: "Default",
    tagline: "Domain-customizable auth-first component system",
    authPreset: "default",

    hero: {
      headline: "A component library with",
      headlineAccent: "identity built in",
      subtext:
        "Accessible React components for TypeScript and Tailwind CSS v4. Radix " +
        "primitives, dark mode, and a pluggable auth flow that fits your domain. " +
        "Install from npm, theme with tokens, ship.",
      phrases: [
        "auth flows that fit your domain",
        "docs that never drift",
        "tokens every brand can own",
        "one install, the whole system",
      ],
      badges: SHARED_BADGES,
      primaryCta: { label: "Browse components", action: "docs" },
      secondaryCta: { label: "Get started", action: "install" },
    },

    featuresSection: {
      label: "Components",
      labelIcon: "boxes",
      title: "Everything a product UI needs",
      subtitle:
        "One token system, one component language, one auth flow. Compose what " +
        "you need, theme it for your brand.",
    },
    features: [
      {
        title: "Radix quality",
        desc: "Accessible primitives with keyboard support and focus management, so you don't have to build them.",
        icon: "puzzle",
      },
      {
        title: "Themeable tokens",
        desc: "CSS variables for colors and spacing. Dark mode included. Swap into any project without changing markup.",
        icon: "palette",
      },
      {
        title: "Auth orchestration",
        desc: "A sign-in flow with MFA, passkeys and magic links that works with your backend.",
        icon: "lock",
      },
      {
        title: "Typed SDK",
        desc: "A TypeScript client for your identity API. Call it from the browser, not just the server.",
        icon: "zap",
      },
      {
        title: "Layout shells",
        desc: "Console, app and landing shells with sidebar, topbar and mobile support. Bring your own router.",
        icon: "ruler",
      },
      {
        title: "Your domain",
        desc: "Presets for fintech, healthcare and education. Extend them or build your own.",
        icon: "building",
      },
      {
        title: "Passkeys & MFA",
        desc: "WebAuthn passkeys, TOTP and recovery codes wired straight into the auth flow.",
        icon: "fingerprint-pattern",
      },
    ],

    showcaseSection: {
      label: "Live demos",
      labelIcon: "zap",
      title: "See it in action",
      subtitle:
        "Not screenshots. Live components running on the real tokens. Flip the " +
        "theme, drag the slider, scan the QR code, burst some sparkles.",
    },
    showcaseDemos: ALL_SHOWCASE_DEMOS,

    authSection: {
      label: "Auth",
      labelIcon: "shield-check",
      title: "Auth flows you can show, not describe",
      subtitle:
        "Live surfaces from @fusorb/facet-components: password strength, MFA " +
        "verification, and the rest of the state machine.",
    },

    stats: SHARED_STATS,

    ctaSection: {
      label: "Get started",
      labelIcon: "sparkles",
      title: "Build something people love to use",
      subtitle:
        "The components are free. Your time is not. Start with the essentials.",
    },
    ctaButtons: {
      primary: { label: "Browse components", action: "docs" },
      secondary: { label: "Star on GitHub", action: "github" },
    },
    pricing: SHARED_PRICING,
    faqSection: SHARED_FAQ_SECTION,
    installSection: SHARED_INSTALL_SECTION,
  },

};

export const domainContent = domainDefs.default;
