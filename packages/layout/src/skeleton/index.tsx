/**
 * @fusorb/facet-layout: LayoutSkeleton
 *
 * Loading placeholder that mirrors the geometry of each LayoutShell kind
 * (console, auth, landing, docs, chat). Uses @fusorb/facet-component's
 * Skeleton (which ships with `animate-pulse`) so every bar animates in sync
 * — a uniform shimmer across the whole shell rather than per-element jitter.
 *
 * `/skeleton` subpath entry (see package.json exports). Imports only
 * @fusorb/facet-components + React, so it stays decoupled from the
 * layout-context provider chain.
 */

import * as React from "react";
import { cn, Skeleton } from "@fusorb/facet-components";

/* ── Types (matches docs/rebuild/adr/types-sketch.ts: LayoutSkeletonSpec) ── */

export type SkeletonKind =
  | "console"
  | "auth"
  | "landing"
  | "docs"
  | "chat";

export interface LayoutSkeletonSpec {
  kind: SkeletonKind;
  density?: "compact" | "comfortable" | "spacious";
  nav?: { items?: number; sections?: number };
  header?: boolean;
  aside?: boolean;
}

export interface LayoutSkeletonProps extends LayoutSkeletonSpec {
  className?: string;
}

/* ── Constants ── */

const DEFAULT_NAV_ITEMS = 6;
const DEFAULT_NAV_SECTIONS = 3;

const DENSITY_GAP = {
  compact: "gap-3",
  comfortable: "gap-4 md:gap-6",
  spacious: "gap-4 md:gap-8",
} as const;

const DENSITY_PAD = {
  compact: "p-3",
  comfortable: "p-4 md:p-6",
  spacious: "p-6 md:p-8",
} as const;

const DENSITY_BAR = {
  compact: "h-3",
  comfortable: "h-4",
  spacious: "h-5",
} as const;

/* ── Bar primitives ── */

interface BarsProps {
  count: number;
  className?: string;
  lastWidth?: string;
}

function Bars({ count, className, lastWidth = "w-4/5" }: BarsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 w-full rounded", i === count - 1 && lastWidth)}
        />
      ))}
    </div>
  );
}

interface NavRailProps {
  itemHeight: string;
  count?: number;
}

function NavRailSkeleton({ itemHeight, count = 6 }: NavRailProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("w-9 rounded", itemHeight)} />
      ))}
    </div>
  );
}

interface NavSidebarProps {
  sections: number;
  items: number;
  itemHeight: string;
}

function NavSidebarSkeleton({ sections, items, itemHeight }: NavSidebarProps) {
  const itemsPerSection = Math.max(1, Math.ceil(items / sections));
  return (
    <div className="flex flex-col gap-6 p-4">
      {Array.from({ length: sections }).map((_, s) => (
        <div key={s} className="space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <div className="space-y-1">
            {Array.from({ length: itemsPerSection }).map((_, j) => (
              <Skeleton key={j} className={cn("w-full rounded", itemHeight)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Renderer helpers ── */

function TopbarSkeleton() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <Skeleton className="h-6 w-24 rounded" />
      <div className="flex items-center gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded-full" />
        ))}
      </div>
    </header>
  );
}

function MainContentSkeleton({
  density,
  barCount = 3,
}: { density: string; barCount?: number }) {
  return (
    <main className="flex-1 p-6">
      <Bars count={barCount} className="mb-4" />
      <Skeleton className="mb-4 h-64 w-full rounded" />
      <Bars count={2} />
    </main>
  );
}

/* ── Per-kind renderers ── */

interface RendererProps {
  density: string;
  nav: NonNullable<LayoutSkeletonSpec["nav"]>;
  header: boolean;
  aside: boolean;
}

function ConsoleSkeleton({ density, nav, header, aside: _aside }: RendererProps) {
  const itemHeight = cn("w-full", DENSITY_BAR[density as keyof typeof DENSITY_BAR]);

  return (
    <>
      {header && <TopbarSkeleton />}

      <div className="flex flex-1">
        <aside className="hidden w-[240px] flex-col border-r lg:flex">
          <Skeleton className="h-14 w-full" />
          <NavSidebarSkeleton
            sections={nav.sections ?? DEFAULT_NAV_SECTIONS}
            items={nav.items ?? DEFAULT_NAV_ITEMS}
            itemHeight={itemHeight}
          />
          <div className="mt-auto border-t p-3">
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </aside>

        <MainContentSkeleton density={density} />
      </div>
    </>
  );
}

function AuthSkeleton({ density, header: _header }: RendererProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className={cn("w-full max-w-sm space-y-4", DENSITY_PAD[density as keyof typeof DENSITY_PAD])}>
        <Skeleton className="h-8 w-32 self-center rounded" />
        <Bars count={3} />
        <Skeleton className={cn("w-full rounded", DENSITY_BAR[density as keyof typeof DENSITY_BAR])} />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
}

function LandingSkeleton({ density, header }: RendererProps) {
  return (
    <>
      {header && (
        <header className="flex h-16 items-center justify-between border-b px-4">
          <Skeleton className="h-6 w-24 rounded" />
          <nav className="flex items-center gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16 rounded" />
            ))}
          </nav>
        </header>
      )}

      <section className={cn("space-y-3", DENSITY_PAD[density as keyof typeof DENSITY_PAD])}>
        <Skeleton className="h-10 w-3/4 rounded" />
        <Skeleton className="h-6 w-1/2 rounded" />
        <Skeleton className="h-48 w-full rounded" />
      </section>
    </>
  );
}

function DocsSkeleton({ density, nav, header, aside }: RendererProps) {
  const itemHeight = cn("w-full", DENSITY_BAR[density as keyof typeof DENSITY_BAR]);

  return (
    <>
      {header && <TopbarSkeleton />}

      <div className="flex flex-1">
        <aside className="hidden w-[240px] flex-col border-r lg:flex">
          <Skeleton className="h-14 w-full" />
          <NavSidebarSkeleton
            sections={nav.sections ?? DEFAULT_NAV_SECTIONS}
            items={nav.items ?? DEFAULT_NAV_ITEMS}
            itemHeight={itemHeight}
          />
        </aside>

        <MainContentSkeleton density={density} />

        {aside && (
          <aside className="hidden w-[260px] flex-col border-l p-6 lg:flex">
            <Bars count={2} className="mb-4" />
            <Skeleton className="h-48 w-full rounded" />
          </aside>
        )}
      </div>
    </>
  );
}

function ChatSkeleton({ density, header }: RendererProps) {
  return (
    <div className="flex h-screen">
      <aside className="hidden w-[68px] flex-col border-r lg:flex">
        <NavRailSkeleton itemHeight="h-9" />
      </aside>

      <div className="flex flex-1 flex-col">
        {header && (
          <header className="flex h-14 items-center border-b px-4">
            <Skeleton className="h-6 w-32 rounded" />
          </header>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <Skeleton className="h-12 w-3/4 self-start rounded" />
              </div>
            ))}
            <div className="flex justify-end">
              <Skeleton className="h-12 w-1/4 self-end rounded" />
            </div>
          </div>
        </div>
        <footer className="flex items-center gap-2 border-t p-3">
          <Skeleton className="h-10 w-full rounded-full" />
        </footer>
      </div>
    </div>
  );
}

/* ── Component ── */

const KIND_RENDERER: Record<SkeletonKind, (props: RendererProps) => React.ReactNode> = {
  console: ConsoleSkeleton,
  auth: AuthSkeleton,
  landing: LandingSkeleton,
  docs: DocsSkeleton,
  chat: ChatSkeleton,
};

export function LayoutSkeleton({
  kind,
  density = "comfortable",
  nav = { items: DEFAULT_NAV_ITEMS, sections: DEFAULT_NAV_SECTIONS },
  header = true,
  aside = false,
  className,
}: LayoutSkeletonProps) {
  const render = KIND_RENDERER[kind];

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-background text-foreground",
        DENSITY_GAP[density as keyof typeof DENSITY_GAP],
        className,
      )}
    >
      {render({ density, nav, header, aside })}
    </div>
  );
}
