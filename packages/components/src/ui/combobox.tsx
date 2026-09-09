import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";
import { Button } from "./button.js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Options to choose from. */
  options: ComboboxOption[];
  /** Currently selected value (controlled). */
  value?: string;
  /** Callback fired when an option is selected. */
  onValueChange?: (value: string) => void;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** Empty-state message when no options match the filter. */
  emptyMessage?: string;
  /** Render a custom trigger label; defaults to the selected option's label. */
  triggerLabel?: React.ReactNode;
  /** Optionally render a custom icon slot per option (e.g. lucide icon). */
  renderOption?: (option: ComboboxOption) => React.ReactNode;
  /** Accessible label for the combobox trigger. */
  label?: string;
  /** Render a fully custom trigger element instead of the default Button. */
  renderTrigger?: (state: { open: boolean; selectedLabel?: string; placeholder: string }) => React.ReactNode;
  /** Additional className for the popover content container. */
  popoverContentClassName?: string;
  /** Placeholder for the internal search input. Default: "Search…". */
  searchPlaceholder?: string;
  /** Override the chevron-down icon in the trigger. Default: "chevron-down". */
  triggerIconName?: IconName;
  /** Override the check icon for selected items. Default: "check". */
  checkIconName?: IconName;
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      className,
      options,
      value,
      onValueChange,
      placeholder = "Select an option...",
      emptyMessage = "No results found.",
      triggerLabel,
      renderOption,
      renderTrigger,
      popoverContentClassName,
      searchPlaceholder = "Search…",
      triggerIconName = "chevron-down",
      checkIconName = "check",
      label,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const selected = options.find((o) => o.value === value);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {renderTrigger
              ? renderTrigger({
                  open,
                  selectedLabel: selected?.label ?? placeholder,
                  placeholder,
                })
              : (
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-label={label}
                  className="w-full justify-between font-normal"
                >
                  {triggerLabel ?? selected?.label ?? placeholder}
                  <Icon name={triggerIconName} className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              )}
          </PopoverTrigger>
          <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", popoverContentClassName)} align="start">
            <Command>
              <CommandInput
                placeholder={searchPlaceholder}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onValueChange?.(option.value);
                        setOpen(false);
                      }}
                    >
                      {renderOption?.(option)}
                      <span>{option.label}</span>
                      <Icon
                        name={checkIconName}
                        className={cn(
                          "ml-auto size-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
Combobox.displayName = "Combobox";

export { Combobox };
