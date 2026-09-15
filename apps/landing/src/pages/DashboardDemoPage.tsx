import { useState } from "react";
import {
  PageHeader,
  StatCard,
  ActivityFeed,
  HoverScaleCard,
  ScrollReveal,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Pill,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { PageShell } from "../components/PageShell.js";
import {
  DASHBOARD_STATS_FULL,
  DASHBOARD_ACTIVITY,
} from "../data/dashboard-demo.js";
import { getDocsUrl } from "../site.config.js";

const SYSTEM_ROWS = [
  { label: "Identity API", status: "operational", color: "bg-success" },
  { label: "Webhook delivery", status: "operational", color: "bg-success" },
  { label: "Token refresh", status: "operational", color: "bg-success" },
  { label: "Audit log export", status: "degraded", color: "bg-warning" },
  { label: "OAuth introspection", status: "operational", color: "bg-success" },
];

/**
 * /dashboard-demo - a full console surface demo. Shows everything the
 * ready-to-use facet stack provides for the "console" use case:
 * PageHeader, StatCard grid, ActivityFeed, Card/HoverScaleCard framing,
 * staggered ScrollReveal entrance, and ONE Tabs context switching between
 * the feed and log views (single controlled state, no dual contexts).
 */
export function DashboardDemoPage() {
  const [view, setView] = useState("feed");

  return (
    <PageShell
      kicker={
        <PageHeader
          layout="row"
          title="Identity operations console"
          description="A full console surface built from ready-to-use facet components. The same shells ship in the docs engine and the layout package's ConsoleLayout."
          crumbs={[{ label: "Home", href: "/" }, { label: "Dashboard demo" }]}
          actions={
            <Pill
              color="success"
              leading={
                <span className="size-1.5 animate-[facet-glow-pulse_2s_ease-in-out_infinite] rounded-full bg-success" />
              }
            >
              live demo
            </Pill>
          }
        />
      }
      title=""
      description=""
    >
      {/* KPI strip - horizontally scrollable so all six stats stay one
          row on large screens instead of stacking 4+2 */}
      <section className="mx-auto max-w-7xl px-8 py-8">
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DASHBOARD_STATS_FULL.map((s, i) => (
            <ScrollReveal
              key={s.label}
              delay={i * 75}
              duration={500}
              className="w-[230px] shrink-0"
            >
              <StatCard
                label={s.label}
                value={s.value}
                delta={s.delta}
                icon={s.icon}
                hint={s.hint}
                className="h-full"
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Activity + quick stats */}
      <section className="mx-auto max-w-7xl px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <ScrollReveal delay={300} duration={600}>
            <Card className="h-full min-w-0">
              <div className="p-5">
                <Tabs value={view} onValueChange={setView}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      Recent activity
                    </h2>
                    <TabsList>
                      <TabsTrigger value="feed">Feed</TabsTrigger>
                      <TabsTrigger value="log">Log</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="feed">
                    <ActivityFeed items={DASHBOARD_ACTIVITY} groupByDay />
                  </TabsContent>
                  <TabsContent value="log">
                    <ActivityFeed
                      items={DASHBOARD_ACTIVITY}
                      groupByDay={false}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={375} duration={600}>
            <HoverScaleCard>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>System health</CardTitle>
                  <CardDescription>Last 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SYSTEM_ROWS.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-md border border-border p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${row.color}`} />
                        <span className="text-sm font-medium text-foreground">
                          {row.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </HoverScaleCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Doc pointer */}
      <section className="mx-auto max-w-3xl px-8 py-12 text-center">
        <Badge
          variant="outline"
          className="mb-3 border-primary/30 text-primary"
        >
          <LightIcon name="terminal" size={12} className="mr-1.5" />
          Ship it
        </Badge>
        <p className="text-sm text-muted-foreground">
          Every component on this page is a typed, named export. Copy the{" "}
          <code className="rounded bg-secondary/50 px-2 py-1 text-xs">
            PageHeader
          </code>
          ,{" "}
          <code className="rounded bg-secondary/50 px-2 py-1 text-xs">
            StatCard
          </code>
          , and{" "}
          <code className="rounded bg-secondary/50 px-2 py-1 text-xs">
            ActivityFeed
          </code>{" "}
          imports straight into your app.
        </p>
        <a
          href={getDocsUrl()}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <LightIcon name="book-open" size={14} />
          Browse the docs
        </a>
      </section>
    </PageShell>
  );
}
