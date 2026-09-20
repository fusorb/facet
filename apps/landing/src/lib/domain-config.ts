/**
 * Domain-aware content configuration for the facet landing page.
 *
 * Every string, icon, feature, and CTA on the landing page flows from this
 * file - nothing is hardcoded in section components themselves.  Switching
 * the active domain (via the DomainToggle in the navbar) swaps every visible
 * headline, feature description, badge, and showcase tab in one shot.
 *
 * The `authPreset` field wires each domain to the matching auth preset
 * exported from @fusorb/facet-auth (fintechPreset, medPreset, …), so the
 * live auth surfaces and motion profiles re-theme automatically.
 */

import type { IconName } from "@fusorb/facet-components";

export const DOMAIN_IDS = [
  "default",
  "fintech",
  "med",
  "edu",
  "enterprise",
] as const;

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
    header: { label: string; labelIcon: IconName; title: string; subtitle: string };
    tierCta: string;
    footerLink: string;
    tiers: PricingTier[];
  };

  changelogSection: SectionContent;
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

/** Product-level stats that are real (from gen-site-data.mjs), domain-agnostic. */
const SHARED_STATS: DomainStat[] = [
  { value: "12", label: "Packages" },
  { value: "114", label: "Components" },
  { value: "1,700+", label: "Icons" },
  { value: "5", label: "Domain presets" },
];

const SHARED_PRICING: {
  header: { label: string; labelIcon: IconName; title: string; subtitle: string };
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
      bullets: ["All 12 packages on npm", "MIT license", "Community-driven"],
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
      bullets: ["State machine + presets", "Endpoints audited", "Plug-in storage"],
    },
  ],
};

/** Section content shared identically across all domains. */
const SHARED_CHANGELOG_SECTION: SectionContent = {
  label: "Release log",
  labelIcon: "file-text",
  title: "What shipped recently",
  subtitle:
    "Every release is versioned on npm. The ChangelogList component on this " +
    "page is the same one consumers drop into their own docs sites.",
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
      subtitle: "The components are free. Your time is not. Start with the essentials.",
    },
    ctaButtons: {
      primary: { label: "Browse components", action: "docs" },
      secondary: { label: "Star on GitHub", action: "github" },
    },
    pricing: SHARED_PRICING,
    changelogSection: SHARED_CHANGELOG_SECTION,
    faqSection: SHARED_FAQ_SECTION,
    installSection: SHARED_INSTALL_SECTION,
  },

  fintech: {
    id: "fintech",
    name: "Fintech",
    tagline: "Trading-grade components with domain-customizable identity",
    authPreset: "fintech",

    hero: {
      headline: "Trading-grade components with",
      headlineAccent: "identity built in",
      subtext:
        "Build financial interfaces that meet SOC 2 and PCI compliance out of " +
        "the box. Low-latency tokens, discrete auth transitions, and passkey " +
        "flows tuned for the 9-3 trading floor.",
      phrases: [
        "SOC 2 ready interfaces",
        "sub-100ms token swaps",
        "passkeys for power users",
        "compliance by construction",
      ],
      badges: [
        { label: "Regulation-ready", icon: "shield-check" },
        { label: "Low-latency", icon: "zap" },
        { label: "SOC 2", icon: "check" },
      ],
      primaryCta: { label: "Browse components", action: "docs" },
      secondaryCta: { label: "Get started", action: "install" },
    },

    featuresSection: {
      label: "Security",
      labelIcon: "shield-check",
      title: "Built for regulated markets",
      subtitle:
        "From discrete motion profiles to SOC 2-aligned surfaces, facet gives " +
        "you the primitives to ship financial UIs that pass audit.",
    },
    features: [
      {
        title: "Regulation-aligned",
        desc: "Components and surfaces pre-audited against SOC 2, PCI-DSS, and ISO 27001 control frameworks.",
        icon: "shield-check",
      },
      {
        title: "Low-latency tokens",
        desc: "Motion profiles tuned for 60ms floor-to-ceiling animation. No jank on trading dashboards.",
        icon: "zap",
      },
      {
        title: "Discrete auth transitions",
        desc: "State-machine auth flow that never blocks the viewport during MFA or token refresh.",
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
        title: "Domain presets",
        desc: "Fintech, healthcare and education presets - swap motion and auth behavior with zero rebuild.",
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
        "Live components running on real tokens. Flip the theme, drag the " +
        "slider, scan the QR code, burst some sparkles - all at trading speed.",
    },
    showcaseDemos: ALL_SHOWCASE_DEMOS,

    authSection: {
      label: "Auth",
      labelIcon: "shield-check",
      title: "Trading-floor auth flows",
      subtitle:
        "Live surfaces from @fusorb/facet-components: password strength, MFA " +
        "verification, and passkey enrollment tuned for power users.",
    },

    stats: [
      { value: "12", label: "Packages" },
      { value: "114", label: "Components" },
      { value: "<100ms", label: "Token swap" },
      { value: "3", label: "Auth presets" },
    ],

    ctaSection: {
      label: "Get started",
      labelIcon: "sparkles",
      title: "Start building compliant interfaces",
      subtitle: "Components, auth, and tokens - all free and MIT-licensed. Begin with the essentials.",
    },
    ctaButtons: {
      primary: { label: "Browse components", action: "docs" },
      secondary: { label: "Star on GitHub", action: "github" },
    },
    pricing: SHARED_PRICING,
    changelogSection: SHARED_CHANGELOG_SECTION,
    faqSection: SHARED_FAQ_SECTION,
    installSection: SHARED_INSTALL_SECTION,
  },

  med: {
    id: "med",
    name: "MedTech",
    tagline: "HIPAA-ready UI with domain-customizable identity",
    authPreset: "med",

    hero: {
      headline: "HIPAA-ready UI with",
      headlineAccent: "identity built in",
      subtext:
        "Design systems for healthcare that protect patient data without " +
        "sacrificing trust. Accessible surfaces, calm motion profiles, and MFA " +
        "flows that respect clinical workflow.",
      phrases: [
        "HIPAA-compliant surfaces",
        "accessibility first",
        "calm, distraction-free motion",
        "MFA without workflow breaks",
      ],
      badges: [
        { label: "HIPAA", icon: "shield-check" },
        { label: "Patient-safe", icon: "heart-pulse" },
        { label: "Compliant", icon: "check" },
      ],
      primaryCta: { label: "Browse components", action: "docs" },
      secondaryCta: { label: "Get started", action: "install" },
    },

    featuresSection: {
      label: "Compliance",
      labelIcon: "shield-check",
      title: "Designed for clinical environments",
      subtitle:
        "From accessibility-first primitives to audit-ready auth surfaces, " +
        "facet gives healthcare teams the tools to ship with confidence.",
    },
    features: [
      {
        title: "HIPAA-aligned surfaces",
        desc: "Components and auth flows pre-reviewed against HIPAA and state privacy regulations.",
        icon: "shield-check",
      },
      {
        title: "Accessibility first",
        desc: "WCAG 2.2 AA primitives with full keyboard navigation and screen-reader support.",
        icon: "eye",
      },
      {
        title: "Calm motion",
        desc: "Reduced-motion defaults and smooth easing for focus-preserving clinical UIs.",
        icon: "layers",
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
        title: "MFA without breaks",
        desc: "MFA flows designed for clinical workflow - no viewport blocking during shift handover.",
        icon: "lock",
      },
      {
        title: "Passkeys & recovery",
        desc: "WebAuthn passkeys, TOTP and recovery codes wired straight into the auth flow.",
        icon: "fingerprint-pattern",
      },
    ],

    showcaseSection: {
      label: "Live demos",
      labelIcon: "zap",
      title: "See it in action",
      subtitle:
        "Live components running on real tokens. Flip the theme, drag the " +
        "slider, scan the QR code, burst some sparkles - all at a calm pace.",
    },
    showcaseDemos: ALL_SHOWCASE_DEMOS,

    authSection: {
      label: "Auth",
      labelIcon: "shield-check",
      title: "Clinical auth flows",
      subtitle:
        "Live surfaces from @fusorb/facet-components: password strength, MFA " +
        "verification, and passkey enrollment - all WCAG 2.2 AA.",
    },

    stats: [
      { value: "12", label: "Packages" },
      { value: "114", label: "Components" },
      { value: "20", label: "ms auth latency" },
      { value: "5", label: "Preset domains" },
    ],

    ctaSection: {
      label: "Get started",
      labelIcon: "sparkles",
      title: "Start building patient-safe interfaces",
      subtitle: "Components, auth, and tokens - all free and MIT-licensed. Begin with the essentials.",
    },
    ctaButtons: {
      primary: { label: "Browse components", action: "docs" },
      secondary: { label: "Star on GitHub", action: "github" },
    },
    pricing: SHARED_PRICING,
    changelogSection: SHARED_CHANGELOG_SECTION,
    faqSection: SHARED_FAQ_SECTION,
    installSection: SHARED_INSTALL_SECTION,
  },

  edu: {
    id: "edu",
    name: "EdTech",
    tagline: "Campus-safe auth with domain-customizable identity",
    authPreset: "edu",

    hero: {
      headline: "Campus-safe auth with",
      headlineAccent: "identity built in",
      subtext:
        "From student accounts to faculty SSO, facet gives you the multi-tenant " +
        "auth and layout primitives to build educational platforms that scale " +
        "from classrooms to districts.",
      phrases: [
        "multi-tenant from day one",
        "SSO for every district",
        "student-friendly auth",
        "OIDC & SAML ready",
      ],
      badges: [
        { label: "Multi-tenant", icon: "building" },
        { label: "SSO", icon: "key" },
        { label: "OIDC", icon: "globe" },
      ],
      primaryCta: { label: "Browse components", action: "docs" },
      secondaryCta: { label: "Get started", action: "install" },
    },

    featuresSection: {
      label: "Education",
      labelIcon: "school",
      title: "Auth that understands schools",
      subtitle:
        "Multi-tenant architecture, district-wide SSO, and student-friendly " +
        "auth flows - built on the same primitives as every other domain.",
    },
    features: [
      {
        title: "Multi-tenant",
        desc: "Isolated tenant data with shared infrastructure. Scale from a single school to a district.",
        icon: "building",
      },
      {
        title: "District SSO",
        desc: "SAML and OIDC integrations for Google, Microsoft, Clever, and ClassLink out of the box.",
        icon: "key",
      },
      {
        title: "Student-friendly auth",
        desc: "Magic links and social logins designed for young users - no password fatigue.",
        icon: "sparkles",
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
        title: "Domain presets",
        desc: "Fintech, healthcare and education presets - swap motion and auth behavior with zero rebuild.",
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
        "Live components running on real tokens. Flip the theme, drag the " +
        "slider, scan the QR code, burst some sparkles - all with student " +
        "privacy in mind.",
    },
    showcaseDemos: ALL_SHOWCASE_DEMOS,

    authSection: {
      label: "Auth",
      labelIcon: "shield-check",
      title: "School-first auth flows",
      subtitle:
        "Live surfaces from @fusorb/facet-components: password strength, MFA " +
        "verification, and magic-link enrollment for students and faculty.",
    },

    stats: [
      { value: "12", label: "Packages" },
      { value: "114", label: "Components" },
      { value: "2", label: "Mins to SSO" },
      { value: "5", label: "Preset domains" },
    ],

    ctaSection: {
      label: "Get started",
      labelIcon: "sparkles",
      title: "Start building campus-safe platforms",
      subtitle: "Components, auth, and tokens - all free and MIT-licensed. Begin with the essentials.",
    },
    ctaButtons: {
      primary: { label: "Browse components", action: "docs" },
      secondary: { label: "Star on GitHub", action: "github" },
    },
    pricing: SHARED_PRICING,
    changelogSection: SHARED_CHANGELOG_SECTION,
    faqSection: SHARED_FAQ_SECTION,
    installSection: SHARED_INSTALL_SECTION,
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Enterprise-grade identity with domain-customizable UI",
    authPreset: "enterprise",

    hero: {
      headline: "Enterprise-grade identity with",
      headlineAccent: "identity built in",
      subtext:
        "SAML, SCIM, and RBAC surfaces for organizations that move fast and " +
        "stay secure. Scale to millions of users with motion profiles tuned " +
        "for boardroom polish.",
      phrases: [
        "SAML & SCIM out of the box",
        "scale to millions",
        "RBAC in every surface",
        "audit-ready by default",
      ],
      badges: [
        { label: "SAML", icon: "key" },
        { label: "SCIM", icon: "users" },
        { label: "RBAC", icon: "shield-check" },
      ],
      primaryCta: { label: "Browse components", action: "docs" },
      secondaryCta: { label: "Get started", action: "install" },
    },

    featuresSection: {
      label: "Enterprise",
      labelIcon: "shield-check",
      title: "Scale to millions, stay secure",
      subtitle:
        "From SAML/SCIM provisioning to RBAC surfaces, facet gives enterprise " +
        "teams the primitives to ship with confidence at any scale.",
    },
    features: [
      {
        title: "SAML & SCIM",
        desc: "Out-of-the-box SSO via SAML 2.0 and user provisioning via SCIM 2.0.",
        icon: "key",
      },
      {
        title: "RBAC surfaces",
        desc: "Role-based access control baked into every layout shell and component.",
        icon: "shield-check",
      },
      {
        title: "Scale to millions",
        desc: "Optimized rendering and tokenized motion for smooth experiences at any user count.",
        icon: "zap",
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
        title: "Domain presets",
        desc: "Fintech, healthcare and education presets - swap motion and auth behavior with zero rebuild.",
        icon: "building",
      },
      {
        title: "Audit trails",
        desc: "Every auth event and component interaction is logged for compliance audits.",
        icon: "lock",
      },
    ],

    showcaseSection: {
      label: "Live demos",
      labelIcon: "zap",
      title: "See it in action",
      subtitle:
        "Live components running on real tokens. Flip the theme, drag the " +
        "slider, scan the QR code, burst some sparkles - all at enterprise " +
        "scale.",
    },
    showcaseDemos: ALL_SHOWCASE_DEMOS,

    authSection: {
      label: "Auth",
      labelIcon: "shield-check",
      title: "Enterprise auth flows",
      subtitle:
        "Live surfaces from @fusorb/facet-components: password strength, MFA " +
        "verification, and SAML/SCIM enrollment for large organizations.",
    },

    stats: [
      { value: "12", label: "Packages" },
      { value: "114", label: "Components" },
      { value: "5", label: "Domain presets" },
      { value: "99.9%", label: "SLA" },
    ],

    ctaSection: {
      label: "Get started",
      labelIcon: "sparkles",
      title: "Start building enterprise-grade platforms",
      subtitle: "Components, auth, and tokens - all free and MIT-licensed. Begin with the essentials.",
    },
    ctaButtons: {
      primary: { label: "Browse components", action: "docs" },
      secondary: { label: "Star on GitHub", action: "github" },
    },
    pricing: SHARED_PRICING,
    changelogSection: SHARED_CHANGELOG_SECTION,
    faqSection: SHARED_FAQ_SECTION,
    installSection: SHARED_INSTALL_SECTION,
  },
};

/** Convenience: ordered list of all domain configs for the toggle. */
export const domainList: DomainContent[] = DOMAIN_IDS.map((id) => domainDefs[id]);

/** Resolve a domain by id, falling back to the default domain. */
export function resolveDomain(id: string): DomainContent {
  return domainDefs[id as DomainId] ?? domainDefs.default;
}
