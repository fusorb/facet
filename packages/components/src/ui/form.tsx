/**
 * Form: lightweight react-hook-form + zod field wrapper.
 *
 * Builds on react-hook-form's Controller to render labeled, validated
 * fields (Input, Textarea, Select, Switch, Checkbox, Combobox) with inline
 * error messages. Pair with useForm() and a zod resolver.
 */
import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useForm,
  type FieldValues,
  type UseFormProps,
  type Path,
  type Control,
  type FieldPath,
  type FieldPathValue,
} from "react-hook-form";
import { cn } from "../utils.js";
import { Label } from "./label.js";

/* ── Context ───────────────────────────────────────────────── */

export interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control?: Control<TFieldValues>;
  required?: boolean;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

function useFormField() {
  const field = React.useContext(FormFieldContext);
  const form = useFormContext();
  if (!field)
    throw new Error(
      "FormField must be used inside <Form> or <FormField> with a form context.",
    );
  const error = form.getFieldState(field.name).error;
  return {
    ...field,
    error,
    invalid: !!error,
  };
}

/* ── Form ──────────────────────────────────────────────────── */

export interface FormProps<TFieldValues extends FieldValues> extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> {
  /** useForm() return value; wires context so FormField resolves controls. */
  form: ReturnType<typeof useForm<TFieldValues>>;
  /** Called with the validated values on submit. */
  onSubmit: (values: TFieldValues) => void | Promise<void>;
}

/**
 * A form provider that scopes a react-hook-form instance to a <form>
 * element and its children.
 */
export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
  ...props
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        className={cn("space-y-4", className)}
        onSubmit={(event) => {
          void form.handleSubmit((values) => onSubmit(values))(event);
        }}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

/* ── FormField ─────────────────────────────────────────────── */

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /** Field name, matches the form values key. */
  name: TName;
  /** Optional control from useForm(); falls back to the nearest form context. */
  control?: Control<TFieldValues>;
  /** Field label rendered above the control. */
  label?: React.ReactNode;
  /** Mark the label with a required indicator. */
  required?: boolean;
  /** Description shown under the label. */
  description?: string;
  /** The control (Input, Textarea, Select, ...) or a render prop. */
  children:
    | React.ReactNode
    | ((field: {
        value: unknown;
        onChange: (value: unknown) => void;
      }) => React.ReactNode);
  className?: string;
}

/**
 * Binds a named field to the form via Controller and renders label,
 * description, and error state around the given control.
 */
export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  required,
  description,
  children,
  className,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider
      value={{
        name,
        control: control as Control<FieldValues> | undefined,
        required,
      }}
    >
      <div className={cn("space-y-1.5", className)}>
        {label && (
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </Label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <>
              {typeof children === "function"
                ? children({ value: field.value, onChange: field.onChange })
                : React.cloneElement(
                    children as React.ReactElement<{
                      id?: string;
                      name?: string;
                      value?: unknown;
                      onChange?: (value: unknown) => void;
                    }>,
                    {
                      id: name,
                      name,
                      value: field.value,
                      onChange: field.onChange,
                    },
                  )}
              <FormFieldError />
            </>
          )}
        />
      </div>
    </FormFieldContext.Provider>
  );
}

/* ── Error message ─────────────────────────────────────────── */

/** Inline error message for the nearest FormField. */
function FormFieldError() {
  const { error, invalid } = useFormField();
  if (!invalid) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {error?.message}
    </p>
  );
}

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Show even without an error (useful for hint text). Default: false */
  force?: boolean;
}

/** Inline error message for the nearest FormField. */
export function FormMessage({ className, force, ...props }: FormMessageProps) {
  const field = React.useContext(FormFieldContext);
  const form = useFormContext();
  const error = field ? form.getFieldState(field.name).error : undefined;
  const invalid = !!error;
  if (!invalid && !force) return null;
  return (
    <p
      role="alert"
      className={cn("text-xs font-medium text-destructive", className)}
      {...props}
    >
      {error?.message ?? props.children}
    </p>
  );
}

/** Hook exposing the nearest field's state for custom controls. */
export function useFormFieldState<
  TFieldValues extends FieldValues = FieldValues,
>() {
  const { error, invalid, name, control, required } = useFormField();
  return { name, control, required, error, invalid } as {
    name: Path<TFieldValues>;
    control: Control<TFieldValues> | undefined;
    required?: boolean;
    error?: { message?: string };
    invalid: boolean;
  };
}

/* ── Re-exports for convenience ────────────────────────────── */

export { FormProvider, useForm, useFormContext, Controller };
export type { FieldValues, UseFormProps, Path, FieldPath, FieldPathValue };
