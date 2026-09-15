/**
 * @fusorb/facet-sdk: Strict domain types
 *
 * Concrete response shapes for every SovGrant endpoint. Replace the
 * previous `Record<string, unknown>` blobs so consumers get typed
 * access to API responses without casting.
 *
 * Optionality mirrors SovGrant's actual responses: ids/keys are always
 * present on created resources; nested objects are populated or null
 * depending on the endpoint.
 */

/* ── Generic JSON (for genuinely arbitrary payloads) ────────── */

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

/* ── Identity / user ───────────────────────────────────────── */

export interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  name: string;
  /** Optional avatar URL */
  picture?: string;
  username?: string;
  roles?: string[];
  status?: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING";
  metadata?: JsonObject;
  createdAt?: string;
  updatedAt?: string;
  plan?: string;
  tenantId?: string | null;
  memberships: Membership[];
}

export interface Membership {
  tenantId: string;
  role: string;
  status?: string;
  joinedAt?: string;
  /** Optional scoped permissions */
  permissions?: string[];
  /** Display name of the tenant/membership */
  name?: string;
}

export interface Session {
  id: string;
  identityId?: string;
  userAgent?: string;
  ip?: string;
  valid?: boolean;
  authLevel?: "aal1" | "aal2";
  createdAt: string;
  expiresAt: string;
  lastUsedAt?: string;
}

export interface Device {
  id: string;
  name: string;
  platform?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface LinkedAccount {
  id: string;
  provider: string;
  providerAccountId: string;
  linkedAt: string;
}

export interface ExternalId {
  id: string;
  provider: string;
  externalId: string;
  linkedAt?: string;
}

export interface Delegation {
  id: string;
  subjectId: string;
  scope: string;
  createdAt: string;
  expiresAt?: string | null;
}

/* ── Auth ──────────────────────────────────────────────────── */

export interface LoginResult {
  identity: User;
  sessionId: string;
  requiresMfa: boolean;
  mfaEnrollmentRequired: boolean;
  mfaTypes: string[];
  /** Present only when MFA is not required. */
  accessToken?: string;
  refreshToken?: string;
  idToken?: string | null;
  expiresIn?: number;
}

export interface RegisterResult {
  identity: User;
}

/** Returned by /auth/mfa/verify and /auth/mfa/recovery. */
export interface TokenBundle {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
  expiresIn: number;
}

/** Bare RFC 6749 response from POST /oauth/token. */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface MfaSetupResult {
  secret: string;
  uri: string;
  qrCode: string;
}

export interface RecoveryCodesResult {
  recoveryCodes: string[];
}

export interface StepUpResult {
  success: true;
  elevatedUntil: string;
}

export interface SwitchContextResult extends TokenBundle {
  tenantId?: string;
}

/* ── OAuth / OIDC ──────────────────────────────────────────── */

export interface OAuthClient {
  id: string;
  clientId?: string;
  clientSecret?: string;
  name: string;
  projectId?: string;
  redirectUris: string[];
  grantTypes?: string[];
  scopes?: string[];
  public?: boolean;
  requirePkce?: boolean;
  logoUri?: string;
  tosUri?: string;
  policyUri?: string;
  createdAt: string;
}

export interface OAuthToken {
  id: string;
  clientId: string;
  clientName?: string;
  scopes: string[];
  issuedAt?: string;
  expiresAt: string;
  createdAt: string;
  revoked?: boolean;
}

export interface Consent {
  id?: string;
  clientId: string;
  clientName?: string;
  scopes: string[];
  grantedAt: string;
}

export interface TokenIntrospection {
  active: boolean;
  clientId?: string;
  scope?: string;
  exp?: number;
  sub?: string;
}

export interface OidcUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  plan?: string;
}

export interface Jwks {
  keys: JwkKey[];
}

export interface JwkKey {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
}

/* ── Tenancy ───────────────────────────────────────────────── */

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  sector?: string;
  plan?: string;
  role?: string;
  createdAt: string;
}

export interface TenantPolicy {
  requireMfa?: boolean;
  passwordRules?: JsonObject;
  loginMethods?: string[];
}

export interface TenantDid {
  did: string;
  didDocument?: JsonObject;
  createdAt: string;
}

export interface SigningKey {
  kid: string;
  createdAt: string;
  expiresAt?: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
}

export interface Project {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  tenantId: string;
  createdAt: string;
}

export interface OnboardingFlow {
  id: string;
  projectId: string;
  name?: string;
  steps: OnboardingStep[];
  createdAt: string;
}

export interface OnboardingStep {
  id: string;
  type: string;
  title?: string;
  order: number;
}

export interface InviteAcceptResult {
  message: string;
  tenantSlug: string;
}

/* ── Webhooks ──────────────────────────────────────────────── */

export interface WebhookEndpoint {
  id: string;
  url: string;
  /** Secret is only returned at creation time. */
  secret?: string;
  eventTypes: string[];
  enabled: boolean;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  eventType: string;
  status: string;
  attempts: number;
  payload?: JsonObject;
  createdAt: string;
}

/* ── Billing / audit / IdP / credentials ───────────────────── */

export interface Subscription {
  tenantId: string;
  plan: string;
  status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELED";
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId?: string;
  identityId?: string;
  tenantId?: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
  metadata?: JsonObject;
}

export interface IdpConnection {
  id: string;
  tenantId?: string;
  name: string;
  type: "SAML2" | "OIDC" | "OAUTH2";
  clientId?: string;
  clientSecret?: string;
  entryPoint?: string;
  issuer?: string;
  metadataUrl?: string;
  cert?: string;
  enabled: boolean;
  createdAt: string;
}

export interface Credential {
  id: string;
  format?: string;
  type: string;
  issuerDid?: string;
  subjectDid?: string;
  issuedAt: string;
  expiresAt?: string | null;
  credentialSubject?: JsonObject;
}

/** POST /credentials/issue request body -- mirrors IssueCredentialSchema. */
export interface IssueCredentialParams {
  subjectDid: string;
  credentialSubject: JsonObject;
  format?: "JWT" | "LDP" | "SD_JWT";
  holderId?: string;
  schemaId?: string;
  expiresAt?: string;
}

export interface VerificationSession {
  sessionId: string;
  challenge: string;
  expiresAt: string;
}

export interface VerificationResult {
  valid: boolean;
  claims?: JsonObject;
  sessionId?: string;
  reason?: string;
}

export interface StatusList {
  id: string;
  bits: string;
  status: string;
}

export interface Passkey {
  id: string;
  credentialId: string;
  deviceType?: string;
  backedUp?: boolean;
  transports?: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface OnboardingSession {
  flowId: string;
  progressId: string;
  currentStep: string;
  steps: OnboardingStep[];
  status: "IN_PROGRESS" | "COMPLETED";
}

/* ── Shared pagination envelope ────────────────────────────── */

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
