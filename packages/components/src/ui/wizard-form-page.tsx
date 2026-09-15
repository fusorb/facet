/**
 * @fusorb/facet-components: WizardFormPage
 *
 * A drop-in multi-step form page: combines `Stepper` (navigation),
 * `react-hook-form` (state), and an injectable `resolver` (e.g.
 * zodResolver) into one batteries-included surface. Hosts declare
 * per-step field sets and the wizard gates Next on validation.
 *
 * Why: every onboarding / KYC / signup flow is a multi-step form with
 * per-step validation. Consumers shouldn't wire 200 lines of stepper +
 * form + validation + scroll preservation per project.
 *
 * Usage (with zod):
 *   import { zodResolver } from "@hookform/resolvers/zod";
 *   import { z } from "zod";
 *
 *   const schema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(2) });
 *   const steps = [
 *     { id: "account", title: "Account", fields: ["email", "password"] },
 *     { id: "profile", title: "Profile", fields: ["name"] },
 *   ];
 *   <WizardFormPage
 *     steps={steps}
 *     resolver={zodResolver(schema)}
 *     defaultValues={{ email: "", password: "", name: "" }}
 *     renderField={(name, form) => <input {...form.register(name)} />}
 *     onSubmit={async (data) => api.create(data)}
 *   />
 */

import * as React from "react";
import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "../utils.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card.js";
import { Button } from "./button.js";
import {
  StepperProvider,
  StepperNav,
  StepperPanel,
  useStepper,
  type StepperApi,
  type StepperStepDef,
} from "./stepper.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface WizardFormStep {
  /** Stable id (used as the step key). */
  id: string;
  /** Display title (renders in the stepper nav). */
  title: string;
  /** Optional one-line description. */
  description?: string;
  /** Optional icon for the nav row. */
  icon?: StepperStepDef["icon"];
  /**
   * Field names that belong to this step. Used to (a) drive the
   * `renderField` callback for the active step and (b) scope the
   * per-step validation to just this step's fields (via react-hook-form
   * `form.trigger(fields)`).
   */
  fields: string[];
}

export interface WizardFormPageProps<T extends FieldValues = FieldValues> {
  /** Ordered step definitions. */
  steps: WizardFormStep[];
  /**
   * A react-hook-form resolver (e.g. zodResolver). Validation of each
   * step's fields is delegated to this resolver via `form.trigger(fields)`.
   */
  resolver?: Resolver<T>;
  /** Default values for every field (recommended for controlled inputs). */
  defaultValues: T;
  /** Render one field by name. Receives the form instance + field name. */
  renderField: (
    name: string,
    form: UseFormReturn<FieldValues>,
  ) => React.ReactNode;
  /**
   * Called with the validated form data on the final step's submit.
   * Receives the typed `data` after `resolver` validation passes.
   */
  onSubmit: (data: T) => Promise<void> | void;
  /** Optional form title. Default: "Wizard". */
  title?: string;
  /** Optional one-line description under the title. */
  description?: string;
  /** Layout: "horizontal" (default) or "vertical" stepper nav. */
  direction?: "horizontal" | "vertical";
  /** Custom labels for the navigation buttons and error fallback. */
  labels?: Partial<{
    back: string;
    next: string;
    finish: string;
    skip: string;
    errorFallback: string;
  }>;
  /**
   * Show a "Skip this step" button (optional, opt-in). When clicked, the
   * wizard advances without running validation. Useful for optional
   * steps in onboarding flows.
   */
  allowSkip?: boolean;
  /** Extra className for the Card wrapper. */
  className?: string;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * A drop-in multi-step form page. Hosts declare per-step field sets,
 * `renderField` for each field, and an injectable `resolver` (e.g.
 * zodResolver). Per-step Next is gated on `form.trigger(fields)` for
 * that step's fields; the final step runs a full trigger before calling
 * `onSubmit`.
 */
export function WizardFormPage<T extends FieldValues = FieldValues>({
  steps,
  resolver,
  defaultValues,
  renderField,
  onSubmit,
  title = "Wizard",
  description,
  direction = "horizontal",
  labels,
  allowSkip = false,
  className,
}: WizardFormPageProps<T>) {
  // Outer form is uncontrolled state - the wizard re-derives the current
  // step's field values from `form.getValues()` on each Next click.
  const form = useForm<FieldValues>({
    resolver: resolver as Resolver<FieldValues>,
    defaultValues: defaultValues as FieldValues,
    mode: "onBlur",
  });

  // Build the stepper config from the wizard steps. The `validate`
  // callback runs the step's field slice through the resolver (via
  // form.trigger); blocks Next if validation fails.
  const stepperSteps: StepperStepDef[] = React.useMemo(
    () =>
      steps.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        icon: s.icon,
        validate: async () => {
          if (!resolver) return true;
          return form.trigger(s.fields as never);
        },
      })),
    [steps, form, resolver],
  );

  const stepper: StepperApi = useStepper({ steps: stepperSteps });

  const handleFinish = async () => {
    // Validate the full schema before submitting.
    const ok = await form.trigger();
    if (!ok) return;
    const data = form.getValues();
    await onSubmit(data as T);
  };

  const back = labels?.back ?? "Back";
  const next = labels?.next ?? "Next";
  const finish = labels?.finish ?? "Finish";
  const skip = labels?.skip ?? "Skip";
  const errorFallback = labels?.errorFallback ?? "Invalid";

  return (
    <Card className={cn("w-full max-w-3xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <StepperProvider value={stepper}>
          <StepperNav direction={direction} variant="numbered" />
          <div className="mt-8 min-h-0">
            {steps.map((s) => (
              <StepperPanel key={s.id}>
                {(active) => {
                  if (active.id !== s.id) return null;
                  return (
                    <div className="grid gap-4">
                      {s.fields.map((f) => (
                        <div key={f} className="space-y-1.5">
                          {renderField(f, form as UseFormReturn<FieldValues>)}
                          {form.formState.errors[f] && (
                            <p className="text-xs text-destructive">
                              {String(
                                (
                                  form.formState.errors as Record<
                                    string,
                                    { message?: string }
                                  >
                                )[f]?.message ?? errorFallback,
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }}
              </StepperPanel>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => stepper.back()}
              disabled={!stepper.canBack}
            >
              {back}
            </Button>
            <div className="flex items-center gap-2">
              {allowSkip && !stepper.isLast && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    stepper.go(
                      steps[stepper.currentIndex + 1]?.id ?? stepper.currentId,
                    )
                  }
                >
                  {skip}
                </Button>
              )}
              {stepper.isLast ? (
                <Button type="button" onClick={handleFinish}>
                  {finish}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={async () => {
                    await stepper.next();
                  }}
                >
                  {next}
                </Button>
              )}
            </div>
          </div>
        </StepperProvider>
      </CardContent>
    </Card>
  );
}

WizardFormPage.displayName = "WizardFormPage";
