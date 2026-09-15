/**
 * Identity SDK: Profile, admin, devices, linked accounts, external IDs,
 * delegations, onboarding, wallet DID
 *
 * SovGrant paths: /identity/*
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type {
  Delegation,
  Device,
  ExternalId,
  JsonObject,
  LinkedAccount,
  OnboardingSession,
  Paginated,
  User,
} from "./types.js";

/* ── SDK Module ────────────────────────────────────────────── */

export class IdentitySdk {
  constructor(private client: ArcIdClient) {}

  /* ── Admin ─────────────────────────────────────────────── */

  list(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Paginated<User>>> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return this.client.get<Paginated<User>>(
      `/identity/admin${q ? `?${q}` : ""}`,
    );
  }

  suspend(id: string, reason?: string): Promise<ApiResponse<void>> {
    return this.client.post<void>(`/identity/admin/${id}/suspend`, {
      reason,
    });
  }

  reinstate(id: string, reason?: string): Promise<ApiResponse<void>> {
    return this.client.patch<void>(
      `/identity/${id}/status`,
      reason ? { status: "ACTIVE", reason } : { status: "ACTIVE" },
    );
  }

  /* ── Profile ───────────────────────────────────────────── */

  updateProfile(data: {
    name?: string;
    picture?: string;
    metadata?: JsonObject;
  }): Promise<ApiResponse<void>> {
    return this.client.patch<void>("/identity/profile", data);
  }

  deleteAccount(): Promise<ApiResponse<void>> {
    return this.client.del<void>("/identity/profile");
  }

  /* ── Devices ───────────────────────────────────────────── */

  listDevices(): Promise<ApiResponse<Device[]>> {
    return this.client.get<Device[]>("/identity/devices");
  }

  deleteDevice(id: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/identity/devices/${id}`);
  }

  /* ── Linked Accounts ───────────────────────────────────── */

  listLinkedAccounts(): Promise<ApiResponse<LinkedAccount[]>> {
    return this.client.get<LinkedAccount[]>("/identity/linked-accounts");
  }

  unlinkLinkedAccount(id: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/identity/linked-accounts/${id}`);
  }

  /* ── External IDs ──────────────────────────────────────── */

  listExternalIds(): Promise<ApiResponse<ExternalId[]>> {
    return this.client.get<ExternalId[]>("/identity/external-ids");
  }

  linkExternalId(data: {
    provider: string;
    externalId: string;
  }): Promise<ApiResponse<void>> {
    return this.client.post<void>("/identity/external-ids", data);
  }

  unlinkExternalId(id: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/identity/external-ids/${id}`);
  }

  /* ── Delegations ───────────────────────────────────────── */

  listDelegations(): Promise<ApiResponse<Delegation[]>> {
    return this.client.get<Delegation[]>("/identity/delegations");
  }

  createDelegation(data: {
    subjectId: string;
    scope: string;
    expiresAt?: string;
  }): Promise<ApiResponse<Delegation>> {
    return this.client.post<Delegation>("/identity/delegations", data);
  }

  revokeDelegation(id: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/identity/delegations/${id}`);
  }

  /* ── Onboarding ────────────────────────────────────────── */

  startOnboarding(flowId: string): Promise<ApiResponse<OnboardingSession>> {
    return this.client.post<OnboardingSession>("/identity/onboarding/start", {
      flowId,
    });
  }

  getOnboardingProgress(
    progressId: string,
  ): Promise<ApiResponse<OnboardingSession>> {
    return this.client.get<OnboardingSession>(
      `/identity/onboarding/${progressId}`,
    );
  }

  advanceOnboarding(
    progressId: string,
    stepId: string,
    data?: JsonObject,
  ): Promise<ApiResponse<OnboardingSession>> {
    return this.client.post<OnboardingSession>(
      `/identity/onboarding/${progressId}/advance`,
      {
        stepId,
        ...data,
      },
    );
  }

  /* ── Wallet DID ────────────────────────────────────────── */

  registerWalletDid(data: {
    publicKeyJwk: JsonObject;
    provider: string;
    providerWalletId: string;
  }): Promise<ApiResponse<void>> {
    return this.client.post<void>("/identity/wallet/did", data);
  }
}
