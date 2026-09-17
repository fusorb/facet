import { useMemo, useState } from "react";
import type { SandboxConfig } from "@fusorb/facet-sandbox";
import { Sandbox, reactAdapter } from "@fusorb/facet-sandbox/react";
import { Button, ThemeProvider, ThemeToggle } from "@fusorb/facet-components";
import { MotionDemo } from "./blocks/MotionDemo.js";
import { AuthFlow } from "./blocks/AuthFlow.js";
import { StackAgnosticism } from "./blocks/StackAgnosticism.js";

const PRESETS = ["fintech", "med", "edu", "enterprise", "default"] as const;

const TAB = [
  { id: "motion", label: "Motion presets" },
  { id: "auth", label: "Auth flow (simulated)" },
  { id: "stack", label: "Stack agnosticism" },
] as const;

const DEVICE = [
  { id: "desktop", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "mobile", label: "Mobile" },
] as const;

type Device = (typeof DEVICE)[number]["id"];

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AppFrame />
    </ThemeProvider>
  );
}

function AppFrame() {
  const [tab, setTab] = useState<string>("motion");
  const [preset, setPreset] = useState<string>(PRESETS[0]);
  const [device, setDevice] = useState<Device>(DEVICE[0].id);

  // Recreate the preview component whenever the preset changes so the
  // Sandbox picks up a fresh motion profile via the parser/adapter. The
  // parser invokes `<Demo />` with no attributes, so no props are forwarded.
  const components = useMemo(
    () => ({
      Demo: () => <MotionDemo preset={preset} />,
    }),
    [preset],
  );

  const config: SandboxConfig = {
    defaultCode: "return <Demo />",
    title: `${preset} motion preview`,
    adapter: "react",
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="font-medium text-foreground">facet playground</h1>
        <nav className="flex items-center gap-1">
          {TAB.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </Button>
          ))}
          <ThemeToggle />
        </nav>
      </header>

      <div className="flex items-center gap-3 border-b px-4 py-3">
        {tab === "motion" && (
          <>
            <label className="text-sm">
              Preset
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="ml-2 rounded-md border border-input bg-background text-sm"
              >
                {PRESETS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-xs text-muted-foreground">
              fintech = fast/standard, med = base/smooth, edu = base/spring
            </span>
          </>
        )}
        <label className="text-sm">
          Device
          <select
            value={device}
            onChange={(e) => setDevice(e.target.value as Device)}
            className="ml-2 rounded-md border border-input bg-background text-sm"
          >
            {DEVICE.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <main className="flex-1 overflow-auto p-6">
        {tab === "motion" && (
          <div className="flex justify-center">
            <Sandbox
              config={config}
              components={components}
              adapter={reactAdapter}
              classNames={{ preview: `preview-device-${device}` }}
              className="max-w-full"
            />
          </div>
        )}
        {tab === "auth" && <AuthFlow />}
        {tab === "stack" && <StackAgnosticism />}
      </main>
    </div>
  );
}
