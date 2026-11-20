import type React from "react";
import { useMemo } from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import {
  AuthLayout,
  LandingLayout,
  ConsoleLayout,
  ChatLayout,
  DocsLayout,
  DocsAside,
  LayoutSkeleton,
  defaultLayoutPreset,
  fintechLayoutPreset,
  medLayoutPreset,
  eduLayoutPreset,
  enterpriseLayoutPreset,
  type LayoutConfig,
} from "@fusorb/facet-layout";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@fusorb/facet-components";

type PresetId = "default" | "fintech" | "med" | "edu" | "enterprise";

const PRESETS: Record<PresetId, LayoutConfig> = {
  default: defaultLayoutPreset,
  fintech: fintechLayoutPreset,
  med: medLayoutPreset,
  edu: eduLayoutPreset,
  enterprise: enterpriseLayoutPreset,
};

const PRESET_OPTIONS: PresetId[] = ["default", "fintech", "med", "edu", "enterprise"];

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[70vh] min-h-[480px] w-full overflow-hidden rounded-lg border border-border bg-background [transform:translateZ(0)]">
      {children}
    </div>
  );
}

function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-4 p-1">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["Overview", "Activity", "Status", "Details"].map((label) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-base">{label}</CardTitle>
              <CardDescription>Config-driven layout preview content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded-md bg-muted/50" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AuthDemo({ preset, tagline }: { preset: PresetId; tagline: string }) {
  const config = useMemo<LayoutConfig>(() => {
    const base = PRESETS[preset];
    return { ...base, brand: { ...base.brand, tagline: tagline || base.brand.tagline } };
  }, [preset, tagline]);
  return (
    <Frame>
      <div className="h-full w-full overflow-auto">
        <AuthLayout config={config} className="!min-h-full">
          <Card className="w-full max-w-sm border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Preview of the auth shell with configurable brand content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input id="demo-email" placeholder="you@example.com" />
              </div>
              <Button className="w-full">Continue</Button>
            </CardContent>
          </Card>
        </AuthLayout>
      </div>
    </Frame>
  );
}

function LandingDemo({ preset }: { preset: PresetId }) {
  const config = PRESETS[preset];
  return (
    <Frame>
      <div className="h-full w-full overflow-auto">
        <LandingLayout
          className="!min-h-full"
          hero={
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary">{config.brand.name}</p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
                {config.brand.tagline ?? "Configurable landing shell"}
              </h1>
              <p className="max-w-xl text-muted-foreground">
                A dynamic, config-driven marketing layout preview. Swap presets and compose hero, sections, and footer.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button>Get started</Button>
                <Button variant="outline">Learn more</Button>
              </div>
            </div>
          }
          footer={
            <div className="border-t border-border px-8 py-6 text-sm text-muted-foreground">
              {config.brand.footerText ?? `${config.brand.name} â€” preview footer`}
            </div>
          }
        >
          <section className="mx-auto grid max-w-7xl gap-4 px-8 pb-16 md:grid-cols-3">
            {(config.brand.benefits ?? ["Composable sections", "Token-driven styling", "Domain presets"]).map((b) => (
              <Card key={b}>
                <CardHeader>
                  <CardTitle className="text-base">{b}</CardTitle>
                  <CardDescription>Landing content region driven by layout config.</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>
        </LandingLayout>
      </div>
    </Frame>
  );
}

function ConsoleDemo({ preset, mode }: { preset: PresetId; mode: "full" | "rail" }) {
  const config = PRESETS[preset];
  return (
    <Frame>
      <ConsoleLayout config={config} mode={mode} className="!min-h-full">
        <PlaceholderPage
          title="Console dashboard"
          subtitle={`Preset: ${preset} Â· mode: ${mode}. Sidebar, topbar, and content regions are config-driven.`}
        />
      </ConsoleLayout>
    </Frame>
  );
}

function DocsDemo({ preset, mode, showAside }: { preset: PresetId; mode: "full" | "rail"; showAside: boolean }) {
  const config = PRESETS[preset];
  const headings = [
    { id: "overview", text: "Overview", level: 2 as const },
    { id: "configuration", text: "Configuration", level: 2 as const },
    { id: "regions", text: "Regions", level: 3 as const },
  ];
  return (
    <Frame>
      <DocsLayout
        config={config}
        mode={mode}
        className="!min-h-full"
        aside={showAside ? <DocsAside headings={headings} /> : undefined}
      >
        <div className="prose prose-sm max-w-none p-2 dark:prose-invert">
          <h1 id="overview">Docs layout preview</h1>
          <p>
            Docs shell with sidebar navigation, content region, and optional â€œOn this pageâ€ aside. Preset:{" "}
            <strong>{preset}</strong>, mode: <strong>{mode}</strong>.
          </p>
          <h2 id="configuration">Configuration</h2>
          <p>
            Drive navigation, brand, and features from <code>LayoutConfig</code> presets or custom config.
          </p>
          <h3 id="regions">Regions</h3>
          <p>Navbar, sidebar, content, and aside are composable regions.</p>
        </div>
      </DocsLayout>
    </Frame>
  );
}

function ChatDemo({ preset }: { preset: PresetId }) {
  const config = PRESETS[preset];
  return (
    <Frame>
      <ChatLayout config={config} className="!min-h-full" onSendMessage={() => {}} inputPlaceholder="Send a message (preview)">
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
            Chat layout preview â€” sidebar conversations + message area + input. Preset: <strong>{preset}</strong>.
          </div>
          <div className="ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            Show me a config-driven shell.
          </div>
          <div className="max-w-[80%] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
            Layouts are driven by <code>LayoutConfig</code> (brand, navigation, features) and composable regions.
          </div>
        </div>
      </ChatLayout>
    </Frame>
  );
}

type AnyExample = Example<Record<string, unknown>>;

export const layoutExamples: Record<string, AnyExample[]> = {
  "layout-skeleton": [
    {
      id: "layout-skeleton-preview",
      title: "Layout skeleton",
      description:
        "Config-driven loading skeleton that mirrors layout shell geometry (console/auth/landing/docs/chat).",
      artifact: "layout-skeleton",
      tags: ["layout", "skeleton", "loading"],
      defaults: {
        kind: "console",
        density: "comfortable",
        navSections: 3,
        navItems: 6,
        header: true,
        aside: true,
      },
      controls: {
        kind: { options: ["console", "auth", "landing", "docs", "chat"], label: "Kind" },
        density: { options: ["compact", "comfortable", "spacious"], label: "Density" },
        navSections: { min: 1, max: 6, step: 1, label: "Nav sections" },
        navItems: { min: 1, max: 12, step: 1, label: "Nav items" },
        header: { label: "Header" },
        aside: { label: "Aside (docs)" },
      },
      render: (p) => (
        <Frame>
          <div className="h-full w-full overflow-auto">
            <LayoutSkeleton
              kind={String(p.kind ?? "console") as any}
              density={String(p.density ?? "comfortable") as any}
              nav={{
                sections: Number(p.navSections ?? 3),
                items: Number(p.navItems ?? 6),
              }}
              header={Boolean(p.header)}
              aside={Boolean(p.aside)}
            />
          </div>
        </Frame>
      ),
      code: (p) =>
        `<LayoutSkeleton\n  kind="${String(p.kind ?? "console")}"\n  density="${String(p.density ?? "comfortable")}"\n  nav={{ sections: ${Number(p.navSections ?? 3)}, items: ${Number(p.navItems ?? 6)} }}\n  header={${Boolean(p.header)}}\n  aside={${Boolean(p.aside)}}\n/>`,
    },
  ],
  "auth-layout": [
    {
      id: "auth-layout-preview",
      title: "Auth layout",
      description: "Branded auth shell with configurable preset and tagline.",
      artifact: "auth-layout",
      tags: ["layout", "auth"],
      defaults: { preset: "default", tagline: "" },
      controls: {
        preset: { options: PRESET_OPTIONS, label: "Preset" },
        tagline: { label: "Tagline override" },
      },
      render: (p) => <AuthDemo preset={(p.preset as PresetId) ?? "default"} tagline={String(p.tagline ?? "")} />,
      code: (p) =>
        `<AuthLayout config={${String(p.preset ?? "default")}LayoutPreset}>\n  {/* sign-in form */}\n</AuthLayout>`,
    },
  ],
  "landing-layout": [
    {
      id: "landing-layout-preview",
      title: "Landing layout",
      description: "Marketing shell with hero, content sections, and footer.",
      artifact: "landing-layout",
      tags: ["layout", "landing"],
      defaults: { preset: "default" },
      controls: { preset: { options: PRESET_OPTIONS, label: "Preset" } },
      render: (p) => <LandingDemo preset={(p.preset as PresetId) ?? "default"} />,
      code: (p) =>
        `<LandingLayout config={${String(p.preset ?? "default")}LayoutPreset} hero={...} footer={...}>\n  {/* sections */}\n</LandingLayout>`,
    },
  ],
  "console-layout": [
    {
      id: "console-layout-preview",
      title: "Console layout",
      description: "Dashboard shell with sidebar/topbar, rail or full mode.",
      artifact: "console-layout",
      tags: ["layout", "console"],
      defaults: { preset: "default", mode: "full" },
      controls: {
        preset: { options: PRESET_OPTIONS, label: "Preset" },
        mode: { options: ["full", "rail"], label: "Mode" },
      },
      render: (p) => (
        <ConsoleDemo preset={(p.preset as PresetId) ?? "default"} mode={(p.mode as "full" | "rail") ?? "full"} />
      ),
      code: (p) =>
        `<ConsoleLayout config={${String(p.preset ?? "default")}LayoutPreset} mode="${String(p.mode ?? "full")}">\n  {/* page content */}\n</ConsoleLayout>`,
    },
  ],
  "docs-layout": [
    {
      id: "docs-layout-preview",
      title: "Docs layout",
      description: "Docs shell with sidebar, content, and optional on-this-page aside.",
      artifact: "docs-layout",
      tags: ["layout", "docs"],
      defaults: { preset: "default", mode: "rail", showAside: true },
      controls: {
        preset: { options: PRESET_OPTIONS, label: "Preset" },
        mode: { options: ["full", "rail"], label: "Mode" },
        showAside: { label: "Show aside" },
      },
      render: (p) => (
        <DocsDemo
          preset={(p.preset as PresetId) ?? "default"}
          mode={(p.mode as "full" | "rail") ?? "rail"}
          showAside={Boolean(p.showAside)}
        />
      ),
      code: (p) =>
        `<DocsLayout config={${String(p.preset ?? "default")}LayoutPreset} mode="${String(p.mode ?? "rail")}"${p.showAside ? " aside={<DocsAside headings={headings} />}" : ""}>\n  {/* docs content */}\n</DocsLayout>`,
    },
  ],
  "chat-layout": [
    {
      id: "chat-layout-preview",
      title: "Chat layout",
      description: "Chat shell with sidebar, message area, and input bar.",
      artifact: "chat-layout",
      tags: ["layout", "chat"],
      defaults: { preset: "default" },
      controls: { preset: { options: PRESET_OPTIONS, label: "Preset" } },
      render: (p) => <ChatDemo preset={(p.preset as PresetId) ?? "default"} />,
      code: (p) =>
        `<ChatLayout config={${String(p.preset ?? "default")}LayoutPreset} onSendMessage={onSend}>\n  {/* messages */}\n</ChatLayout>`,
    },
  ],
};

export const layoutItemMeta: Array<{ id: string; name: string; category: string; summary: string }> = [
  {
    id: "layout-skeleton",
    name: "LayoutSkeleton",
    category: "Primitives",
    summary:
      "Config-driven loading skeleton mirroring console/auth/landing/docs/chat shell geometry (kind, density, nav, header, aside).",
  },
  { id: "auth-layout", name: "AuthLayout", category: "Layouts", summary: "Branded split auth shell for sign-in and onboarding flows." },
  { id: "landing-layout", name: "LandingLayout", category: "Layouts", summary: "Marketing shell with hero, content sections, and footer." },
  { id: "console-layout", name: "ConsoleLayout", category: "Layouts", summary: "App console shell with sidebar, topbar, and content regions." },
  { id: "docs-layout", name: "DocsLayout", category: "Layouts", summary: "Documentation shell with navigation, content, and aside." },
  { id: "chat-layout", name: "ChatLayout", category: "Layouts", summary: "Conversational shell with sidebar, messages, and input." },
];
