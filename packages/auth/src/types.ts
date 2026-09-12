/**
 * Core auth types used across provider, hooks, and components.
 */

import type {
  ApiResponse,
  LoginResult,
  MfaSetupResult,
  RegisterResult,
  TokenBundle,
  UserProfile,
} from "@fusorb/facet-sdk";
import type { ArcIdClient } from "@fusorb/facet-sdk";

/* ── Identity ──────────────────────────────────────────────── */

export type { TokenPair } from "@fusorb/facet-sdk";

export type AuthUser = UserProfile;

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

export type LoginParams = {
  email: string;
  password: string;
};

export type RegisterParams = {
  name: string;
  email: string;
  password: string;
};

export type AuthContextValue = AuthState & {
  client: ArcIdClient;
  /**
   * Login is two-phase with arc-id:
   *  - No MFA required: returns a LoginResult with accessToken/refreshToken.
   *  - MFA required: returns a LoginResult with sessionId + requiresMfa,
   *    no tokens. Call `verifyMfa` (or `mfaRecovery`) to complete.
   */
  login: (params: LoginParams) => Promise<ApiResponse<LoginResult>>;
  register: (params: RegisterParams) => Promise<ApiResponse<RegisterResult>>;
  /** Complete the MFA challenge started by login. */
  verifyMfa: (code: string, sessionId: string) => Promise<ApiResponse<TokenBundle>>;
  mfaRecovery: (code: string, sessionId: string) => Promise<ApiResponse<TokenBundle>>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<ApiResponse<void>>;
  resetPassword: (token: string, newPassword: string) => Promise<ApiResponse<void>>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ApiResponse<void>>;
};

/* ── SignIn State Machine ──────────────────────────────────── */

export type SignInStep =
  | "idle"
  | "check_session"
  | "select_method"
  | "login_form"
  | "magic_link_form"
  | "forgot_password"
  | "passkey_auth"
  | "check_mfa"
  | "mfa_challenge"
  | "complete"
  | "error";

/* ── MFA ───────────────────────────────────────────────────── */

export type MfaMethod = "totp" | "recovery";

export type MfaFlowState =
  | { phase: "idle" }
  | { phase: "verify"; sessionId: string }
  | { phase: "setup"; setupData: MfaSetupResult }
  | { phase: "confirm_setup"; setupData: MfaSetupResult }
  | { phase: "recovery_codes"; codes: string[] }
  | { phase: "recovery"; sessionId: string }
  | { phase: "complete" }
  | { phase: "error"; message: string };

/* ── Domain Config / Presets ───────────────────────────────── */

export type AuthConfig = {
  /** Require MFA for all users. Default: false */
  requireMfa: boolean;
  /** Allow passkey login/registration. Default: true */
  allowPasskey: boolean;
  /** Allow magic link login. Default: true */
  allowMagicLink: boolean;
  /** Session TTL in minutes. Default: 480 (8 hr) */
  sessionTtl: number;
  /** Require email verification after registration. Default: true */
  requireEmailVerification: boolean;
  /** Require step-up for sensitive actions. Default: false */
  requireStepUp: boolean;
  /** Allowed OAuth providers. Default: [] */
  oauthProviders: string[];
};

export const defaultConfig: AuthConfig = {
  requireMfa: false,
  allowPasskey: true,
  allowMagicLink: true,
  sessionTtl: 480,
  requireEmailVerification: true,
  requireStepUp: false,
  oauthProviders: [],
};

/* ── Component Prop Shapes ─────────────────────────────────── */

export type Appearance = {
  /** Override root element className */
  className?: string;
  /** Override specific slot classNames */
  classNames?: Record<string, string>;
};

export type ComponentSlots = Record<string, React.ReactNode>;

/* ── Form copy (all strings editable, fall back to defaults) ── */

export interface SignUpCopy {
  title?: React.ReactNode;
  description?: React.ReactNode;
  nameLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  confirmLabel?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  confirmPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  alreadyHaveAccount?: string;
  signInLink?: string;
  passwordMismatch?: string;
  passwordTooShort?: string;
}

export interface LoginCopy {
  title?: React.ReactNode;
  description?: React.ReactNode;
  emailLabel?: string;
  passwordLabel?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  forgotPassword?: string;
  backLabel?: string;
  emailError?: string;
  passwordError?: string;
}

export interface ResetPasswordCopy {
  title?: React.ReactNode;
  description?: React.ReactNode;
  passwordLabel?: string;
  confirmLabel?: string;
  passwordPlaceholder?: string;
  confirmPlaceholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  backLabel?: string;
  successTitle?: React.ReactNode;
  successDescription?: React.ReactNode;
  successBody?: string;
}

export interface MfaCopy {
  title?: React.ReactNode;
  description?: React.ReactNode;
  cancelLabel?: string;
  verifyLabel?: string;
  setupTitle?: React.ReactNode;
  setupDescription?: React.ReactNode;
  recoveryTitle?: React.ReactNode;
  codeLabel?: string;
}

/** Default copy used when a consumer doesn't override it. */
export const defaultSignUpCopy: SignUpCopy = {
  title: "Create an Account",
  description: "Enter your details to get started",
  nameLabel: "Full Name",
  emailLabel: "Email",
  passwordLabel: "Password",
  confirmLabel: "Confirm Password",
  namePlaceholder: "John Doe",
  emailPlaceholder: "you@example.com",
  passwordPlaceholder: "At least 8 characters",
  confirmPlaceholder: "Re-enter your password",
  submitLabel: "Create Account",
  submittingLabel: "Creating account…",
  alreadyHaveAccount: "Already have an account?",
  signInLink: "Sign in",
  passwordMismatch: "Passwords do not match",
  passwordTooShort: "Password must be at least 8 characters",
};

export const defaultLoginCopy: LoginCopy = {
  title: "Sign In",
  description: "Enter your credentials",
  emailLabel: "Email",
  passwordLabel: "Password",
  emailPlaceholder: "you@example.com",
  passwordPlaceholder: "········",
  submitLabel: "Sign In",
  submittingLabel: "Signing in…",
  forgotPassword: "Forgot password?",
  backLabel: "Back to sign-in options",
};

export const defaultResetPasswordCopy: ResetPasswordCopy = {
  title: "Set New Password",
  description: "Enter your new password below.",
  passwordLabel: "New Password",
  confirmLabel: "Confirm Password",
  passwordPlaceholder: "At least 8 characters",
  confirmPlaceholder: "Re-enter your password",
  submitLabel: "Reset Password",
  submittingLabel: "Resetting…",
  backLabel: "Back to sign in",
  successTitle: "Password Reset",
  successDescription: "Your password has been successfully reset.",
  successBody: "You can now sign in with your new password.",
};

export const defaultMfaCopy: MfaCopy = {
  title: "Two-Factor Authentication",
  cancelLabel: "Cancel",
  verifyLabel: "Verify",
  setupTitle: "Set Up Two-Factor Authentication",
  recoveryTitle: "Recovery Code",
  codeLabel: "Enter the code from your app",
};
