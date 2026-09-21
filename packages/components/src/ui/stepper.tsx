/**
 * @fusorb/facet-components: Stepper
 *
 * A headless-first wizard primitive. State lives in `useStepper` (no DOM,
 * no Radix), the `<Stepper>` + `<StepperPanel>` + `<StepperNav>` components
 * are pure renderers that read from a `StepperContext` the hook populates.
 *
 * Why headless-first: the roadmap calls for a React Native re-render later
 * (Phase 3). Keeping the state machine in a hook means the same logic
 * drives <Stepper> on web and a native <Stepper> on RN, without redesign.
 *
 * Usage:
 *   const stepper = useStepper({ steps: [...] });
 *   <StepperProvider value={stepper}>
 *     <StepperNav />
 *     <StepperPanel step={stepper.current} />
 *     <button onClick={stepper.back} disabled={!stepper.canBack}>Back</button>
 *     <button onClick={stepper.next} disabled={!stepper.canNext}>Next</button>
 *   </StepperProvider>
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button } from "./button.js";
import { Icon, type IconName } from "../icon/index.js";
import { Motion } from "@fusorb/facet-motion";

/* ── Types ─────────────────────────────────────────────────── */

export interface StepperStepDef {
  /** Stable id (used as a React key). */
  id: string;
  /** Display title. */
  title: string;
  /** Optional one-line description under the title. */
  description?: string;
  /** Optional semantic icon shown in the nav row. */
  icon?: IconName;
  /**
   * Per-step validation gate. Return `true` (or a Promise that resolves
   * to `true`) when the step is allowed to advance. Throw or return
   * `false` (or a Promise that resolves to `false` or rejects) to block
   * navigation. Defaults to always-allowed.
   */
  validate?: () => boolean | Promise<boolean>;
  /** Force-disable this step (renders but is skipped and not navigable). */
  disabled?: boolean;
}

export type StepperDirection = "horizontal" | "vertical";
export type StepperVariant = "dots" | "numbered" | "labeled";

export interface UseStepperOptions {
  /** Ordered list of steps. */
  steps: StepperStepDef[];
  /** Initial active step id. Default: first non-disabled step. */
  initialStepId?: string;
  /**
   * Navigation mode. "controlled" means the host owns the active id via
   * `activeStepId` + `onActiveChange`. "uncontrolled" (default) means
   * the hook owns it internally.
   */
  mode?: "controlled" | "uncontrolled";
  /** Active step id (controlled mode). */
  activeStepId?: string;
  /** Active change (controlled mode). */
  onActiveChange?: (id: string) => void;
  /**
   * Called whenever the active step changes (both modes). Useful for
   * analytics, scroll-into-view, and step-specific side effects.
   */
  onStepChange?: (id: string, previousId: string) => void;
  /**
   * Loop the last step back to the first when "Next" is pressed. Default: false.
   */
  loop?: boolean;
}

export interface StepperApi {
  /** Ordered list of navigable (non-disabled) steps. */
  steps: StepperStepDef[];
  /** Currently active step. */
  current: StepperStepDef;
  /** Currently active step id. */
  currentId: string;
  /** Index of the active step in the navigable list. */
  currentIndex: number;
  /** True when the active step is the first navigable step. */
  isFirst: boolean;
  /** True when the active step is the last navigable step. */
  isLast: boolean;
  /** True when `back()` is a no-op (no navigable step behind). */
  canBack: boolean;
  /** True when `next()` would advance (and not blocked by `validate`). */
  canNext: boolean;
  /** Step ids of every step before the current one. */
  pastIds: string[];
  /** Step ids of every step after the current one. */
  futureIds: string[];
  /** Navigate to a specific step (no validation gate). */
  go: (id: string) => void;
  /** Advance one step. Runs the current step's `validate`; rejects on false. */
  next: () => Promise<boolean>;
  /** Go back one step. */
  back: () => void;
  /** Reset to the initial step (uncontrolled mode). */
  reset: () => void;
  /** Imperatively mark the current step as valid (skip validate). */
  markValid: () => void;
}

/* ── useStepper hook (state only, no DOM) ───────────────────── */

export function useStepper(options: UseStepperOptions): StepperApi {
  const {
    steps,
    initialStepId,
    mode = "uncontrolled",
    activeStepId,
    onActiveChange,
    onStepChange,
    loop = false,
  } = options;

  // Filter to navigable steps (skip `disabled: true`).
  const navigable = React.useMemo(
    () => steps.filter((s) => !s.disabled),
    [steps],
  );

  const fallbackInitial = navigable[0]?.id ?? steps[0]?.id ?? "";
  const initialId = initialStepId ?? fallbackInitial;

  const [internalId, setInternalId] = React.useState(initialId);
  const controlled = mode === "controlled";
  const currentId = controlled ? (activeStepId ?? initialId) : internalId;

  // Keep controlled id valid if the steps list shrinks.
  React.useEffect(() => {
    if (!controlled && !navigable.some((s) => s.id === internalId)) {
      setInternalId(initialId);
    }
  }, [controlled, navigable, internalId, initialId]);

  const currentIndex = React.useMemo(() => {
    const i = navigable.findIndex((s) => s.id === currentId);
    return i === -1 ? 0 : i;
  }, [navigable, currentId]);

  const current = navigable[currentIndex] ?? navigable[0];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === navigable.length - 1;
  const canBack = !isFirst || loop;
  const canNext = !isLast || loop;

  const setId = React.useCallback(
    (id: string) => {
      if (!navigable.some((s) => s.id === id)) return;
      const previousId = currentId;
      if (controlled) {
        onActiveChange?.(id);
      } else {
        setInternalId(id);
      }
      if (id !== previousId) onStepChange?.(id, previousId);
    },
    [controlled, currentId, navigable, onActiveChange, onStepChange],
  );

  const go = React.useCallback((id: string) => setId(id), [setId]);

  const back = React.useCallback(() => {
    if (isFirst) {
      if (loop && navigable.length > 1)
        setId(navigable[navigable.length - 1]!.id);
      return;
    }
    const prev = navigable[currentIndex - 1]!;
    setId(prev.id);
  }, [isFirst, loop, navigable, currentIndex, setId]);

  const next = React.useCallback(async (): Promise<boolean> => {
    const validate = current?.validate;
    if (validate) {
      try {
        const ok = await validate();
        if (!ok) return false;
      } catch {
        return false;
      }
    }
    if (isLast) {
      if (loop && navigable.length > 1) {
        setId(navigable[0]!.id);
        return true;
      }
      return false;
    }
    const nextStep = navigable[currentIndex + 1]!;
    setId(nextStep.id);
    return true;
  }, [current, isLast, loop, navigable, currentIndex, setId]);

  const reset = React.useCallback(() => {
    if (!controlled) setInternalId(initialId);
  }, [controlled, initialId]);

  const markValid = React.useCallback(() => {
    // No-op for the hook; the validate gate decides. Exposed for symmetry
    // with future state-aware extensions.
  }, []);

  return {
    steps: navigable,
    current: current ?? { id: initialId, title: "" },
    currentId,
    currentIndex,
    isFirst,
    isLast,
    canBack,
    canNext,
    pastIds: navigable.slice(0, currentIndex).map((s) => s.id),
    futureIds: navigable.slice(currentIndex + 1).map((s) => s.id),
    go,
    next,
    back,
    reset,
    markValid,
  };
}

/* ── Context (lets the renderers read the api) ─────────────── */

const StepperContext = React.createContext<StepperApi | null>(null);

function useStepperContext(component: string): StepperApi {
  const ctx = React.useContext(StepperContext);
  if (!ctx) {
    throw new Error(`${component} must be rendered inside <StepperProvider>.`);
  }
  return ctx;
}

/** Provide a `useStepper` api to descendant renderers. */
export function StepperProvider({
  value,
  children,
}: {
  value: StepperApi;
  children: React.ReactNode;
}) {
  return (
    <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
  );
}

/* ── StepperNav: numbered / dots / labeled indicator ───────── */

export interface StepperNavProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Visual layout. Default: "horizontal". */
  direction?: StepperDirection;
  /** Indicator style. Default: "numbered". */
  variant?: StepperVariant;
  /** Render `current` step even when it's the future. Default: true. */
  showAll?: boolean;
  /** Click a step to navigate to it (no validate). Default: true. */
  clickable?: boolean;
}

const navBase = "flex w-full items-center gap-2 text-sm";
const itemBase =
  "group flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md";

function StepDot({ status }: { status: "past" | "current" | "future" }) {
  const color =
    status === "past"
      ? "bg-primary text-primary-foreground"
      : status === "current"
        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
        : "bg-muted text-muted-foreground";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        color,
      )}
    >
      <Icon name={status === "past" ? "check" : "dot"} className="size-3.5" />
    </span>
  );
}

function StepNumber({
  index,
  status,
}: {
  index: number;
  status: "past" | "current" | "future";
}) {
  const color =
    status === "past"
      ? "bg-primary text-primary-foreground"
      : status === "current"
        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
        : "bg-muted text-muted-foreground";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        color,
      )}
    >
      {status === "past" ? (
        <Icon name="check" className="size-3.5" />
      ) : (
        index + 1
      )}
    </span>
  );
}

/**
 * The progress indicator row. Renders each step with the chosen
 * `variant`. The current step is highlighted; past steps show a check.
 */
export function StepperNav({
  direction = "horizontal",
  variant = "numbered",
  showAll = true,
  clickable = true,
  className,
  ...props
}: StepperNavProps) {
  const api = useStepperContext("StepperNav");
  const { steps, currentId, go } = api;

  return (
    <ol
      role="list"
      aria-label="Progress steps"
      className={cn(
        navBase,
        direction === "horizontal"
          ? "flex-row overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex-col items-stretch",
        className,
      )}
      {...props}
    >
      {steps.map((step, i) => {
        const isPast = api.pastIds.includes(step.id);
        const isCurrent = step.id === currentId;
        const status: "past" | "current" | "future" = isPast
          ? "past"
          : isCurrent
            ? "current"
            : "future";
        if (!showAll && status === "future") return null;

        const Indicator =
          variant === "dots" ? (
            <StepDot status={status} />
          ) : (
            <StepNumber index={i} status={status} />
          );

        const Inner = (
          <span className="flex min-w-0 items-center gap-2">
            {Indicator}
            {(variant === "labeled" || direction === "vertical") && (
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate font-medium",
                    isCurrent
                      ? "text-foreground"
                      : isPast
                        ? "text-foreground/80"
                        : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
                {step.description && direction === "vertical" && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </span>
            )}
          </span>
        );

        if (!clickable) {
          return (
            <li
              key={step.id}
              className={cn(itemBase, "cursor-default")}
              aria-current={isCurrent ? "step" : undefined}
            >
              {Inner}
            </li>
          );
        }

        return (
          <li key={step.id} className={cn(itemBase, "min-w-0")}>
            <button
              type="button"
              onClick={() => go(step.id)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 transition-colors",
                "hover:bg-accent/40",
                "focus-visible:bg-accent/40",
                !isCurrent && "text-muted-foreground",
              )}
            >
              {Inner}
            </button>
            {direction === "horizontal" && i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-1 h-px w-6 shrink-0",
                  isPast || isCurrent ? "bg-primary/60" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── StepperPanel: content slot for the active step ────────── */

export interface StepperPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /**
   * Render-prop receives the active step. Lets the host pick its own
   * content shape per step (no children-by-id magic).
   */
  children: (step: StepperStepDef) => React.ReactNode;
}

/**
 * The content slot. Renders `children(activeStep)`, so the host picks
 * how to map step id -> React tree (a switch, a record, a hook - whatever).
 */
export function StepperPanel({
  children,
  className,
  ...props
}: StepperPanelProps) {
  const api = useStepperContext("StepperPanel");
  const active = api.current;
  return (
    <div className={cn("min-h-0", className)} {...props}>
      <Motion key={active.id} effect="fade" direction="up" className="w-full">
        {children(active)}
      </Motion>
    </div>
  );
}

/* ── StepperFooter: back / next / submit convenience ────────── */

export interface StepperFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label for the back button. Default: "Back". */
  backLabel?: string;
  /** Label for the next button on non-last steps. Default: "Next". */
  nextLabel?: string;
  /** Label for the next button on the last step. Default: "Finish". */
  finishLabel?: string;
  /** Called when the user clicks the back button. */
  onBack?: () => void;
  /** Called when the user advances past the last step (next returned true). */
  onFinish?: () => void | Promise<void>;
  /** Called when `next()` is rejected by validation. */
  onValidationFail?: () => void;
  /** Reverse the back/next button order (submit first). Default: false. */
  reverse?: boolean;
}

/**
 * A small footer with Back / Next (or Finish) wired to the active stepper.
 * Drop-in: <StepperFooter /> renders sensible defaults. Hosts can replace
 * the whole footer with custom <Button>s and call `api.back/next` directly.
 */
export function StepperFooter({
  backLabel = "Back",
  nextLabel = "Next",
  finishLabel = "Finish",
  onBack,
  onFinish,
  onValidationFail,
  reverse = false,
  className,
  ...props
}: StepperFooterProps) {
  const api = useStepperContext("StepperFooter");
  const [busy, setBusy] = React.useState(false);

  const handleBack = () => {
    onBack?.();
    api.back();
  };

  const handleNext = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (api.isLast) {
        const ok = await api.next();
        if (ok) await onFinish?.();
        else onValidationFail?.();
        return;
      }
      const ok = await api.next();
      if (!ok) onValidationFail?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn("flex items-center justify-between gap-2 pt-2", className)}
      {...props}
    >
      {reverse ? (
        <>
          <Button
            type="button"
            onClick={handleNext}
            disabled={busy || !api.canNext}
          >
            {api.isLast ? finishLabel : nextLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={!api.canBack}
          >
            {backLabel}
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={!api.canBack}
          >
            {backLabel}
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={busy || !api.canNext}
          >
            {api.isLast ? finishLabel : nextLabel}
          </Button>
        </>
      )}
    </div>
  );
}

/* ── Stepper: all-in-one convenience wrapper ───────────────── */

export interface StepperProps extends Omit<StepperNavProps, "children"> {
  /** The `useStepper` api - host owns the state. */
  stepper: StepperApi;
  /** Content per step. Receives the active step; render anything. */
  children: (step: StepperStepDef) => React.ReactNode;
  /** Optional footer override. */
  footer?: React.ReactNode;
}

/**
 * Drop-in convenience: wraps `StepperProvider` + `StepperNav` + `StepperPanel`.
 * The footer is omitted by default - hosts usually want their own buttons
 * or pass `<StepperFooter />` via `footer`.
 */
export function Stepper({
  stepper,
  children,
  footer,
  direction = "horizontal",
  variant = "numbered",
  ...navProps
}: StepperProps) {
  return (
    <StepperProvider value={stepper}>
      <div className="flex flex-col gap-6">
        <StepperNav direction={direction} variant={variant} {...navProps} />
        <StepperPanel>{children}</StepperPanel>
        {footer}
      </div>
    </StepperProvider>
  );
}

Stepper.displayName = "Stepper";
