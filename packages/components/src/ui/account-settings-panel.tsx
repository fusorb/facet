/**
 * @fusorb/facet-components: AccountSettingsPanel
 *
 * A Clerk-style account settings card: a large panel with a left nav of
 * sections (Profile, Security, Sessions...) and a content area. The
 * section nav is data-driven, so consumers bring their own section list
 * and render content per active section. Fully customizable via props.
 *
 * The nav collapses to a horizontal scrollable tab row on mobile and
 * becomes a sticky sidebar on md+.
 */

import * as React from "react";
import { cn } from "../utils.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card.js";
import { Icon, type IconName } from "../icon/index.js";

export interface SettingsSection {
  /** Unique id (used as the active key). */
  id: string;
  /** Label in the nav. */
  label: string;
  /** Optional short description. */
  description?: string;
  /** Optional semantic icon shown in the nav. */
  icon?: IconName;
}

export interface AccountSettingsPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
> {
  /** The nav sections. */
  sections: SettingsSection[];
  /** Map of section id -> content node. */
  content: Record<string, React.ReactNode>;
  /** Active section (controlled) or omit for internal state. */
  activeId?: string;
  /** Called when the active section changes. */
  onActiveChange?: (id: string) => void;
  /** Copy overrides. */
  copy?: Partial<{ title: string; description: string }>;
}

/**
 * A large, responsive account settings card. On mobile the nav renders as
 * a horizontal scrollable tab row; on md+ it becomes a left sidebar. The
 * active section's content renders on the right.
 */
export function AccountSettingsPanel({
  sections,
  content,
  activeId,
  onActiveChange,
  copy = {},
  className,
  ...props
}: AccountSettingsPanelProps) {
  const [internalActive, setInternalActive] = React.useState(sections[0]?.id);
  const active = activeId ?? internalActive ?? sections[0]?.id;
  const setActive = (id: string) => {
    setInternalActive(id);
    onActiveChange?.(id);
  };

  return (
    <Card className={cn("w-full max-w-3xl", className)} {...props}>
      <CardHeader>
        <CardTitle>{copy.title ?? "Account settings"}</CardTitle>
        <CardDescription>
          {copy.description ??
            "Manage your profile, security, and preferences."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Section nav */}
          <nav
            className="md:w-52 shrink-0 md:-ml-2"
            aria-label="Account sections"
          >
            <div className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sections.map((s) => {
                const isActive = s.id === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                      "focus-visible:outline-none",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {s.icon && (
                      <Icon name={s.icon} className="size-4 shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          {/* Active section content */}
          <div className="min-w-0 flex-1">
            {active ? content[active] : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

AccountSettingsPanel.displayName = "AccountSettingsPanel";
