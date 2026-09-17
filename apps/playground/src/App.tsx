import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@fusorb/facet-components";
import type { LayoutConfig, RouterAdapter } from "@fusorb/facet-layout";
import {
  ConsoleLayout,
  PageHeader,
  createDefaultAdapter,
} from "@fusorb/facet-layout";
import type { SandboxConfig } from "@fusorb/facet-sandbox";
import { Sandbox, reactAdapter } from "@fusorb/facet-sandbox/react";
import { MotionDemo } from "./blocks/MotionDemo.js";
import { AuthFlow } from "./blocks/AuthFlow.js";
import { StackAgnosticism } from "./blocks/StackAgnosticism.js";

const PRESETS = ["fintech", "med", "edu", "enterprise", "default"] as const;

const TAB_TITLES: Record<string, string> = {
  motion: "Motion presets",
  auth: "Auth flow (simulated)",
  stack: "Stack agnosticism",
};
const TAB_DESCRIPTIONS: Record<string, string> = {
  motion: "Preview motion profiles across the fintech, med, edu, enterprise and default domains.",
  auth: "Staged auth lifecycle: simulated 401 → silent refresh → tenant switch.",
  stack: "Framework-agnostic rendering surface shared across all demo stacks.",
};

const playgroundConfig: LayoutConfig = {
  brand: {
    name: "facet",
    tagline: "Live playground",
  },
  navigation: [
    {
      id: "playground",
      title: "Playground",
      items: [
        { href: "#motion", label: "Motion presets" },
        { href: "#auth", label: "Auth flow" },
        { href: "#stack", label: "Stack agnosticism" },
      ],
    },
  ],
  features: { tenantSwitcher: false, themeToggle: true },
};

/**
 * Drives the active tab from `window.location.hash` so sidebar links navigate
 * client-side (no reload) and the current tab stays shareable/deep-linkable.
 */
function useHashTab(defaultTab = "motion") {
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      return (window.location.hash || `#${defaultTab}`).replace("#", "");
    }
    return defaultTab;
  });

  useEffect(() => {
    const update = () => {
      setTab((window.location.hash || `#${defaultTab}`).replace("#", ""));
    };
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, [defaultTab]);

  return tab;
}

const DEVICE = [
  { id: "desktop", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "mobile", label: "Mobile" },
] as const;

type Device = (typeof DEVICE)[number]["id"];

export default function App() {
  const tab = useHashTab();
  const [preset, setPreset] = useState<string>(PRESETS[0]);
  const [device, setDevice] = useState<Device>(DEVICE[0].id);

  // Re-create the preview component whenever the preset changes so the
  // Sandbox parser picks up the new motion profile. The parser invokes
  // `<Demo />` with no attributes, so no props are forwarded.
  const components = useMemo(
    () => ({
      Demo: () => <MotionDemo preset={preset} />,
    }),
    [preset],
  );

  const sandboxConfig: SandboxConfig = useMemo(
    () => ({
      defaultCode: "return <Demo />",
      title: `${preset} motion preview`,
      adapter: "react",
    }),
    [preset],
  );

  // Reuse the framework-agnostic anchor from the default adapter, but match
  // against the hash so sidebar clicks toggle SPA tabs (not page reloads).
  const router = useMemo<RouterAdapter>(() => {
    const base = createDefaultAdapter();
    return {
      ...base,
      isActive: (href: string) =>
        typeof window !== "undefined" && window.location.hash === href,
      asPath:
        typeof window !== "undefined" ? window.location.hash : undefined,
    };
  }, []);

  const actions = useMemo(() => {
    const deviceControl = (
      <label className="text-sm">
        Device
        <select
          value={device}
          onChange={(e) => setDevice(e.target.value as Device)}
          className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {DEVICE.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
    );
    if (tab !== "motion") return deviceControl;
    return (
      <>
        <label className="text-sm">
          Preset
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            {PRESETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        {deviceControl}
        <span className="text-xs text-muted-foreground">
          fintech = fast, med = smooth, edu = spring
        </span>
      </>
    );
  }, [tab, preset, device]);

  return (
    <ThemeProvider defaultTheme="system">
      <ConsoleLayout
        config={playgroundConfig}
        router={router}
        mode="full"
        themeToggle
      >
        <PageHeader
          title={TAB_TITLES[tab] ?? "Playground"}
          description={TAB_DESCRIPTIONS[tab]}
          actions={actions}
        />
        <div className="flex justify-center">
          {tab === "motion" && (
            <Sandbox
              config={sandboxConfig}
              components={components}
              adapter={reactAdapter}
              classNames={{ preview: `preview-device-${device}` }}
              className="max-w-full"
            />
          )}
          {tab === "auth" && <AuthFlow />}
          {tab === "stack" && <StackAgnosticism />}
        </div>
      </ConsoleLayout>
    </ThemeProvider>
  );
}
