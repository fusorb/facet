/**
 * @arcevo/facet-auth: domain-customizable auth components wired to arc-id SDK.
 *
 * Usage:
 *   import { ArcProvider, SignIn, Guard } from "@arcevo/facet-auth";
 *
 *   <ArcProvider client={arcIdClient}>
 *     <Guard fallback={<SignIn />}>
 *       <App />
 *     </Guard>
 *   </ArcProvider>
 */

/* ── Provider ──────────────────────────────────────────────── */
export { type ArcProviderProps, ArcProvider, useAuth, useOptionalAuth } from "./provider.js";

/* ── Storage ───────────────────────────────────────────────── */
export { type TokenStorage, defaultStorage } from "./storage.js";

/* ── Components ────────────────────────────────────────────── */
export { type SignInProps, type SignInCopy, SignIn } from "./sign-in.js";

export { type SignUpProps, SignUp } from "./sign-up.js";

export { type UserButtonProps, type UserButtonCopy, UserButton } from "./user-button.js";

export { type GuardProps, Guard } from "./guard.js";

export { type MfaDialogProps, MfaDialog } from "./mfa-dialog.js";

/* ── Domain Presets ────────────────────────────────────────── */
export { fintechPreset, medPreset, eduPreset, enterprisePreset, defaultPreset } from "./presets.js";

/* ── Preset Registry ──────────────────────────────────────── */
export { registerPreset, getPreset, hasPreset, listPresets, resolvePreset } from "./registry.js";
export type { PresetName } from "./registry.js";

/* ── Forms ─────────────────────────────────────────────────── */
export {
  type LoginFormProps,
  LoginForm,
  type MagicLinkFormProps,
  MagicLinkForm,
  type ForgotPasswordFormProps,
  ForgotPasswordForm,
  type ResetPasswordFormProps,
  ResetPasswordForm,
  type MfaVerifyFormProps,
  MfaVerifyForm,
  type MfaSetupFormProps,
  MfaSetupForm,
  type MfaRecoveryCodesFormProps,
  MfaRecoveryCodesForm,
  type MfaRecoveryFormProps,
  MfaRecoveryForm,
} from "./forms/index.js";

/* ── Types ─────────────────────────────────────────────────── */
export type {
  AuthUser,
  AuthState,
  AuthContextValue,
  AuthConfig,
  Appearance,
  ComponentSlots,
  LoginParams,
  RegisterParams,
  SignInStep,
  MfaMethod,
  MfaFlowState,
  SignUpCopy,
  LoginCopy,
  ResetPasswordCopy,
  MfaCopy,
} from "./types.js";

/* ── Default copy ──────────────────────────────────────────── */
export {
  defaultSignUpCopy,
  defaultLoginCopy,
  defaultResetPasswordCopy,
  defaultMfaCopy,
} from "./types.js";

/* ── Validators ────────────────────────────────────────────── */
export {
  emailSchema,
  passwordSchema,
  loginSchema,
  emailOnlySchema,
  resetPasswordSchema,
  mfaCodeSchema,
  recoveryCodeSchema,
  firstErrorMessage,
} from "./validators.js";
