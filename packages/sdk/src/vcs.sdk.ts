/**
 * Verifiable Credentials (VC) SDK: VC lifecycle, offers, verification, DID documents
 *
 * SovGrant paths: /credentials/*
 * Verified: /credentials/verify, /credentials/verify/session and
 * /credentials/verify/present return bare payloads (no envelope).
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type {
  Credential,
  IssueCredentialParams,
  JsonObject,
  StatusList,
  VerificationResult,
  VerificationSession,
} from "./types.js";

/* ── SDK Module ────────────────────────────────────────────── */

export class VcSdk {
  constructor(private client: ArcIdClient) {}

  /** GET /credentials: list credentials held by the authenticated identity. */
  list(): Promise<ApiResponse<Credential[]>> {
    return this.client.get<Credential[]>("/credentials");
  }

  /** POST /credentials/verify: verify a Verifiable Credential string. Bare response. */
  verify(credential: string): Promise<ApiResponse<VerificationResult>> {
    return this.client.post<VerificationResult>(
      "/credentials/verify",
      { credential },
      { bare: true },
    );
  }

  /** POST /credentials/issue: issue a new credential. */
  issue(data: IssueCredentialParams): Promise<ApiResponse<void>> {
    return this.client.post<void>("/credentials/issue", data);
  }

  /** POST /credentials/offers: create a credential offer. */
  offer(data: {
    credentialId: string;
    expiresAt?: string;
  }): Promise<ApiResponse<{ token: string; expiresAt: string }>> {
    return this.client.post<{ token: string; expiresAt: string }>(
      "/credentials/offers",
      data,
    );
  }

  /** POST /credentials/revoke: revoke a credential by ID. */
  revoke(credentialId: string): Promise<ApiResponse<void>> {
    return this.client.post<void>("/credentials/revoke", { credentialId });
  }

  /** POST /credentials/offers/:token/accept: accept a credential offer. */
  acceptOffer(token: string): Promise<ApiResponse<void>> {
    return this.client.post<void>(`/credentials/offers/${token}/accept`);
  }

  /** POST /credentials/verify/session: create a verification session. Bare response. */
  createVerificationSession(
    credentialRef?: string,
  ): Promise<ApiResponse<VerificationSession>> {
    return this.client.post<VerificationSession>(
      "/credentials/verify/session",
      credentialRef ? { credentialRef } : undefined,
      { bare: true },
    );
  }

  /** POST /credentials/verify/present: present a credential for verification. Bare response. */
  presentForVerification(data: {
    sessionId: string;
    credential: unknown;
    proof: unknown;
  }): Promise<ApiResponse<VerificationResult>> {
    return this.client.post<VerificationResult>(
      "/credentials/verify/present",
      data,
      {
        bare: true,
      },
    );
  }

  /** GET /credentials/status-lists/:id: resolve a Bitstring Status List. Bare response. */
  getStatusList(id: string): Promise<ApiResponse<StatusList>> {
    return this.client.get<StatusList>(`/credentials/status-lists/${id}`, {
      bare: true,
    });
  }

  /** GET /credentials/tenants/:slug/did.json: resolve a tenant's DID document. Bare response. */
  resolveTenantDidDoc(
    slug: string,
  ): Promise<ApiResponse<{ did: string; didDocument?: JsonObject }>> {
    return this.client.get<{ did: string; didDocument?: JsonObject }>(
      `/credentials/tenants/${slug}/did.json`,
      { bare: true },
    );
  }
}
