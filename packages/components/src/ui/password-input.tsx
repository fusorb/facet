/**
 * PasswordInput: a password field with a built-in show/hide toggle.
 *
 * Usage:
 *   <PasswordInput value={password} onValueChange={setPassword} label="Password" />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Show a label above the input. */
  label?: string;
  /** Show the reveal toggle. Default: true. */
  showToggle?: boolean;
  /** Visible/hidden state. */
  defaultVisible?: boolean;
  /** Controlled visible state. */
  visible?: boolean;
  /** Called when the toggle is clicked. */
  onVisibleChange?: (visible: boolean) => void;
  /** Icon shown when the password is visible (click to hide). Default: "eye-off". */
  hiddenIconName?: IconName;
  /** Icon shown when the password is hidden (click to show). Default: "eye". */
  visibleIconName?: IconName;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      label,
      showToggle = true,
      defaultVisible = false,
      visible: visibleProp,
      onVisibleChange,
      hiddenIconName = "eye-off",
      visibleIconName = "eye",
      className,
      ...props
    },
    ref,
  ) => {
    const [internalVisible, setInternalVisible] =
      React.useState(defaultVisible);
    const visible = visibleProp ?? internalVisible;

    const toggle = () => {
      const next = !visible;
      if (visibleProp === undefined) setInternalVisible(next);
      onVisibleChange?.(next);
    };

    // Associate the label with the input; fall back to an accessible name
    // so the field is always reachable by role (a11y).
    const inputId = React.useId();
    const ariaName = label ? undefined : "Password";

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-label={ariaName}
            type={visible ? "text" : "password"}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={toggle}
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {visible ? (
                <Icon
                  name={hiddenIconName}
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              ) : (
                <Icon
                  name={visibleIconName}
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </button>
          )}
        </div>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
