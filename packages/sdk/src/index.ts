/**
 * @fusorb/facet-sdk: arc-id API client
 *
 * Pure fetch. No framework dependencies.
 *
 * First-party app (own arc-id backend - session-based auth):
 *   import { ArcIdClient, AuthSdk } from "@fusorb/facet-sdk";
 *
 *   const client = new ArcIdClient({ baseUrl: "https://auth.arcevo.dev/api/v1" });
 *   const auth = new AuthSdk(client);
 *   const { data, error } = await auth.login("email", "password");
 *
 * Third-party / external integration (shared arc-id instance - OAuth2/OIDC):
 *   const client = new ArcIdClient({
 *     baseUrl: "https://auth.arcevo.dev/api/v1",
 *     clientId: "my-app-id",          // registered OAuth client
 *     clientSecret: "…",              // only for confidential clients
 *   });
 *   const auth = new AuthSdk(client);
 *
 *   // 1. Send the user to the authorize URL (PKCE recommended).
 *   const url = auth.authorizeUrl({
 *     redirectUri: "https://app.dev/callback",
 *     scope: "openid profile email",
 *     codeChallenge: "…",             // S256 hash of your verifier
 *   });
 *   // 2. Exchange the returned ?code= for tokens.
 *   const { data } = await auth.exchangeCode({
 *     code: "…",
 *     redirectUri: "https://app.dev/callback",
 *     codeVerifier: "…",
 *   });
 *   // 3. Refresh later (client_id is sent automatically).
 *   const next = await auth.refresh(data.refreshToken!);
 */

export { ArcIdClient } from "./client.js";
export type {
  ApiError,
  ApiEnvelope,
  ApiResponse,
  ArcIdClientConfig,
  RequestOptions,
} from "./client.js";

export { AuthSdk } from "./auth.sdk.js";
export type {
  TokenPair,
  MfaVerifyResult,
  MfaSetupResult,
  RecoveryCodesResult,
  StepUpResult,
  UserProfile,
  SwitchContextResult,
  RefreshResult,
  ExchangeCodeParams,
  ClientCredentialsParams,
  AuthorizeUrlParams,
  SwitchContextParams,
  AuthorizeResult,
} from "./auth.sdk.js";

export type {
  User,
  Membership,
  Session,
  Device,
  LinkedAccount,
  ExternalId,
  Delegation,
  LoginResult,
  RegisterResult,
  TokenBundle,
  OAuthTokenResponse,
  OAuthClient,
  OAuthToken,
  Consent,
  TokenIntrospection,
  OidcUserInfo,
  Jwks,
  JwkKey,
  Tenant,
  TenantPolicy,
  TenantDid,
  SigningKey,
  Project,
  OnboardingFlow,
  OnboardingStep,
  InviteAcceptResult,
  WebhookEndpoint,
  WebhookEvent,
  Subscription,
  AuditLogEntry,
  IdpConnection,
  Credential,
  IssueCredentialParams,
  VerificationSession,
  VerificationResult,
  StatusList,
  Passkey,
  OnboardingSession,
  Paginated,
  JsonObject,
  JsonValue,
} from "./types.js";

export { PasskeySdk } from "./passkey.sdk.js";
export type {
  PasskeyRegistrationOptions,
  PasskeyAuthenticationOptions,
  PasskeyRegisterResult,
} from "./passkey.sdk.js";

export { VcSdk } from "./vcs.sdk.js";

export { IdentitySdk } from "./identity.sdk.js";

export { OAuthSdk } from "./oauth.sdk.js";
export type {
  CreateClientParams,
  UpdateClientParams,
  GrantConsentParams,
} from "./oauth.sdk.js";

export { TenantSdk } from "./tenant.sdk.js";

export { BillingSdk } from "./billing.sdk.js";

export { WebhooksSdk } from "./webhooks.sdk.js";
export type { CreateWebhookParams, UpdateWebhookParams, ListEventsParams } from "./webhooks.sdk.js";

export { AuditSdk } from "./audit.sdk.js";
export type { AuditListParams } from "./audit.sdk.js";

export { IdpSdk } from "./idp.sdk.js";
export type { CreateConnectionParams } from "./idp.sdk.js";
