/**
 * Audit SDK: Audit log retrieval with filtering
 *
 * SovGrant paths: /audit/logs
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type { AuditLogEntry, Paginated } from "./types.js";

/* ── Types ─────────────────────────────────────────────────── */

export type AuditListParams = {
  identityId?: string;
  tenantId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

/* ── SDK Module ────────────────────────────────────────────── */

export class AuditSdk {
  constructor(private client: ArcIdClient) {}

  list(
    params?: AuditListParams,
  ): Promise<ApiResponse<Paginated<AuditLogEntry>>> {
    const query = new URLSearchParams();
    if (params?.identityId) query.set("identityId", params.identityId);
    if (params?.tenantId) query.set("tenantId", params.tenantId);
    if (params?.action) query.set("action", params.action);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return this.client.get<Paginated<AuditLogEntry>>(
      `/audit/logs${qs ? `?${qs}` : ""}`,
    );
  }
}
