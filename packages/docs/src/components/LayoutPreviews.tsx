import { CodeBlock } from "./CodeBlock.js";

function CodeShell({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <section className="not-prose mt-8">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        <CodeBlock title={`${title} usage`} code={code} />
      </div>
    </section>
  );
}

/**
 * Preview blocks for the /layout docs page.
 *
 * All layout surfaces are documented code-first: the full shells and even
 * the pill Navbar use fixed/sticky positioning that escapes any CSS
 * container and fights the docs shell, so live previews are unreliable
 * here. Text + copyable code keeps the page accurate and stable.
 */
export function LayoutPreviews() {
  return (
    <div className="space-y-2">
      <CodeShell
        title="ConsoleLayout"
        description={
          'Dashboard shell: sidebar + topbar + content area. mode="full" is always-labeled; mode="rail" collapses to an icon-only rail. Mobile collapses to a Sheet.'
        }
        code={`import { ConsoleLayout, defaultLayoutPreset } from "@fusorb/facet-layout";

<ConsoleLayout config={defaultLayoutPreset} mode="full">
  <YourContent />
</ConsoleLayout>`}
      />

      <CodeShell
        title="AuthLayout"
        description="Branded split-panel auth page frame: logo + tagline + benefits on the left, centered card on the right."
        code={`import { AuthLayout, fintechLayoutPreset } from "@fusorb/facet-layout";
import { SignIn, fintechPreset } from "@fusorb/facet-auth";

<AuthLayout config={fintechLayoutPreset}>
  <SignIn config={fintechPreset} />
</AuthLayout>`}
      />

      <CodeShell
        title="Sidebar & Topbar"
        description="Use Sidebar + Topbar standalone with LayoutProvider: this docs site is built from them. Drag the sidebar edge to resize."
        code={`import { Sidebar, Topbar, LayoutProvider, fintechLayoutPreset } from "@fusorb/facet-layout";

<LayoutProvider>
  <div className="flex">
    <Sidebar config={fintechLayoutPreset} />
    <div className="flex-1">
      <Topbar />
      <main className="p-8">Content</main>
    </div>
  </div>
</LayoutProvider>`}
      />

      <CodeShell
        title="LandingLayout"
        description="Full-bleed marketing shell with a glassmorphic hero. Pair with the Navbar pill variant for a flush, scroll-aware glass header."
        code={`import { LandingLayout } from "@fusorb/facet-layout";
import { Navbar } from "@fusorb/facet-components";

<LandingLayout
  nav={<Navbar variant="pill" brand={brand} links={links} />}
  hero={<h1 className="text-5xl font-bold">Build faster</h1>}
  footer={<footer>© 2026</footer>}
>
  <section>Feature grid</section>
</LandingLayout>`}
      />

      <CodeShell
        title="Navbar pill"
        description="The pill navbar variant is the landing shell's top nav: a floating rounded bar with brand, links, and actions."
        code={`import { Navbar } from "@fusorb/facet-components";

<Navbar
  variant="pill"
  brand={<span className="font-semibold">facet</span>}
  links={[
    { href: "#", label: "Features" },
    { href: "#", label: "Docs" },
  ]}
  actions={
    <div className="flex gap-2">
      <Button size="sm">Get started</Button>
    </div>
  }
/>`}
      />
    </div>
  );
}
