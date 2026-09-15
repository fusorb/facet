/**
 * Token persistence layer. Swappable: uses localStorage by default.
 *
 * Safe on the server: localStorage is only touched lazily inside the
 * accessor functions, so importing this module during SSR never throws.
 *
 * SECURITY: `defaultStorage` stores BOTH access and refresh tokens in
 * `localStorage`, which is readable by any JavaScript running in the page.
 * An XSS vulnerability in the host application can lead to full session
 * hijacking, including long-lived refresh tokens.
 *
 * For production, either:
 * 1. Pass an explicit `storage` prop to `<ArcProvider>` backed by httpOnly
 *    cookies (refresh token in cookie, access token in memory), or
 * 2. Use a custom `TokenStorage` that encrypts or avoids persisting the
 *    refresh token.
 */

export interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
}

const ACCESS_KEY = "arcid_access_token";
const REFRESH_KEY = "arcid_refresh_token";

function hasWindow(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

let warnedAboutDefaultStorage = false;

function warnDefaultStorage(): void {
  if (warnedAboutDefaultStorage || typeof console === "undefined") return;
  warnedAboutDefaultStorage = true;
  // eslint-disable-next-line no-console
  console.warn(
    "[@fusorb/facet-auth] `defaultStorage` writes tokens to localStorage, which is " +
      "vulnerable to XSS. For production, pass an explicit `storage` prop to " +
      "<ArcProvider> backed by httpOnly cookies. This warning is shown once.",
  );
}

export const defaultStorage: TokenStorage = {
  getAccessToken: () =>
    hasWindow() ? window.localStorage.getItem(ACCESS_KEY) : null,
  getRefreshToken: () =>
    hasWindow() ? window.localStorage.getItem(REFRESH_KEY) : null,
  setTokens: (accessToken, refreshToken) => {
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV !== "production"
    ) {
      warnDefaultStorage();
    }
    if (!hasWindow()) return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clearTokens: () => {
    if (!hasWindow()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
