import * as React from "react";
import {
  Dropzone,
  QRCode,
  Marquee,
  Roadmap,
  ColorPicker,
  Form,
  FormField,
  useForm,
  Button,
  Input,
  DataTable,
  DatePicker,
  NumberInput,
  CountryCodeInput,
  ISO_COUNTRY_CODES,
  LocationPicker,
  DateInput,
  PasswordInput,
  InfiniteScroll,
  type RoadmapItem,
  type DataTableColumn,
} from "@fusorb/facet-components";

/**
 * Live demos for the "Ready to Use" docs pages. Each demo is a small,
 * self-contained example of one ready-to-use component.
 */

export function DropzoneDemo() {
  const [names, setNames] = React.useState<string[]>([]);
  return (
    <div className="not-prose space-y-3">
      <Dropzone
        label="Drop files to see them listed"
        hint="PDF, images, anything"
        onFiles={(files) => setNames(files.map((f) => f.name))}
      />
      {names.length > 0 && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {names.map((name) => (
            <li key={name} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ColorPickerDemo() {
  const [color, setColor] = React.useState("#6366f1");
  return (
    <div className="not-prose space-y-3">
      <ColorPicker
        value={color}
        onValueChange={setColor}
        label="Brand accent"
      />
      <p className="text-sm text-muted-foreground">Selected: {color}</p>
    </div>
  );
}

const QR_BRAND_MARK =
  "https://raw.githubusercontent.com/github/explore/main/topics/github/github.png";

export function QRCodeDemo() {
  const [position, setPosition] = React.useState<
    "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  >("center");
  return (
    <div className="not-prose space-y-6">
      <div className="flex flex-wrap items-end gap-6">
        <QRCode
          value="https://example.com"
          size={140}
          label="facet docs QR code"
        />
        <QRCode
          value="https://github.com/fusorb/facet"
          size={140}
          label="facet GitHub QR code"
        />
        <QRCode
          value="https://github.com/fusorb/facet"
          size={160}
          label="QR code with brand logo"
          logo={QR_BRAND_MARK}
          logoSize={36}
          logoPosition={position}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          Logo position:
        </span>
        {(
          [
            "center",
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ] as const
        ).map((pos) => (
          <button
            key={pos}
            type="button"
            onClick={() => setPosition(pos)}
            aria-pressed={position === pos}
            className={`rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors ${
              position === pos
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:bg-foreground/5"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Pass <code>logo</code> (any icon or brand image URL),{" "}
        <code>logoSize</code>, and <code>logoPosition</code> to embed a brand
        mark in the QR code.
      </p>
    </div>
  );
}

export function MarqueeDemo({
  variant = "loop",
}: {
  variant?: "loop" | "strip";
}) {
  const items = [
    "facet",
    "auth",
    "design tokens",
    "React 19",
    "Radix",
    "TypeScript",
  ];
  const content = items.map((label) => (
    <span
      key={label}
      className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground"
    >
      {label}
    </span>
  ));
  return (
    <div className="not-prose space-y-4">
      {variant === "strip" && (
        <p className="text-xs text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5">
            variant="strip"
          </code>{" "}
          -- continuous motion, no pause-on-hover by default.
        </p>
      )}
      <Marquee
        items={content}
        duration={18}
        variant={variant === "strip" ? "strip" : "loop"}
      />
    </div>
  );
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    title: "Auth presets",
    description: "Fintech, med, edu, enterprise",
    status: "done",
    date: "v1.0",
  },
  {
    title: "Passkey support",
    description: "WebAuthn across presets",
    status: "in-progress",
  },
  {
    title: "SAML/OIDC SSO",
    description: "Enterprise identity providers",
    status: "planned",
  },
  {
    title: "Collaborative canvas",
    description: "Multiplayer docs canvas",
    status: "planned",
    date: "later",
  },
];

export function RoadmapDemo() {
  return (
    <div className="not-prose">
      <Roadmap items={ROADMAP_ITEMS} />
    </div>
  );
}

interface FormValues {
  name: string;
  email: string;
}

export function FormDemo() {
  const form = useForm<FormValues>({ defaultValues: { name: "", email: "" } });
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <div className="not-prose max-w-md space-y-4">
      <Form
        form={form}
        onSubmit={(values) => setSent(`${values.name} <${values.email}>`)}
      >
        <FormField name="name" label="Name" required>
          <Input placeholder="Ada Lovelace" />
        </FormField>
        <FormField
          name="email"
          label="Email"
          required
          description="We never share it."
        >
          <Input placeholder="ada@example.com" type="email" />
        </FormField>
        <Button type="submit">Submit</Button>
      </Form>
      {sent && <p className="text-sm text-success">Submitted: {sent}</p>}
    </div>
  );
}

interface DemoRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
}

const DEMO_ROWS: DemoRow[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
  {
    id: "2",
    name: "Grace Hopper",
    email: "grace@example.com",
    role: "Engineer",
  },
  {
    id: "3",
    name: "Linus Torvalds",
    email: "linus@example.com",
    role: "Maintainer",
  },
  {
    id: "4",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "Scientist",
  },
  {
    id: "5",
    name: "Alan Turing",
    email: "alan@example.com",
    role: "Researcher",
  },
  {
    id: "6",
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    role: "Engineer",
  },
];

const DEMO_COLUMNS: DataTableColumn<DemoRow>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role", hidden: true, label: "Role" },
];

export function DataTableDemo() {
  const [rows, setRows] = React.useState(DEMO_ROWS);
  return (
    <div className="not-prose">
      <DataTable
        columns={DEMO_COLUMNS}
        data={rows}
        searchable
        exportable
        pagination
        pageSize={5}
        selectable
        exporters={[{ key: "json", label: "JSON", export: () => {} }]}
        actions={[
          {
            key: "delete",
            label: "Delete selected",
            destructive: true,
            action: (_rows, selected) => {
              const keys = new Set(selected.map((r) => r.id));
              setRows((prev) => prev.filter((r) => !keys.has(r.id)));
            },
          },
        ]}
      />
    </div>
  );
}

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date | null>(null);
  return (
    <div className="not-prose space-y-6">
      <div className="max-w-xs">
        <DatePicker label="Due date" value={date} onValueChange={setDate} />
      </div>
      <div className="max-w-md">
        <p className="mb-2 text-sm font-medium text-foreground">
          Horizontal scroll strip
        </p>
        <DatePicker
          label="Pick a day"
          scrollMode="horizontal"
          horizontalDays={14}
        />
      </div>
    </div>
  );
}

export function NumberInputDemo() {
  const [count, setCount] = React.useState<number | null>(0);
  const [currency, setCurrency] = React.useState("$");
  return (
    <div className="not-prose max-w-md space-y-6">
      <NumberInput
        label="Quantity"
        value={count}
        onValueChange={setCount}
        min={0}
        max={10}
      />
      <NumberInput
        label="Price"
        value={count}
        onValueChange={setCount}
        min={0}
        currency={currency}
        currencyPicker
        onCurrencyChange={(c) => setCurrency(c.symbol)}
      />
      <p className="text-sm text-muted-foreground">
        Selected: {currency}
        {count ?? "0"}
      </p>
    </div>
  );
}

export function CountryCodeInputDemo() {
  const [phone, setPhone] = React.useState({ country: "NG", number: "" });
  const [scope, setScope] = React.useState<"africa" | "world">("world");
  return (
    <div className="not-prose max-w-md space-y-6">
      <CountryCodeInput
        label="Mobile number"
        value={phone}
        onValueChange={setPhone}
        countries={ISO_COUNTRY_CODES}
        includeRegions={scope === "africa" ? ["africa"] : undefined}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setScope(scope === "africa" ? "world" : "africa")}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          {scope === "africa" ? "Show all regions" : "Africa only"}
        </button>
        <p className="text-sm text-muted-foreground">
          Dialed: {phone.country} {phone.number}
        </p>
      </div>
    </div>
  );
}

export function LocationPickerDemo() {
  const [location, setLocation] = React.useState<{
    country?: string;
    region?: string;
    locality?: string;
  }>({});
  return (
    <div className="not-prose max-w-md space-y-4">
      <LocationPicker
        value={location}
        onValueChange={setLocation}
        showLocality
        placeholders={{
          region: "Select state / region",
          locality: "Select LGA (optional)",
        }}
      />
      <p className="text-sm text-muted-foreground">
        Location:{" "}
        {[location.country, location.region, location.locality]
          .filter(Boolean)
          .join(" / ") || "not set"}
      </p>
      <p className="text-xs text-muted-foreground">
        The region label adapts to the country (state, county, province,
        emirate...), and every level has a search box to filter long lists.
      </p>
    </div>
  );
}

export function DateInputDemo() {
  const [date, setDate] = React.useState<string | null>("2026-03-05");
  return (
    <div className="not-prose max-w-md space-y-6">
      <DateInput label="Start date" value={date} onValueChange={setDate} />
      <p className="text-sm text-muted-foreground">
        Value: {date ?? "empty"} (ISO validated; invalid input reverts on blur)
      </p>
    </div>
  );
}

export function PasswordInputDemo() {
  const [password, setPassword] = React.useState("hunter2");
  return (
    <div className="not-prose max-w-md space-y-6">
      <PasswordInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">Value: {password}</p>
    </div>
  );
}

export function InfiniteScrollDemo() {
  const [items, setItems] = React.useState<string[]>(() =>
    Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`),
  );
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setItems((prev) => [
        ...prev,
        ...Array.from({ length: 10 }, (_, i) => `Item ${prev.length + i + 1}`),
      ]);
      setHasMore((prev) => prev && items.length < 60);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="not-prose max-w-md">
      <InfiniteScroll
        hasMore={hasMore}
        onLoadMore={loadMore}
        loading={loading}
        className="max-h-64 overflow-y-auto rounded-lg border border-border p-3"
      >
        <ul className="space-y-1 text-sm text-foreground">
          {items.map((item) => (
            <li key={item} className="rounded-md bg-muted/40 px-3 py-1.5">
              {item}
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
