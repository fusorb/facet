import type { ActivityItem, ApiKey } from "@fusorb/facet-components";

/**
 * Dashboard demo data for the home-page dashboard preview and the
 * /dashboard-demo page. Time-anchored to the session date so the
 * `relativeTime` helper always reads naturally during demos.
 */
export const DASHBOARD_STATS = [
  {
    label: "Active identities",
    value: "1,284",
    delta: 8.2,
    icon: "users" as const,
    hint: "vs last week",
  },
  {
    label: "Verifications / hr",
    value: "12,470",
    delta: 3.4,
    icon: "shield-check" as const,
    hint: "rolling avg",
  },
  {
    label: "Failed MFA attempts",
    value: "47",
    delta: -12.1,
    icon: "circle-alert" as const,
    hint: "vs last week",
  },
  {
    label: "Token refresh / min",
    value: "206",
    delta: 0,
    icon: "rotate-ccw" as const,
    hint: "steady state",
  },
];

const NOW = new Date();
const MINS_AGO = (m: number) =>
  new Date(NOW.getTime() - m * 60_000).toISOString();
const HOURS_AGO = (h: number) => MINS_AGO(h * 60);
const DAYS_AGO = (d: number) => MINS_AGO(d * 24 * 60);

export const DASHBOARD_ACTIVITY: ActivityItem[] = [
  {
    id: "evt-1",
    title: "New identity verified",
    description:
      "Tenant acme-prod - credential issued for ada.lovelace@acme.dev",
    timestamp: MINS_AGO(3),
    icon: "badge-check",
    accent: "#10b981",
  },
  {
    id: "evt-2",
    title: "Passkey registered",
    description:
      "grace.hopper@acme.dev added a WebAuthn passkey on Chrome / macOS",
    timestamp: MINS_AGO(11),
    icon: "fingerprint-pattern",
    accent: "#06b6d4",
  },
  {
    id: "evt-3",
    title: "Tenant rotation policy updated",
    description: "Token TTL changed to 15 min for tenant fintech-pilot-04",
    timestamp: MINS_AGO(34),
    icon: "settings",
    accent: "#a855f7",
  },
  {
    id: "evt-4",
    title: "MFA challenge failed",
    description:
      "Three failed TOTP attempts from 102.89.32.x - rate limit engaged",
    timestamp: HOURS_AGO(2),
    icon: "circle-alert",
    accent: "#ef4444",
  },
  {
    id: "evt-5",
    title: "Webhook delivery",
    description:
      "credential.issued → https://api.example.com/hooks/arcid (200, 92ms)",
    timestamp: HOURS_AGO(4),
    icon: "webhook",
    accent: "#22d3ee",
  },
  {
    id: "evt-6",
    title: "OAuth client created",
    description: "SovGrant-prod-app - scopes: openid, profile, email, vc.issue",
    timestamp: HOURS_AGO(6),
    icon: "key-round",
    accent: "#f59e0b",
  },
  {
    id: "evt-7",
    title: "API key revoked",
    description: "demo_live_a82f…31bd - manual revoke by ada.lovelace@acme.dev",
    timestamp: DAYS_AGO(1),
    icon: "shield-x",
    accent: "#ef4444",
  },
  {
    id: "evt-8",
    title: "Compliance export",
    description: "Monthly audit log export ready (24 MB, 124,802 events)",
    timestamp: DAYS_AGO(1),
    icon: "file-down",
    accent: "#10b981",
  },
  {
    id: "evt-9",
    title: "New tenant onboarded",
    description: "acme-edu - education preset, passkey-first, 24-hour TTL",
    timestamp: DAYS_AGO(2),
    icon: "building",
    accent: "#06b6d4",
  },
];

/** Stat cards for the dashboard demo page (a richer variant for the
 *  dedicated page; the home preview uses DASHBOARD_STATS). */
export const DASHBOARD_STATS_FULL = [
  ...DASHBOARD_STATS,
  {
    label: "Webhook success rate",
    value: "99.94%",
    delta: 0.4,
    icon: "webhook" as const,
    hint: "rolling 7 days",
  },
  {
    label: "Avg verification latency",
    value: "184ms",
    delta: -8.1,
    icon: "timer" as const,
    hint: "p50, last 24h",
  },
  {
    label: "OAuth clients",
    value: "23",
    delta: 4.5,
    icon: "key-round" as const,
    hint: "active, non-revoked",
  },
  {
    label: "Open incidents",
    value: "0",
    delta: 0,
    icon: "shield-check" as const,
    hint: "all clear",
  },
];

/** API key demo data for the SecuritySectionCard → ApiKeyManager panel. */
export const DEMO_API_KEYS: ApiKey[] = [
  {
    id: "k-1",
    name: "staging server",
    last4: "f1a2",
    prefix: "demo_live",
    scopes: ["read", "write"],
    createdAt: DAYS_AGO(12),
    expiresAt: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000).toISOString(),
    revoked: false,
  },
  {
    id: "k-2",
    name: "webhook consumer",
    last4: "9bd0",
    prefix: "demo_live",
    scopes: ["read"],
    createdAt: DAYS_AGO(38),
    revoked: false,
  },
  {
    id: "k-3",
    name: "legacy cron",
    last4: "21ce",
    prefix: "demo_live",
    scopes: ["read", "write", "admin"],
    createdAt: DAYS_AGO(120),
    revoked: true,
  },
];

/** Security feature tiles for the /security page's SecuritySectionCard. */
export const SECURITY_FEATURES = [
  {
    id: "mfa",
    title: "Multi-factor authentication",
    description:
      "TOTP, WebAuthn, and step-up MFA driven by domain preset config.",
    icon: "shield-check" as const,
    badge: "Enabled",
  },
  {
    id: "passkeys",
    title: "WebAuthn passkeys",
    description:
      "Phishing-resistant sign-in on every modern browser and platform.",
    icon: "fingerprint-pattern" as const,
    badge: "Optional",
  },
  {
    id: "sessions",
    title: "Session controls",
    description:
      "Per-tenant TTL, idle timeout, and forced re-auth for sensitive actions.",
    icon: "timer" as const,
    badge: "Configurable",
  },
  {
    id: "audit",
    title: "Audit log",
    description:
      "Every auth, issuance, and admin action written to a tenant-scoped log.",
    icon: "file-down" as const,
    badge: "Exportable",
  },
  {
    id: "webhooks",
    title: "Signed webhooks",
    description:
      "HMAC-SHA256 over timestamp+body, exponential backoff, SSRF-guarded redirects.",
    icon: "webhook" as const,
    badge: "Spec-grade",
  },
  {
    id: "apikeys",
    title: "API key management",
    description:
      "Scoped keys with hashed storage, expiry, last-used tracking, and rotation grace.",
    icon: "key-round" as const,
    badge: "Ready UI",
  },
];

/** Account settings sections for the /security page's AccountSettingsPanel. */
export const ACCOUNT_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    description: "Display name, avatar, and locale.",
    icon: "user" as const,
  },
  {
    id: "security",
    label: "Security",
    description: "Password, MFA, and passkey enrollment.",
    icon: "shield-check" as const,
  },
  {
    id: "sessions",
    label: "Sessions",
    description: "Active devices and sign-out everywhere.",
    icon: "monitor" as const,
  },
  {
    id: "api-keys",
    label: "API keys",
    description: "Create, scope, and revoke programmatic access.",
    icon: "key-round" as const,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Email, push, and webhook delivery preferences.",
    icon: "bell" as const,
  },
];
