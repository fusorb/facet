/**
 * IdP SDK: SAML2 / OIDC / OAUTH2 enterprise identity provider connections
 *
 * SovGrant paths: /idp/connections/*
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type { IdpConnection } from "./types.js";

/* ── Types ─────────────────────────────────────────────────── */

export type CreateConnectionParams = {
  tenantId: string;
  name: string;
  type: "SAML2" | "OIDC" | "OAUTH2";
  clientId?: string;
  clientSecret?: string;
  entryPoint?: string;
  issuer?: string;
  metadataUrl?: string;
  cert?: string;
};

/* ── SDK Module ────────────────────────────────────────────── */

export class IdpSdk {
  constructor(private client: ArcIdClient) {}

  listConnections(): Promise<ApiResponse<IdpConnection[]>> {
    return this.client.get<IdpConnection[]>("/idp/connections");
  }

  getConnection(id: string): Promise<ApiResponse<IdpConnection>> {
    return this.client.get<IdpConnection>(`/idp/connections/${id}`);
  }

  createConnection(
    data: CreateConnectionParams,
  ): Promise<ApiResponse<IdpConnection>> {
    return this.client.post<IdpConnection>("/idp/connections", data);
  }

  updateConnection(
    id: string,
    data: Partial<CreateConnectionParams>,
  ): Promise<ApiResponse<IdpConnection>> {
    return this.client.patch<IdpConnection>(`/idp/connections/${id}`, data);
  }

  deleteConnection(id: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/idp/connections/${id}`);
  }
}
