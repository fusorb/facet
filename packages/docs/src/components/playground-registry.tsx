import * as React from "react";
import * as FacetComponents from "@arcevo/facet-components";
import * as FacetAuth from "@arcevo/facet-auth";
import { ArcIdClient } from "@arcevo/facet-sdk";
import * as FacetLayout from "@arcevo/facet-layout";
import { defaultLayoutPreset, fintechLayoutPreset } from "@arcevo/facet-layout";

/**
 * Component registry for the live playground.
 *
 * The gallery's usage snippets are copy-pasteable docs snippets: they reference
 * ambient identifiers (`client`, `fintechPreset`, `columns`, ...) and components
 * from every Arcevo package (`facet-components`, `facet-auth`, `facet-layout`).
 * The playground can't execute JS, so this registry makes every referenced tag
 * resolve to something that renders:
 *
 *  - auth components render behind a demo ArcIdClient (no network),
 *  - layout components fall back to a default preset,
 *  - doc placeholders (`<YourContent/>`, `<ProfileForm/>` …) render a labelled box,
 *  - data-heavy components get demo props so the preview fills in instead of blanking.
 */

// Signed-out, no-network demo client. Usage snippets pass `client` as an
// ambient identifier; when it resolves to undefined we inject this.
const DEMO_CLIENT = new ArcIdClient({ baseUrl: "https://demo.invalid" });
const noOp = () => {};

/* ── Auth ────────────────────────────────────────────── */

function ArcProviderWithDemo({ client, children, ...rest }: any) {
  return (
    <FacetAuth.ArcProvider client={client ?? DEMO_CLIENT} {...rest}>
      {children}
    </FacetAuth.ArcProvider>
  );
}

function AuthComponentWithDemo(
  C: React.ComponentType<any>,
  configDefault: any,
) {
  const Wrapped: React.FC<any> = ({ config, ...rest }) => (
    <FacetAuth.ArcProvider client={DEMO_CLIENT}>
      {React.createElement(C, { config: config ?? configDefault, ...rest })}
    </FacetAuth.ArcProvider>
  );
  const name = (C as any)?.displayName || (C as any)?.name || "AuthComponent";
  Wrapped.displayName = name;
  return Wrapped;
}

const SignIn = AuthComponentWithDemo(FacetAuth.SignIn, {
  allowMagicLink: true,
  allowPasskey: true,
});
const SignUp = AuthComponentWithDemo(FacetAuth.SignUp, {
  allowMagicLink: true,
  allowPasskey: true,
});
const Guard = AuthComponentWithDemo(FacetAuth.Guard, undefined);

/* ── Layout ──────────────────────────────────────────── */

function LayoutComponentWithDefault(
  C: React.ComponentType<any>,
  configDefault: any,
) {
  const Wrapped: React.FC<any> = ({ config, ...rest }) => {
    const props: any = { ...rest };
    if (configDefault != null) props.config = config ?? configDefault;
    return React.createElement(C, props);
  };
  const name = (C as any)?.displayName || (C as any)?.name || "LayoutComponent";
  Wrapped.displayName = name;
  return Wrapped;
}

const ConsoleLayout = LayoutComponentWithDefault(
  FacetLayout.ConsoleLayout,
  defaultLayoutPreset,
);
const AuthLayout = LayoutComponentWithDefault(FacetLayout.AuthLayout, fintechLayoutPreset);
const Sidebar = LayoutComponentWithDefault(FacetLayout.Sidebar, fintechLayoutPreset);

/* ── Doc placeholders ── names used in usage snippets where the reader is
   expected to replace them with their own content. */

function placeholder(label: string): React.ComponentType {
  const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
      <span className="font-mono">{label}</span>
    </div>
  );
  Placeholder.displayName = label;
  return Placeholder;
}

const YourContent = placeholder("YourContent");
const YourApp = placeholder("YourApp");
const ProtectedPage = placeholder("ProtectedPage");
const YourRoutes = placeholder("YourRoutes");
const ProfileForm = placeholder("ProfileForm");
const SecuritySettings = placeholder("SecuritySettings");

/* ── Demo-data wrappers ── components whose default usage passes ambient
   identifiers (`columns`, `rows`, `testimonials`, `form`, …). The editor
   keeps the real snippet; the wrapper supplies demo data when a prop is
   undefined so the preview renders instead of going blank. */

const DEFAULT_COLUMNS = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
];
const DEFAULT_ROWS = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
  { id: "2", name: "Alan Turing", email: "alan@example.com", role: "Editor" },
];
function DataTable(props: any) {
  return (
    <FacetComponents.DataTable
      {...props}
      columns={props.columns ?? DEFAULT_COLUMNS}
      data={props.data ?? DEFAULT_ROWS}
    />
  );
}

function Form(props: any) {
  const form = (FacetComponents as any).useForm({
    defaultValues: { name: "", email: "" },
  });
  const { form: _ignored, ...rest } = props;
  return <FacetComponents.Form form={form} {...rest} />;
}

const DEFAULT_TESTIMONIALS = [
  {
    quote: "The component library cut our ship time in half.",
    author: "Ada Lovelace",
    role: "CTO",
    initials: "A",
  },
  {
    quote: "Composable, themeable, and a joy to extend.",
    author: "Grace Hopper",
    role: "Engineer",
    initials: "G",
  },
];
function TestimonialShowcase(props: any) {
  return (
    <FacetComponents.TestimonialShowcase
      {...props}
      testimonials={props.testimonials ?? DEFAULT_TESTIMONIALS}
    />
  );
}

const DEFAULT_FAQ = [
  {
    q: "Is it framework agnostic?",
    a: "Yes. The core is dependency-free React.",
  },
  { q: "Can I theme it?", a: "Yes - every component is wired to the design token system." },
];
function FaqSection(props: any) {
  return (
    <FacetComponents.FaqSection {...props} items={props.items ?? DEFAULT_FAQ} />
  );
}

const DEFAULT_ACTIVITY = [
  { id: "1", title: "Ada signed in", icon: "log-in" },
  { id: "2", title: "Grace updated the billing", icon: "settings" },
];
function ActivityFeed(props: any) {
  return (
    <FacetComponents.ActivityFeed {...props} items={props.items ?? DEFAULT_ACTIVITY} />
  );
}

function InfiniteScroll(props: any) {
  const { hasMore, onLoadMore, loading, ...rest } = props;
  return (
    <FacetComponents.InfiniteScroll
      {...rest}
      hasMore={hasMore ?? true}
      onLoadMore={onLoadMore ?? noOp}
      loading={loading ?? false}
    />
  );
}

const DEFAULT_SECTIONS = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "security", label: "Security", icon: "shield" },
];
function AccountSettingsPanel(props: any) {
  return (
    <FacetComponents.AccountSettingsPanel
      {...props}
      sections={props.sections ?? DEFAULT_SECTIONS}
    />
  );
}

/* ── Headless hook-based demos ──────────────────────────── */

const DEMO_STEPPER_STEPS = [
  { id: "details", title: "Details" },
  { id: "payment", title: "Payment" },
  { id: "confirm", title: "Confirm" },
];
function StepperProviderWithDemo(props: any) {
  const demo = (FacetComponents as any).useStepper({ steps: DEMO_STEPPER_STEPS });
  return <FacetComponents.StepperProvider {...props} value={props.value ?? demo} />;
}

const DEMO_KANBAN_COLUMNS = [
  { id: "todo", title: "Todo", cards: [{ id: "1", title: "Task A" }] },
  { id: "done", title: "Done", cards: [] },
];
function KanbanBoardWithDemo(props: any) {
  const demo = (FacetComponents as any).useKanban({ columns: DEMO_KANBAN_COLUMNS });
  return <FacetComponents.KanbanBoard {...props} board={props.board ?? demo} />;
}

/* ── Public registry ──────────────────────────────────── */

/**
 * Registry consumed by the live playground(s). Spreads the entire
 * `@arcevo/facet-components` barrel, then layers in auth + layout components
 * (with demo context) and doc placeholders / demo-data wrappers.
 */
export const playgroundComponents: Record<string, React.ComponentType<any>> = {
  ...(FacetComponents as unknown as Record<string, React.ComponentType<any>>),

  // auth
  ArcProvider: ArcProviderWithDemo,
  SignIn,
  SignUp,
  Guard,

  // layout
  LayoutProvider: FacetLayout.LayoutProvider,
  ConsoleLayout,
  AuthLayout,
  LandingLayout: FacetLayout.LandingLayout,
  Sidebar,
  Topbar: FacetLayout.Topbar,

  // doc placeholders
  YourContent,
  YourApp,
  ProtectedPage,
  YourRoutes,
  ProfileForm,
  SecuritySettings,

  // demo-data wrappers (override barrel defaults)
  DataTable,
  Form,
  TestimonialShowcase,
  FaqSection,
  ActivityFeed,
  InfiniteScroll,
  AccountSettingsPanel,

  // headless hook-based wrappers
  StepperProvider: StepperProviderWithDemo,
  KanbanBoard: KanbanBoardWithDemo,
  // Prevent localStorage-dismissed AnnouncementBar from hiding the preview
  // once a visitor clicked the close button. A unique storageKey per instance
  // means dismissal never persists across remounts in the playground.
  AnnouncementBar: (props: any) => {
    const id = React.useId();
    return <FacetComponents.AnnouncementBar {...props} storageKey={`facet-announcement-preview${id}`} />;
  },
  // The usage snippet references a bare `password` variable; the playground
  // parser resolves it to undefined, and the component calls value.length.
  // Provide a sane demo value so the preview renders.
  PasswordStrengthMeter: (props: any) => (
    <FacetComponents.PasswordStrengthMeter {...props} value={props.value ?? "Str0ng!Pass"} />
  ),
};
