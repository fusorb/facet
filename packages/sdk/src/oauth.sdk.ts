/**
 * OAuth SDK: Full OIDC provider (clients, tokens, consent, introspection, revocation)
 *
 * SovGrant paths: /oauth/*
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type {
  Consent,
  Jwks,
  OAuthClient,
  OAuthToken,
  OidcUserInfo,
  TokenIntrospection,
} from "./types.js";

/* ── Types ─────────────────────────────────────────────────── */

export type CreateClientParams = {
  name: string;
  redirectUris: string[];
  grantTypes?: (
    "authorization_code" | "refresh_token" | "client_credentials"
  )[];
  scopes?: string[];
  public?: boolean;
  requirePkce?: boolean;
  tenantId?: string;
  projectId?: string;
};

/**
 * Partial update for an OAuth client. Every field optional (PATCH semantics);
 * tenantId is omitted since a client's owning tenant can never change.
 */
export type UpdateClientParams = Partial<Omit<CreateClientParams, "tenantId">>;

export type GrantConsentParams = {
  clientId: string;
  scopes: string[];
};

/* ── SDK Module ────────────────────────────────────────────── */

export class OAuthSdk {
  constructor(private client: ArcIdClient) {}

  /* ── Clients ──────────────────────────────────────────────── */

  listClients(): Promise<ApiResponse<OAuthClient[]>> {
    return this.client.get<OAuthClient[]>("/oauth/clients");
  }

  createClient(data: CreateClientParams): Promise<ApiResponse<OAuthClient>> {
    return this.client.post<OAuthClient>("/oauth/clients", data);
  }

  updateClient(
    clientId: string,
    data: UpdateClientParams,
  ): Promise<ApiResponse<OAuthClient>> {
    return this.client.patch<OAuthClient>(`/oauth/clients/${clientId}`, data);
  }

  deleteClient(clientId: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/oauth/clients/${clientId}`);
  }

  /* ── Tokens ───────────────────────────────────────────────── */

  listTokens(): Promise<ApiResponse<OAuthToken[]>> {
    return this.client.get<OAuthToken[]>("/oauth/tokens");
  }

  revokeToken(tokenId: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/oauth/tokens/${tokenId}`);
  }

  /* ── Consent ──────────────────────────────────────────────── */

  grantConsent(data: GrantConsentParams): Promise<ApiResponse<void>> {
    return this.client.post<void>("/oauth/consent", data);
  }

  revokeConsent(clientId: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/oauth/consent/${clientId}`);
  }

  listConsents(): Promise<ApiResponse<Consent[]>> {
    return this.client.get<Consent[]>("/oauth/consents");
  }

  /* ── Introspection & Revocation ──────────────────────────── */

  introspectToken(token: string): Promise<ApiResponse<TokenIntrospection>> {
    return this.client.post<TokenIntrospection>("/oauth/introspect", { token });
  }

  revokeTokenRFC7009(
    token: string,
    tokenTypeHint?: string,
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>("/oauth/revoke", {
      token,
      token_type_hint: tokenTypeHint,
    });
  }

  /* ── OIDC ─────────────────────────────────────────────────── */

  /** GET /oauth/userinfo: bare OIDC UserInfo payload. */
  userinfo(): Promise<ApiResponse<OidcUserInfo>> {
    return this.client.get<OidcUserInfo>("/oauth/userinfo", { bare: true });
  }

  /** GET /oauth/jwks: bare { keys } payload. */
  jwks(): Promise<ApiResponse<Jwks>> {
    return this.client.get<Jwks>("/oauth/jwks", { bare: true });
  }
}
