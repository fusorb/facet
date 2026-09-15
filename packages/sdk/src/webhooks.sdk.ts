/**
 * Webhooks SDK: Endpoint management, delivery events, test pings, retries
 *
 * SovGrant paths: /webhooks/endpoints/*, /webhooks/events/*
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type { WebhookEndpoint, WebhookEvent } from "./types.js";

/* ── Types ─────────────────────────────────────────────────── */

export type CreateWebhookParams = {
  url: string;
  eventTypes: string[];
  secret?: string;
  enabled?: boolean;
};

export type UpdateWebhookParams = {
  url?: string;
  eventTypes?: string[];
  enabled?: boolean;
};

export type ListEventsParams = {
  status?: string;
  cursor?: string;
  limit?: number;
};

/* ── SDK Module ────────────────────────────────────────────── */

export class WebhooksSdk {
  constructor(private client: ArcIdClient) {}

  list(): Promise<ApiResponse<WebhookEndpoint[]>> {
    return this.client.get<WebhookEndpoint[]>("/webhooks/endpoints");
  }

  create(data: CreateWebhookParams): Promise<ApiResponse<WebhookEndpoint>> {
    return this.client.post<WebhookEndpoint>("/webhooks/endpoints", data);
  }

  update(
    id: string,
    data: UpdateWebhookParams,
  ): Promise<ApiResponse<WebhookEndpoint>> {
    return this.client.patch<WebhookEndpoint>(
      `/webhooks/endpoints/${id}`,
      data,
    );
  }

  delete(id: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/webhooks/endpoints/${id}`);
  }

  test(id: string): Promise<ApiResponse<void>> {
    return this.client.post<void>(`/webhooks/endpoints/${id}/test`);
  }

  listEvents(params?: ListEventsParams): Promise<ApiResponse<WebhookEvent[]>> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return this.client.get<WebhookEvent[]>(
      `/webhooks/events${q ? `?${q}` : ""}`,
    );
  }

  retryEvent(id: string): Promise<ApiResponse<void>> {
    return this.client.post<void>(`/webhooks/events/${id}/retry`);
  }
}
