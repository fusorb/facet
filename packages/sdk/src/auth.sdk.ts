/**
 * Auth SDK: Login, register, MFA, sessions, magic link, password management
 *
 * Matches SovGrant's actual /auth/* endpoints (verified against
 * SovGrant src/modules/auth/routes/* + src/lib/api/routes/index.ts).
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type {
  LoginResult,
  OAuthTokenResponse,
  RegisterResult,
  Session,
  TokenBundle,
  User,
} from "./types.js";

/* ── Types ─────────────────────────────────────────────────── */

/** Result of a completed auth flow: tokens + resolved identity. */
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type MfaVerifyResult = TokenBundle;

export type MfaSetupResult = {
  secret: string;
  qrCode: string;
  uri: string;
};

export type RecoveryCodesResult = {
  recoveryCodes: string[];
};

export type StepUpResult = {
  success: true;
  elevatedUntil: string;
};

export type UserProfile = User;

/**
 * Result of POST /auth/switch-context: a new token bundle scoped to the
 * selected tenant (verified against SovGrant's switch-context.route.ts).
 */
export type SwitchContextResult = {
  accessToken: string;
  refreshToken: string;
  idToken: string | null;
  expiresIn: number;
};

/** Normalized refresh result from the bare RFC 6749 token endpoint. */
export type RefreshResult = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string | null;
  expiresIn?: number;
};

/** Params for POST /oauth/token with grant_type=authorization_code. */
export type ExchangeCodeParams = {
  code: string;
  redirectUri: string;
  clientId?: string;
  clientSecret?: string;
  codeVerifier?: string;
};

/** Params for POST /oauth/token with grant_type=client_credentials. */
export type ClientCredentialsParams = {
  clientId?: string;
  clientSecret?: string;
  scope?: string;
};

/** Params for building the OAuth2 / OIDC authorize redirect URL. */
export type AuthorizeUrlParams = {
  clientId?: string;
  redirectUri: string;
  scope?: string;
  state?: string;
  nonce?: string;
  codeChallenge?: string;
  codeChallengeMethod?: "S256" | "plain";
  prompt?: "none" | "login" | "consent" | "select_account";
  maxAge?: number;
};

/** Params for POST /auth/switch-context. */
export type SwitchContextParams = {
  tenantId: string;
};

/**
 * Result of GET /oauth/authorize (SovGrant's JSON authorize API):
 * an authorization code plus echo of state and consent outcome.
 */
export type AuthorizeResult = {
  code: string;
  state?: string;
  consentRequired: boolean;
};

/* ── SDK Module ────────────────────────────────────────────── */

export class AuthSdk {
  constructor(private client: ArcIdClient) {}

  /**
   * POST /auth/login.
   * Returns a sessionId (with requiresMfa) or a full token bundle when
   * MFA is not required for this identity.
   */
  login(email: string, password: string): Promise<ApiResponse<LoginResult>> {
    return this.client.post<LoginResult>("/auth/login", { email, password });
  }

  /** POST /auth/register. SovGrant returns only the identity (no tokens). */
  register(
    name: string,
    email: string,
    password: string,
  ): Promise<ApiResponse<RegisterResult>> {
    return this.client.post<RegisterResult>("/auth/register", {
      name,
      email,
      password,
    });
  }

  logout(sessionId: string): Promise<ApiResponse<void>> {
    return this.client.post<void>("/auth/logout", { sessionId });
  }

  /** GET /identity/profile: resolves the current identity from the bearer token. */
  me(): Promise<ApiResponse<UserProfile>> {
    return this.client.get<UserProfile>("/identity/profile");
  }

  listSessions(): Promise<ApiResponse<Session[]>> {
    return this.client.get<Session[]>("/auth/sessions");
  }

  revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/auth/sessions/${sessionId}`);
  }

  forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.client.post<void>("/auth/password/reset", { email });
  }

  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>("/auth/password/reset/confirm", {
      token,
      newPassword,
    });
  }

  verifyEmail(token: string): Promise<ApiResponse<void>> {
    return this.client.post<void>("/auth/email/verify", { token });
  }

  verifyMfa(
    code: string,
    sessionId: string,
  ): Promise<ApiResponse<TokenBundle>> {
    return this.client.post<TokenBundle>("/auth/mfa/verify", {
      code,
      sessionId,
    });
  }

  setupMfa(): Promise<ApiResponse<MfaSetupResult>> {
    return this.client.post<MfaSetupResult>("/auth/mfa/setup", {
      type: "TOTP",
    });
  }

  confirmMfa(code: string): Promise<ApiResponse<RecoveryCodesResult>> {
    return this.client.post<RecoveryCodesResult>("/auth/mfa/confirm", {
      code,
    });
  }

  disableMfa(): Promise<ApiResponse<void>> {
    return this.client.del<void>("/auth/mfa/disable");
  }

  stepUp(
    method: "password" | "totp" | "passkey",
    sessionId: string,
    credential: {
      password?: string;
      totpCode?: string;
      passkeyResponse?: unknown;
      passkeyChallengeId?: string;
    },
  ): Promise<ApiResponse<StepUpResult>> {
    return this.client.post<StepUpResult>("/auth/step-up", {
      method,
      sessionId,
      ...credential,
    });
  }

  mfaRecovery(
    code: string,
    sessionId: string,
  ): Promise<ApiResponse<TokenBundle>> {
    return this.client.post<TokenBundle>("/auth/mfa/recovery", {
      code,
      sessionId,
    });
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>("/auth/password/change", {
      currentPassword,
      newPassword,
    });
  }

  requestMagicLink(email: string): Promise<ApiResponse<void>> {
    return this.client.post<void>("/auth/magic-link/request", { email });
  }

  authenticateMagicLink(token: string): Promise<ApiResponse<LoginResult>> {
    return this.client.post<LoginResult>("/auth/magic-link", { token });
  }

  /**
   * POST /oauth/token (bare RFC 6749 response).
   * Normalizes snake_case access_token/refresh_token to camelCase.
   *
   * Sends `client_id` when the client was configured with one (required by
   * SovGrant for all third-party clients per TokenExchangeSchema).
   */
  async refresh(refreshToken: string): Promise<ApiResponse<RefreshResult>> {
    const clientId = this.client.getClientId();
    const res = await this.client.post<OAuthTokenResponse>(
      "/oauth/token",
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: this.client.getClientSecret(),
      },
      { bare: true },
    );
    if (res.data) {
      return {
        data: {
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
          idToken: res.data.id_token ?? null,
          expiresIn: res.data.expires_in,
        },
        error: null,
      };
    }
    return res as unknown as ApiResponse<RefreshResult>;
  }

  /**
   * POST /oauth/token with grant_type=authorization_code (OAuth2 / OIDC).
   * Exchanges an authorization code for tokens. For PKCE clients pass the
   * same `codeVerifier` used to build the authorize URL.
   */
  async exchangeCode(
    params: ExchangeCodeParams,
  ): Promise<ApiResponse<RefreshResult>> {
    const clientId = params.clientId ?? this.client.getClientId();
    const res = await this.client.post<OAuthTokenResponse>(
      "/oauth/token",
      {
        grant_type: "authorization_code",
        code: params.code,
        redirect_uri: params.redirectUri,
        client_id: clientId,
        client_secret: params.clientSecret ?? this.client.getClientSecret(),
        code_verifier: params.codeVerifier,
      },
      { bare: true },
    );
    if (res.data) {
      return {
        data: {
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
          idToken: res.data.id_token ?? null,
          expiresIn: res.data.expires_in,
        },
        error: null,
      };
    }
    return res as unknown as ApiResponse<RefreshResult>;
  }

  /**
   * POST /oauth/token with grant_type=client_credentials.
   * Service-to-service tokens. Requires client_id (+ secret for
   * confidential clients).
   */
  async clientCredentials(
    params?: ClientCredentialsParams,
  ): Promise<ApiResponse<RefreshResult>> {
    const clientId = params?.clientId ?? this.client.getClientId();
    const res = await this.client.post<OAuthTokenResponse>(
      "/oauth/token",
      {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: params?.clientSecret ?? this.client.getClientSecret(),
        scope: params?.scope,
      },
      { bare: true },
    );
    if (res.data) {
      return {
        data: {
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
          idToken: res.data.id_token ?? null,
          expiresIn: res.data.expires_in,
        },
        error: null,
      };
    }
    return res as unknown as ApiResponse<RefreshResult>;
  }

  /**
   * GET /oauth/authorize - SovGrant's authorize endpoint is a JSON API
   * (not a browser redirect): pass the caller's bearer token and it
   * returns `{ code, state, consentRequired }`. Exchange the code with
   * `exchangeCode()`. For PKCE, generate a code_verifier/code_challenge
   * (S256) and pass `codeChallenge`.
   */
  async authorize(
    params: AuthorizeUrlParams,
  ): Promise<ApiResponse<AuthorizeResult>> {
    const qs = new URLSearchParams({
      client_id: params.clientId ?? this.client.getClientId() ?? "",
      response_type: "code",
      redirect_uri: params.redirectUri,
    });
    if (params.scope) qs.set("scope", params.scope);
    if (params.state) qs.set("state", params.state);
    if (params.nonce) qs.set("nonce", params.nonce);
    if (params.codeChallenge) {
      qs.set("code_challenge", params.codeChallenge);
      qs.set("code_challenge_method", params.codeChallengeMethod ?? "S256");
    }
    if (params.prompt) qs.set("prompt", params.prompt);
    if (params.maxAge != null) qs.set("max_age", String(params.maxAge));
    return this.client.get<AuthorizeResult>(
      `/oauth/authorize?${qs.toString()}`,
    );
  }

  /**
   * Build the OAuth2 / OIDC authorize URL for the redirect-flow model.
   * SovGrant's own /oauth/authorize is a JSON API (see `authorize()`), but
   * this helper is kept for frontends that proxy the OIDC redirect or for
   * documentation. For PKCE, pass the S256 `codeChallenge`.
   */
  authorizeUrl(params: AuthorizeUrlParams): string {
    const qs = new URLSearchParams({
      client_id: params.clientId ?? this.client.getClientId() ?? "",
      response_type: "code",
      redirect_uri: params.redirectUri,
    });
    if (params.scope) qs.set("scope", params.scope);
    if (params.state) qs.set("state", params.state);
    if (params.nonce) qs.set("nonce", params.nonce);
    if (params.codeChallenge) {
      qs.set("code_challenge", params.codeChallenge);
      qs.set("code_challenge_method", params.codeChallengeMethod ?? "S256");
    }
    if (params.prompt) qs.set("prompt", params.prompt);
    if (params.maxAge != null) qs.set("max_age", String(params.maxAge));
    const base = this.client.getBaseUrl();
    return `${base}/oauth/authorize?${qs.toString()}`;
  }

  /**
   * POST /auth/switch-context: swap the active tenant context and receive a
   * new token bundle scoped to that tenant (tid claim).
   */
  switchContext(
    params: SwitchContextParams,
  ): Promise<ApiResponse<SwitchContextResult>> {
    return this.client.post<SwitchContextResult>(
      "/auth/switch-context",
      params,
    );
  }

  setUsername(name: string): Promise<ApiResponse<void>> {
    return this.client.patch<void>("/auth/username", { name });
  }
}
