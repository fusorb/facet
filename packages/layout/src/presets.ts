/**
 * @fusorb/facet-layout: Domain presets
 *
 * Five pre-built LayoutConfig presets matching @fusorb/facet-auth presets.
 * Consumers mix-and-match: authPreset + layoutPreset for a complete domain.
 */

import type { LayoutConfig } from "./types.js";

/**
 * Fintech: high security, branded for regulated finance.
 * Tenant-scoped, billing-aware.
 */
export const fintechLayoutPreset: LayoutConfig = {
  brand: {
    name: "facet",
    tagline: "Sovereign Identity Engine",
    benefits: [
      "Passkey-native authentication",
      "Multi-tenant by design",
      "WebAuthn + TOTP MFA",
      "Real-time fraud monitoring",
    ],
  },
  navigation: [
    {
      title: "Overview",
      items: [{ href: "/dashboard", label: "Dashboard" }],
    },
    {
      title: "Security",
      items: [
        { href: "/security/sessions", label: "Sessions" },
        { href: "/security/mfa", label: "Two-Factor" },
        { href: "/security/audit", label: "Audit Log" },
      ],
    },
    {
      title: "Billing",
      items: [{ href: "/billing", label: "Billing" }],
    },
    {
      title: "Account",
      items: [{ href: "/settings/profile", label: "Profile" }],
    },
  ],
  features: { tenantSwitcher: true },
};

/**
 * Medical / Healthcare: HIPAA-aware, audit-first.
 */
export const medLayoutPreset: LayoutConfig = {
  brand: {
    name: "facet",
    tagline: "Secure Healthcare Identity",
    benefits: [
      "HIPAA-compliant authentication",
      "Enterprise SSO (SAML/OIDC)",
      "Granular audit trails",
      "Role-based access control",
    ],
  },
  navigation: [
    {
      title: "Overview",
      items: [{ href: "/dashboard", label: "Dashboard" }],
    },
    {
      title: "Security",
      items: [
        { href: "/security/sessions", label: "Sessions" },
        { href: "/security/audit", label: "Audit Log" },
      ],
    },
    {
      title: "Account",
      items: [{ href: "/settings/profile", label: "Profile" }],
    },
  ],
  features: { tenantSwitcher: true },
};

/**
 * Education: low friction, content-first.
 * No tenant switching (single-organisation by default).
 */
export const eduLayoutPreset: LayoutConfig = {
  brand: {
    name: "facet",
    tagline: "Learning Identity Platform",
    benefits: [
      "Social login (Google, Microsoft, Clever)",
      "Passkey-friendly",
      "24-hour persistent sessions",
      "Self-service account recovery",
    ],
  },
  navigation: [
    {
      title: "Overview",
      items: [{ href: "/dashboard", label: "Dashboard" }],
    },
    {
      title: "Content",
      items: [{ href: "/content", label: "My Content" }],
    },
    {
      title: "Account",
      items: [{ href: "/settings/profile", label: "Profile" }],
    },
  ],
  features: { tenantSwitcher: false },
};

/**
 * Enterprise: SSO-first, permission-aware, multi-tenant.
 */
export const enterpriseLayoutPreset: LayoutConfig = {
  brand: {
    name: "facet",
    tagline: "Enterprise Identity Platform",
    benefits: [
      "Enterprise SSO (SAML/OIDC)",
      "Hardware security key support",
      "Multi-tenant administration",
      "Comprehensive audit logging",
    ],
  },
  navigation: [
    {
      title: "Overview",
      items: [{ href: "/dashboard", label: "Dashboard" }],
    },
    {
      title: "Administration",
      items: [
        { href: "/admin", label: "Admin" },
        { href: "/identities", label: "Identities" },
        { href: "/tenants", label: "Tenants" },
      ],
    },
    {
      title: "Security",
      items: [
        { href: "/security/sessions", label: "Sessions" },
        { href: "/security/passkeys", label: "Passkeys" },
        { href: "/security/mfa", label: "Two-Factor" },
        { href: "/security/audit", label: "Audit Log" },
      ],
    },
    {
      title: "Developers",
      items: [
        { href: "/oauth/applications", label: "OAuth Apps" },
        { href: "/developer/webhooks", label: "Webhooks" },
      ],
    },
    {
      title: "Account",
      items: [{ href: "/settings/profile", label: "Profile" }],
    },
  ],
  features: { tenantSwitcher: true },
};

/**
 * Default / general-purpose: balanced, minimal.
 */
export const defaultLayoutPreset: LayoutConfig = {
  brand: {
    name: "App",
    tagline: "Welcome",
  },
  navigation: [
    {
      title: "Overview",
      items: [{ href: "/dashboard", label: "Dashboard" }],
    },
    {
      title: "Account",
      items: [{ href: "/settings/profile", label: "Profile" }],
    },
  ],
  features: { tenantSwitcher: false },
};
