import { CSSProperties, type ReactNode, useMemo, useState } from "react";
import { MOTION_EFFECTS } from "../data/scratchpad.js";
import type { MotionEffectSpec } from "../data/scratchpad.js";
import { useLabDomain } from "../lib/lab-domain.js";
import { PageShell } from "../components/PageShell.js";
import { MotionPreview } from "../components/MotionPreview.js";
import {
  LabDomainBar,
  LabPanel,
  LabTag,
  CodeLine,
  CopyButton,
} from "../components/labs";
import { LightIcon } from "@fusorb/facet-components/light";
import { cn } from "@fusorb/facet-components";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "generative", label: "Generative" },
  { id: "authored", label: "Authored" },
];

export function MotionLabPage() {
  const { domain } = useLabDomain();
  const accent = domain.accent;
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<MotionEffectSpec>(MOTION_EFFECTS[0]!);

  const filtered = useMemo(
    () =>
      MOTION_EFFECTS.filter(
        (e) =>
          (category === "all" || e.category === category) &&
          (e.label + " " + e.desc).toLowerCase().includes(search.toLowerCase()),
      ),
    [category, search],
  );

  const rootStyle: CSSProperties = {
    "--domain-accent": accent,
  } as CSSProperties;

  return (
    <PageShell
      kicker={<LabTag tone="accent">Motion</LabTag>}
      title="Motion Lab"
      description="Pick an effect, see it live, then copy the generated usage."
    >
      <div className="lab" style={rootStyle}>
        <LabDomainBar />

        <div className="grid gap-6 md:grid-cols-[260px_1fr_300px]">
          {/* ── Effect selector ── */}
          <div className="flex flex-col gap-3">
            <LabTag tone="dim">Effect library</LabTag>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "rounded-lg border border-border/60 px-2.5 py-1 text-xs font-medium",
                    "hover:bg-secondary",
                    category === c.id
                      ? "border-transparent bg-secondary text-foreground"
                      : "text-muted-foreground",
                  )}
                  style={
                    category === c.id
                      ? {
                          background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <LightIcon
                name="search"
                size={14}
                className="absolute left-2.5 top-2.5 text-muted-foreground/60"
              />
              <input
                type="search"
                placeholder="Search effects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-secondary/40 pl-8 pr-3 py-1.5 text-xs"
              />
            </div>

            <div className="space-y-1 overflow-y-auto">
              {filtered.map((e: MotionEffectSpec) => {
                const isActive = active.id === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setActive(e)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left text-sm transition-all",
                      isActive
                        ? "border-transparent ring-2 ring-offset-2 ring-offset-background"
                        : "border-transparent hover:bg-secondary",
                    )}
                    style={
                      isActive
                        ? {
                            boxShadow: `0 0 0 2px var(--background), 0 0 0 5px ${accent}`,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background:
                          e.category === "generative"
                            ? "#a78bfa"
                            : "var(--success)",
                      }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground/90">
                          {e.label}
                        </span>
                        {isActive && (
                          <span style={{ color: accent }}>
                            <LightIcon name="check" size={12} />
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        {e.desc}
                      </p>
                      <span
                        className="inline-block rounded px-1.5 py-0.25 text-[9px] uppercase"
                        style={{
                          color:
                            e.category === "generative"
                              ? "var(--violet)"
                              : "var(--success)",
                        }}
                      >
                        {e.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Live preview ── */}
          <div className="flex flex-col gap-3">
            <LabTag tone="dim">Live preview</LabTag>
            <LabPanel className="lab-surface flex h-full min-h-[220px] items-center justify-center">
              <MotionPreview effect={active.id} size="md" />
            </LabPanel>
          </div>

          {/* ── Configuration + generated code ── */}
          <div className="flex flex-col gap-3">
            <LabTag tone="dim">Configuration</LabTag>
            <div className="space-y-3">
              <ConfigRow label="domain" value={domain.id} />
              <ConfigRow
                label="intensity"
                control={
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={80}
                    className="w-full"
                    style={{ accentColor: accent }}
                  />
                }
              />
              <ConfigRow
                label="duration"
                control={
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={10}
                    defaultValue={300}
                    className="w-full"
                    style={{ accentColor: accent }}
                  />
                }
              />
              <ConfigRow label="easing" value="spring" />
              <ConfigRow label="reduced-motion" value="false" />
            </div>

            <div className="mt-2">
              <LabTag tone="dim">Generated import</LabTag>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary/40 p-3 text-xs">
                {codeLines(active).map((line, i) => (
                  <CodeLine key={i} segments={line} />
                ))}
              </pre>
              <div className="mt-2">
                <CopyButton
                  value={codeText(active)}
                  label="Copy import"
                  size="xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ConfigRow({
  label,
  value,
  control,
}: {
  label: string;
  value?: string;
  control?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-xs text-muted-foreground/60">
        {label}
      </span>
      {control ?? (
        <span className="text-xs font-medium text-foreground/80">{value}</span>
      )}
    </div>
  );
}

type CodeSeg = { text: string; role?: "keyword" | "string" | "ident" | "dim" };

const KW: CodeSeg["role"] = "keyword";
const ST: CodeSeg["role"] = "string";
const ID: CodeSeg["role"] = "ident";
const DM: CodeSeg["role"] = "dim";

function codeLines(effect: MotionEffectSpec): CodeSeg[][] {
  const sym = effect.label;
  return [
    [
      { text: "import", role: KW },
      { text: " { ", role: DM },
      { text: sym, role: ID },
      { text: " } ", role: DM },
      { text: "from", role: KW },
      { text: ' "', role: DM },
      { text: "@fusorb/facet-motion", role: ST },
      { text: '";', role: DM },
    ],
    [],
    [
      { text: "const ", role: KW },
      { text: "{ ref }", role: ID },
      { text: " = ", role: DM },
      { text: "useMotion", role: ID },
      { text: '("', role: DM },
      { text: effect.id, role: ST },
      { text: '"', role: DM },
      { text: ", {", role: DM },
    ],
    [
      { text: "  intensity: 0.8,", role: ST },
      { text: " duration: 300,", role: ST },
      { text: ' easing: "spring",', role: ST },
      { text: " reducedMotion: false,", role: ST },
    ],
    [{ text: "});", role: DM }],
  ];
}

function codeText(effect: MotionEffectSpec): string {
  return [
    `import { ${effect.label} } from "@fusorb/facet-motion";`,
    "",
    `const { ref } = useMotion("${effect.id}", {`,
    `  intensity: 0.8,`,
    `  duration: 300,`,
    `  easing: "spring",`,
    `  reducedMotion: false,`,
    "});",
  ].join("\n");
}
