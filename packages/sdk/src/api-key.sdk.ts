/**
 * API Key SDK: machine-to-machine key management
 *
 * SovGrant paths: /api-keys, /api-keys/create, /api-keys/:id
 */

import { SgClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type { ApiKey } from "./types.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface CreateApiKeyParams {
  /** Human-readable label (max 128 chars). */
  name: string;
  /** Defaults to ["identity:read"] server-side when omitted. */
  scopes?: string[];
}

export interface CreatedApiKey {
  id: string;
  name: string;
  /** Plaintext key - returned exactly once, never retrievable again. */
  key: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
}

/* ── SDK Module ────────────────────────────────────────────── */

export class ApiKeySdk {
  constructor(private client: SgClient) {}

  /** GET /api-keys - the caller's keys (metadata only, never the secret). */
  list(): Promise<ApiResponse<ApiKey[]>> {
    return this.client.get<ApiKey[]>("/api-keys");
  }

  /**
   * POST /api-keys/create - issue a key.
   *
   * The plaintext key is present on this response only; store it at once.
   * Requires the `api-key:create` permission.
   */
  create(data: CreateApiKeyParams): Promise<ApiResponse<CreatedApiKey>> {
    return this.client.post<CreatedApiKey>("/api-keys/create", data);
  }

  /** DELETE /api-keys/:id - revoke; the key can no longer authenticate. */
  revoke(id: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/api-keys/${id}`);
  }
}
