/**
 * Billing SDK: Subscription only
 *
 * SovGrant: GET /subscription - returns the calling user's active tenant
 * subscription. Self-service plan changes intentionally removed
 * (POST /subscription/upgrade returns 410 Gone).
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type { Subscription } from "./types.js";

/* ── SDK Module ────────────────────────────────────────────── */

export class BillingSdk {
  constructor(private client: ArcIdClient) {}

  getSubscription(): Promise<ApiResponse<Subscription>> {
    return this.client.get<Subscription>("/subscription");
  }
}
