/**
 * Domain presets: pre-configured AuthConfig for common domains.
 *
 * Each preset tailors auth behavior (MFA requirement, session TTL,
 * allowed methods, etc.) to the security and UX needs of that domain.
 *
 * Usage:
 *   import { fintechPreset } from "@fusorb/facet-auth";
 *
 *   <SignIn config={fintechPreset} />
 */

import type { AuthConfig } from "./types.js";

/**
 * Fintech: high security, short sessions, mandatory MFA.
 * Passkeys discouraged (device-bound auth is rare in regulated finance).
 */
export const fintechPreset: AuthConfig = {
  requireMfa: true,
  allowPasskey: false,
  allowMagicLink: true,
  sessionTtl: 15, // 15 min
  requireEmailVerification: true,
  requireStepUp: true,
  oauthProviders: [],
};

/**
 * Medical / Healthcare: high security, medium sessions, mandatory MFA.
 * HIPAA considerations: short sessions, no passkeys (shared device risk).
 */
export const medPreset: AuthConfig = {
  requireMfa: true,
  allowPasskey: false,
  allowMagicLink: false, // link-based auth is a security risk in clinical settings
  sessionTtl: 30, // 30 min
  requireEmailVerification: true,
  requireStepUp: true,
  oauthProviders: ["saml", "oidc"], // enterprise SSO
};

/**
 * Education: low friction, long sessions, passkey-friendly.
 * MFA optional: most edu platforms don't mandate it.
 */
export const eduPreset: AuthConfig = {
  requireMfa: false,
  allowPasskey: true,
  allowMagicLink: true,
  sessionTtl: 1440, // 24 hr
  requireEmailVerification: true,
  requireStepUp: false,
  oauthProviders: ["google", "microsoft", "clever"],
};

/**
 * Enterprise: high security, moderate sessions, SSO-first.
 * Passkeys supported (enterprises often use YubiKeys / Windows Hello).
 * Magic links are a security risk in enterprise contexts.
 */
export const enterprisePreset: AuthConfig = {
  requireMfa: true,
  allowPasskey: true,
  allowMagicLink: false,
  sessionTtl: 480, // 8 hr
  requireEmailVerification: true,
  requireStepUp: true,
  oauthProviders: ["saml", "oidc", "google", "microsoft"],
};

/**
 * Default / general-purpose: balanced security and UX.
 */
export const defaultPreset: AuthConfig = {
  requireMfa: false,
  allowPasskey: true,
  allowMagicLink: true,
  sessionTtl: 480, // 8 hr
  requireEmailVerification: true,
  requireStepUp: false,
  oauthProviders: [],
};
