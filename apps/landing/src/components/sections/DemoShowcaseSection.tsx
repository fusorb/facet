import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Marquee,
  Pill,
  Progress,
  QRCode,
  Slider,
  SparkleButton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeToggle,
  useTheme,
  ColorPicker,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { site } from "../../site.config.js";
import { BUTTON_VARIANTS, BADGE_VARIANTS } from "../../data/features.js";

/**
 * Live demo section. Each tab is a working slice of the library: real
 * state, real interactions, real tokens. What you see is what you get.
 */

function DemoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <LightIcon name={icon} size={16} className="text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** 1. Button + badge variants (visual only — no action). */
function ButtonsDemo() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DemoCard title="Button variants" icon="grid">
        <div className="flex flex-wrap gap-3">
          {BUTTON_VARIANTS.map((v) => (
            <Button key={v} variant={v} size="sm">
              {v}
            </Button>
          ))}
        </div>
      </DemoCard>
      <DemoCard title="Badge variants" icon="check">
        <div className="flex flex-wrap gap-3">
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </div>
      </DemoCard>
    </div>
  );
}

/** 2. Live controls: switch, slider, progress tracking state together. */
function ControlsDemo() {
  const [enabled, setEnabled] = useState(true);
  const [level, setLevel] = useState(65);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DemoCard title="Switch" icon="toggle-left">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {enabled ? "On, you'll hear about it" : "Off, quiet mode"}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </DemoCard>
      <DemoCard title="Slider + Progress" icon="layout-dashboard">
        <div className="space-y-4">
          <Slider
            value={[level]}
            onValueChange={(v) => setLevel(v[0] ?? 0)}
            min={0}
            max={100}
          />
          <div className="flex items-center gap-3">
            <Progress value={level} className="flex-1" />
            <span className="w-10 text-right font-mono text-sm text-foreground">
              {level}%
            </span>
          </div>
        </div>
      </DemoCard>
    </div>
  );
}

/** 3. Theme: flip light/dark live, read the resolved value. */
function ThemeDemo() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  return (
    <div className="mx-auto max-w-md">
      <DemoCard title="Theme" icon="sun">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Light / dark / system
            </p>
            <p className="text-xs text-muted-foreground">
              Current: <span className="font-mono">{theme}</span> (resolved:{" "}
              <span className="font-mono">{resolvedTheme}</span>)
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => toggleTheme()}>
            Toggle theme
          </Button>
        </div>
      </DemoCard>
    </div>
  );
}

/** 4. QR code: type a URL, see it encoded live. */
function QrDemo() {
  const [url, setUrl] = useState<string>(site.links.github);
  const safeUrl = url || site.links.github;
  return (
    <div className="mx-auto max-w-md">
      <DemoCard title="QR Code" icon="qr-code">
        <div className="flex flex-col items-center gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="rounded-lg border border-border bg-background p-3">
            <QRCode
              value={safeUrl}
              fgColor="currentColor"
              size={140}
              level="H"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A live QR code. Scan it with your phone.
          </p>
        </div>
      </DemoCard>
    </div>
  );
}

/** 5. Color picker: pick a hex, see it applied to a live swatch. */
function ColorDemo() {
  const [color, setColor] = useState("#4ad3f5");
  return (
    <div className="mx-auto max-w-md">
      <DemoCard title="Color Picker" icon="palette">
        <div className="flex items-center gap-4">
          <ColorPicker
            value={color}
            onValueChange={setColor}
            label="Accent color"
          />
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border text-xs font-medium"
            style={{ backgroundColor: color }}
          >
            <span className="rounded bg-background/70 px-2 py-1 font-mono text-[10px]">
              {color}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Components read tokens via CSS variables; override any of them per
          brand with
          <span className="font-mono"> overrideVars</span>.
        </p>
      </DemoCard>
    </div>
  );
}

/** 6. Marquee: live scrolling strip with hover-pause. */
function MarqueeDemo() {
  const items = [
    "Radix primitives",
    "Alpha Palette tokens",
    "Domain presets",
    "SSR-safe theming",
    "Tree-shaken icons",
    "Auth built in",
  ];
  return (
    <DemoCard title="Marquee" icon="arrow-right">
      <Marquee
        duration={18}
        gap="0.5rem"
        items={items.map((t) => (
          <span
            key={t}
            className="whitespace-nowrap rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm text-foreground"
          >
            {t}
          </span>
        ))}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Hover the strip to pause the scroll.
      </p>
    </DemoCard>
  );
}

/** 7. SparkleButton: the CTA that bursts sparkles on click. */
function SparkleDemo() {
  return (
    <div className="mx-auto max-w-md">
      <DemoCard title="SparkleButton" icon="sparkles">
        <div className="flex flex-col items-center gap-4">
          <SparkleButton label="Try me" className="h-11 px-10" />
          <p className="text-xs text-muted-foreground">
            Click anywhere on the button. Every click bursts sparkles from the
            click point.
          </p>
        </div>
      </DemoCard>
    </div>
  );
}

const DEMOS = [
  { id: "buttons", label: "Buttons", node: <ButtonsDemo /> },
  { id: "controls", label: "Controls", node: <ControlsDemo /> },
  { id: "theme", label: "Theme", node: <ThemeDemo /> },
  { id: "qr", label: "QR Code", node: <QrDemo /> },
  { id: "color", label: "Color", node: <ColorDemo /> },
  { id: "marquee", label: "Marquee", node: <MarqueeDemo /> },
  { id: "sparkle", label: "Sparkle", node: <SparkleDemo /> },
];

export function DemoShowcaseSection() {
  const [tab, setTab] = useState("buttons");

  return (
    <section id="demo" className="mx-auto max-w-5xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name="zap" size={12} />}
        >
          Live demos
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          See it in action
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Not screenshots. Live components running on the real tokens. Flip the
          theme, drag the slider, scan the QR code, burst some sparkles.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v)} className="w-full">
        <div className="mb-8 overflow-x-auto text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="inline-flex flex-nowrap items-center justify-center gap-1">
            {DEMOS.map((d) => (
              <TabsTrigger key={d.id} value={d.id} className="flex-shrink-0">
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {DEMOS.map((d) => (
          <TabsContent key={d.id} value={d.id} className="space-y-6">
            {d.node}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
