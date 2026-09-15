/**
 * Passkey SDK: WebAuthn registration and authentication
 *
 * SovGrant paths: /auth/passkey/*
 * Verified: options endpoints return { options, challengeId }; verify
 * endpoints take { response, challengeId }.
 */

import { ArcIdClient } from "./client.js";
import type { ApiResponse } from "./client.js";
import type { TokenPair } from "./auth.sdk.js";
import type { Passkey, TokenBundle, User } from "./types.js";

/* ── WebAuthn types ────────────────────────────────────────── */

export type PasskeyRegistrationOptions = {
  options: PublicKeyCredentialCreationOptionsJSON;
  challengeId: string;
};

export type PasskeyAuthenticationOptions = {
  options: PublicKeyCredentialRequestOptionsJSON;
  challengeId: string;
};

/** PublicKeyCredential* JSON serialization shapes (WebAuthn Level 3). */
export interface PublicKeyCredentialCreationOptionsJSON {
  rp: { id: string; name: string };
  user: { id: string; name: string; displayName: string };
  challenge: string;
  pubKeyCredParams: Array<{ alg: number; type: string }>;
  timeout?: number;
  excludeCredentials?: Array<{ id: string; type: string }>;
  authenticatorSelection?: {
    authenticatorAttachment?: string;
    residentKey?: string;
    userVerification?: string;
  };
  attestation?: string;
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{ id: string; type: string }>;
  userVerification?: string;
}

export type PasskeyRegisterResult = {
  passkey: Passkey;
  user: User;
};

/** POST /auth/passkey/authenticate returns tokens in the flow. */
export type PasskeyAuthenticateResult = TokenPair | TokenBundle;

/* ── SDK Module ────────────────────────────────────────────── */

export class PasskeySdk {
  constructor(private client: ArcIdClient) {}

  list(): Promise<ApiResponse<Passkey[]>> {
    return this.client.get<Passkey[]>("/auth/passkey");
  }

  /** POST /auth/passkey/options/register. No body required by SovGrant. */
  registrationOptions(): Promise<ApiResponse<PasskeyRegistrationOptions>> {
    return this.client.post<PasskeyRegistrationOptions>(
      "/auth/passkey/options/register",
      undefined,
    );
  }

  register(data: {
    response: unknown;
    challengeId: string;
  }): Promise<ApiResponse<PasskeyRegisterResult>> {
    return this.client.post<PasskeyRegisterResult>(
      "/auth/passkey/register",
      data,
    );
  }

  authenticationOptions(
    identityId?: string,
  ): Promise<ApiResponse<PasskeyAuthenticationOptions>> {
    return this.client.post<PasskeyAuthenticationOptions>(
      "/auth/passkey/options/authenticate",
      identityId ? { identityId } : undefined,
    );
  }

  authenticate(data: {
    response: unknown;
    challengeId: string;
  }): Promise<ApiResponse<PasskeyAuthenticateResult>> {
    return this.client.post<PasskeyAuthenticateResult>(
      "/auth/passkey/authenticate",
      data,
    );
  }

  deregister(passkeyId: string): Promise<ApiResponse<void>> {
    return this.client.del<void>(`/auth/passkey/${passkeyId}`);
  }
}
