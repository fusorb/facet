import { ThemeToggle, Button, Icon, Tabs, TabsList, TabsTrigger } from "@fusorb/facet-components";
import { surfaces } from "../../../../surfaces.config.mjs";
import { VIEWPORT_PRESETS, type ViewportPresetId } from "../lib/viewport-presets.js";

export interface ToolbarProps {
  name: string;
  category: string;
  viewport: ViewportPresetId;
  onViewportChange: (viewport: ViewportPresetId) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onCopyLink: () => void;
  copied: boolean;
  onOpenCatalog: () => void;
  onOpenInspector: () => void;
  tab: "preview" | "code";
  onTabChange: (tab: "preview" | "code") => void;
}

export function Toolbar({
  name,
  category,
  viewport,
  onViewportChange,
  reducedMotion,
  onToggleReducedMotion,
  onCopyLink,
  copied,
  onOpenCatalog,
  onOpenInspector,
  tab,
  onTabChange,
}: ToolbarProps) {
  const docsUrl = import.meta.env.DEV ? surfaces.docs.dev : surfaces.docs.prod;

  return (
    <header className="pg-toolbar" aria-label="Playground toolbar">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenCatalog}
        aria-label="Open catalog"
      >
        <Icon name="menu" className="size-4" />
      </Button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        <span className="text-muted-foreground">{category}</span>
        <Icon name="chevron-right" className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate font-medium">{name}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Tabs
          value={viewport}
          onValueChange={(value) => onViewportChange(value as ViewportPresetId)}
          className="hidden md:block"
        >
          <TabsList aria-label="Viewport">
            {VIEWPORT_PRESETS.map((preset) => (
              <TabsTrigger key={preset.id} value={preset.id} aria-label={preset.label}>
                {preset.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={tab} onValueChange={(value) => onTabChange(value as "preview" | "code")} className="hidden sm:block">
          <TabsList aria-label="View">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleReducedMotion}
          aria-pressed={reducedMotion}
          aria-label="Reduce motion"
          title="Reduce motion"
        >
          <Icon name="zap" className="size-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onCopyLink} aria-label="Copy permalink" title="Copy permalink">
          <Icon name={copied ? "check" : "link"} className="size-4" />
        </Button>

        <ThemeToggle />

        <a href={docsUrl} target="_blank" rel="noreferrer" className="hidden text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline md:inline">
          Docs
        </a>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenInspector}
          aria-label="Open controls"
        >
          <Icon name="sliders-horizontal" className="size-4" />
        </Button>
      </div>
    </header>
  );
}
