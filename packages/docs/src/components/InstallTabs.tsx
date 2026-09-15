import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@fusorb/facet-components/light";
import { usePackageManager } from "../context.js";

export interface InstallCommand {
  /** Package spec as it appears in the command, e.g. "@fusorb/facet-components". */
  pkg: string;
  /** Extra packages appended to the same install line (optional). */
  extras?: string[];
}

const MANAGERS = [
  { id: "pnpm", label: "pnpm", cmd: "pnpm add" },
  { id: "npm", label: "npm", cmd: "npm install" },
  { id: "yarn", label: "yarn", cmd: "yarn add" },
  { id: "bun", label: "bun", cmd: "bun add" },
] as const;

/**
 * Framework-agnostic install block with tabs for each package manager.
 * Every command is real: the @fusorb/facet-* packages publish to npm, so
 * pnpm, npm, yarn, and bun can all install them.
 *
 * Compact by design: the manager tabs are narrow chips (not full-width
 * bars) and the whole block caps its width so it does not stretch across
 * a wide content column.
 */
export function InstallTabs({ commands }: { commands: InstallCommand[] }) {
  const { activeManager: active, setActiveManager: setActive } =
    usePackageManager();

  const joined = (cmd: string) =>
    commands
      .map(
        (entry) => `${cmd} ${[entry.pkg, ...(entry.extras ?? [])].join(" ")}`,
      )
      .join("\n");

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="h-auto w-auto flex-wrap justify-start gap-1 rounded-lg bg-muted/40 p-1">
        {MANAGERS.map((m) => (
          <TabsTrigger
            key={m.id}
            value={m.id}
            className="h-7 rounded-md px-2.5 text-xs font-medium"
          >
            {m.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {MANAGERS.map((m) => (
        <TabsContent key={m.id} value={m.id}>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-[13px] leading-6 text-foreground">
            {joined(m.cmd)}
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
}
