/**
 * Form validation schemas for @fusorb/facet-auth forms.
 *
 * Zod schemas power client-side validation in the auth forms. Each form
 * accepts an optional `validate` flag; when enabled, values are checked
 * before submit and field errors render inline.
 *
 * Exported so consumers can reuse the schemas (e.g. with their own
 * react-hook-form instances) or extend them per domain:
 *
 *   import { loginSchema } from "@fusorb/facet-auth";
 *   const domainLogin = loginSchema.extend({ tenantId: z.string() });
 */

import { z } from "zod";

/** Email: basic shape + a minimum length so one-char junk is rejected. */
export const emailSchema = z
  .email("Enter a valid email address")
  .trim()
  .min(1, "Email is required");

/** Password: at least 8 characters, with a hint for the requirement. */
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

/** Login: email + password. */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** Magic link / forgot password: email only. */
export const emailOnlySchema = z.object({
  email: emailSchema,
});

/** Reset password: new password + confirmation must match. */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: passwordSchema,
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

/** MFA: exactly 6 digits. */
export const mfaCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

/** Recovery code: the XXXX-XXXX format used by arc-id. */
export const recoveryCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{4,6}-[A-Z0-9]{4,6}$/, "Enter a valid recovery code");

/** Extract the first error message for a field from a ZodError. */
export function firstErrorMessage(
  error: z.ZodError | undefined | null,
  path: string,
): string | undefined {
  const issue = error?.issues.find((i) => i.path.join(".") === path);
  return issue?.message;
}
