/**
 * Usage snippets for the component gallery.
 *
 * Two layers:
 *  - `usageCode(slug)` returns a complete, copy-pasteable default example
 *    (import + render) for every manifest component. No placeholder
 *    `<X />` stubs.
 *  - `variantUsage(slug)` returns one labeled snippet per variant gallery
 *    cell (labels must match lib/variants.tsx), rendered as tabs on the
 *    component page. Components without a gallery fall back to the default
 *    usage snippet.
 */

/** PascalCase single-component name for a slug, with common overrides. */
function importName(slug: string): string {
  const overrides: Record<string, string> = {
    "input-otp": "InputOTP",
    "alert-dialog": "AlertDialog",
    "avatar-group": "AvatarGroup",
    "empty-state": "EmptyState",
    "toggle-group": "ToggleGroup",
    "context-menu": "ContextMenu",
    "navigation-menu": "NavigationMenu",
    "dropdown-menu": "DropdownMenu",
    "scroll-area": "ScrollArea",
    "button-group": "ButtonGroup",
    "radio-group": "RadioGroup",
    "hover-card": "HoverCard",
    "color-picker": "ColorPicker",
    "country-code-input": "CountryCodeInput",
    "date-picker": "DatePicker",
    "data-table": "DataTable",
    "number-input": "NumberInput",
    "location-picker": "LocationPicker",
    "notification-drawer": "NotificationDrawer",
  };
  if (overrides[slug]) return overrides[slug];
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Complete default usage snippets (import + a realistic example). Every
 * manifest component should appear here; anything missing falls back to a
 * generated import + a generic render.
 */
const USAGE: Record<string, string> = {
  button: `import { Button } from "@arcevo/facet-components";

function Example() {
  return <Button variant="default" size="lg">Get started</Button>;
}`,
  badge: `import { Badge } from "@arcevo/facet-components";
import { Sparkles, Check } from "lucide-react";

function Example() {
  return (
    <div className="flex gap-2">
      <Badge variant="success">Live</Badge>
      <Badge icon={<Sparkles size={12} />}>New</Badge>
      <Badge variant="success" iconOnly icon={<Check size={14} />} aria-label="Verified" />
    </div>
  );
}
`,
  pill: `import { Pill, PillGroup, PillTrigger } from "@arcevo/facet-components";

function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill>Default</Pill>
      <Pill color="primary">Primary</Pill>
      <Pill color="success" selected>
        Success
      </Pill>
      <Pill color="warning">Warning</Pill>
      <Pill color="destructive" removable onRemove={() => {}}>
        Dismissible
      </Pill>
      <PillGroup>
        <Pill>One</Pill>
        <Pill selected>Two</Pill>
        <PillTrigger>Clear all</PillTrigger>
      </PillGroup>
    </div>
  );
}
`,
  alert: `import { Alert, AlertTitle, AlertDescription } from "@arcevo/facet-components";

function Example() {
  return (
    <Alert variant="destructive">
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>Check your payment method and try again.</AlertDescription>
    </Alert>
  );
}`,
  card: `import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@arcevo/facet-components";

function Example() {
  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent>Card content</CardContent>
    </Card>
  );
}`,
  accordion: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@arcevo/facet-components";

function Example() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="a">
        <AccordionTrigger>Item A</AccordionTrigger>
        <AccordionContent>Content A</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}`,
  tabs: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@arcevo/facet-components";

function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account content</TabsContent>
      <TabsContent value="settings">Settings content</TabsContent>
    </Tabs>
  );
}`,
  dialog: `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Open</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}`,
  "alert-dialog": `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`,
  "confirm-alert-dialog": `import { ConfirmAlertDialog } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <ConfirmAlertDialog
      entityName="facet"
      entityLabel="workspace"
      confirmPhrase="confirm delete"
      actionLabel="Delete workspace"
      trigger={<Button variant="destructive">Delete workspace</Button>}
      onConfirm={() => console.log("deleted")}
    />
  );
}`,
  input: `import { Input } from "@arcevo/facet-components";

function Example() {
  return <Input placeholder="Type here..." />;
}`,
  checkbox: `import { Checkbox } from "@arcevo/facet-components";
import { Label } from "@arcevo/facet-components";

function Example() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms</Label>
    </div>
  );
}`,
  switch: `import { Switch } from "@arcevo/facet-components";
import { Label } from "@arcevo/facet-components";

function Example() {
  return (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  );
}`,
  progress: `import { Progress } from "@arcevo/facet-components";

function Example() {
  return <Progress value={60} />;
}`,
  spinner: `import { Spinner } from "@arcevo/facet-components";

function Example() {
  return <Spinner variant="primary" />;
}`,
  select: `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@arcevo/facet-components";

function Example() {
  return (
    <Select>
      <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Apple</SelectItem>
        <SelectItem value="b">Banana</SelectItem>
      </SelectContent>
    </Select>
  );
}`,
  slider: `import { Slider } from "@arcevo/facet-components";

function Example() {
  return <Slider defaultValue={[50]} max={100} step={1} />;
}`,
  "input-otp": `import { InputOTP, InputOTPGroup, InputOTPSlot } from "@arcevo/facet-components";

function Example() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}`,
  tooltip: `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild><Button variant="outline">Hover</Button></TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}`,
  avatar: `import { Avatar, AvatarImage, AvatarFallback } from "@arcevo/facet-components";

function Example() {
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src="https://i.pravatar.cc/64?img=5" alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  );
}`,
  "avatar-group": `import { AvatarGroup } from "@arcevo/facet-components";

function Example() {
  return (
    <AvatarGroup
      avatars={[
        { src: "https://i.pravatar.cc/64?img=1", alt: "Ada", fallback: "A" },
        { fallback: "B" },
        { fallback: "C" },
      ]}
    />
  );
}`,
  breadcrumb: `import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@arcevo/facet-components";

function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Docs</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}`,
  "button-group": `import { ButtonGroup } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <ButtonGroup>
      <Button size="sm">Left</Button>
      <Button size="sm">Middle</Button>
      <Button size="sm">Right</Button>
    </ButtonGroup>
  );
}`,
  collapsible: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@arcevo/facet-components";

function Example() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Collapsible content</CollapsibleContent>
    </Collapsible>
  );
}`,
  combobox: `import { Combobox } from "@arcevo/facet-components";

function Example() {
  return (
    <Combobox
      options={[
        { value: "o1", label: "Option 1" },
        { value: "o2", label: "Option 2" },
      ]}
      placeholder="Select..."
      label="Options"
    />
  );
}`,
  command: `import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@arcevo/facet-components";

function Example() {
  return (
    <Command className="w-72">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}`,
  "context-menu": `import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from "@arcevo/facet-components";

function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="rounded-md border border-dashed p-4">Right-click</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}`,
  "dropdown-menu": `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`,
  "empty-state": `import { EmptyState } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <EmptyState
      title="No documents"
      description="Create your first document to get started."
      action={<Button size="sm">New document</Button>}
    />
  );
}`,
  "hover-card": `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@ada</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <p className="text-sm font-semibold">Ada Lovelace</p>
        <p className="text-sm text-muted-foreground">Mathematician and writer.</p>
      </HoverCardContent>
    </HoverCard>
  );
}`,
  kbd: `import { Kbd, getModSymbol } from "@arcevo/facet-components";

function Example() {
  return <Kbd>{getModSymbol()}K</Kbd>;
}`,
  label: `import { Label } from "@arcevo/facet-components";

function Example() {
  return <Label htmlFor="email">Email</Label>;
}`,
  menubar: `import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSubTrigger, MenubarSubContent, MenubarShortcut } from "@arcevo/facet-components";

function Example() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Exit</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}`,
  navbar: `import { Navbar, ThemeProvider } from "@arcevo/facet-components";

function Example() {
  return (
    <ThemeProvider defaultTheme="system">
      <Navbar
        variant="sticky"
        brand={<span className="font-semibold">facet</span>}
        links={[
          { href: "#", label: "Features" },
          { href: "#", label: "Docs" },
        ]}
        showThemeToggle
      />
    </ThemeProvider>
  );
}`,
  "navigation-menu": `import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@arcevo/facet-components";

function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">Getting Started</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}`,
  pagination: `import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from "@arcevo/facet-components";

function Example() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}`,
  popover: `import { Popover, PopoverTrigger, PopoverContent } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent>Popover content</PopoverContent>
    </Popover>
  );
}`,
  "radio-group": `import { RadioGroup, RadioGroupItem } from "@arcevo/facet-components";
import { Label } from "@arcevo/facet-components";

function Example() {
  return (
    <RadioGroup defaultValue="a">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="ra" />
        <Label htmlFor="ra">Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="rb" />
        <Label htmlFor="rb">Option B</Label>
      </div>
    </RadioGroup>
  );
}`,
  "scroll-area": `import { ScrollArea, ScrollBar } from "@arcevo/facet-components";

function Example() {
  return (
    <ScrollArea className="h-32 w-72 rounded-md border p-3">
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i} className="py-0.5 text-sm">Line {i + 1}</p>
      ))}
      <ScrollBar />
    </ScrollArea>
  );
}`,
  separator: `import { Separator } from "@arcevo/facet-components";

function Example() {
  return (
    <div className="flex flex-col gap-2">
      <span>Above</span>
      <Separator />
      <span>Below</span>
    </div>
  );
}`,
  sheet: `import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@arcevo/facet-components";
import { Button } from "@arcevo/facet-components";

function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet</SheetTitle>
          <SheetDescription>Sheet content</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}`,
  skeleton: `import { Skeleton } from "@arcevo/facet-components";

function Example() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}`,
  sonner: `import { Toaster, toast } from "@arcevo/facet-components";

function Example() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Button onClick={() => toast.success("Saved successfully")}>Show toast</Button>
    </>
  );
}`,
  table: `import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@arcevo/facet-components";

function Example() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}`,
  textarea: `import { Textarea } from "@arcevo/facet-components";

function Example() {
  return <Textarea placeholder="Write something..." />;
}`,
  toggle: `import { Toggle } from "@arcevo/facet-components";

function Example() {
  return <Toggle aria-label="Bold">B</Toggle>;
}`,
  "toggle-group": `import { ToggleGroup, ToggleGroupItem } from "@arcevo/facet-components";

function Example() {
  return (
    <ToggleGroup type="single" defaultValue="a">
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
      <ToggleGroupItem value="c">C</ToggleGroupItem>
    </ToggleGroup>
  );
}`,
  dropzone: `import { Dropzone } from "@arcevo/facet-components";

function Example() {
  return (
    <Dropzone
      label="Drag files here or click to browse"
      hint="PDF, images, anything"
      onFiles={(files) => console.log(files)}
    />
  );
}`,
  "color-picker": `import { ColorPicker } from "@arcevo/facet-components";

function Example() {
  return <ColorPicker value="#6366f1" label="Brand accent" />;
}`,
  qrcode: `import { QRCode } from "@arcevo/facet-components";

function Example() {
  return <QRCode value="https://facet.arcevocirqle.com.ng" size={140} label="facet docs" />;
}

function Branded() {
  // Embed any icon or brand image: logo (URL), logoSize, logoPosition.
  return (
    <QRCode
      value="https://github.com/arcevodev/facet"
      size={160}
      logo="https://raw.githubusercontent.com/github/explore/main/topics/github/github.png"
      logoSize={36}
      logoPosition="center"
    />
  );
}`,
  marquee: `import { Marquee } from "@arcevo/facet-components";

function Example() {
  return (
    <Marquee
      items={["facet", "auth", "tokens", "React 19", "Radix"]}
      duration={18}
    />
  );
}`,
  roadmap: `import { Roadmap } from "@arcevo/facet-components";
import type { RoadmapItem } from "@arcevo/facet-components";

const items: RoadmapItem[] = [
  { title: "Auth presets", description: "Fintech, med, edu", status: "done", date: "v1.0" },
  { title: "Passkey support", description: "WebAuthn across presets", status: "in-progress" },
  { title: "SAML/OIDC SSO", description: "Enterprise identity providers", status: "planned" },
];

function Example() {
  return <Roadmap items={items} />;
}`,
  form: `import { Form, FormField, useForm } from "@arcevo/facet-components";
import { Button, Input } from "@arcevo/facet-components";

interface FormValues {
  name: string;
  email: string;
}

function Example() {
  const form = useForm<FormValues>({ defaultValues: { name: "", email: "" } });
  return (
    <Form form={form} onSubmit={(values) => console.log(values)}>
      <FormField name="name" label="Name" required>
        <Input placeholder="Ada Lovelace" />
      </FormField>
      <FormField name="email" label="Email" required>
        <Input placeholder="ada@example.com" type="email" />
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
}`,
  "data-table": `import { DataTable } from "@arcevo/facet-components";
import type { DataTableColumn } from "@arcevo/facet-components";

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumn<Row>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
];

const rows: Row[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
];

function Example() {
  return <DataTable columns={columns} data={rows} searchable pagination />;
}

function Toolbar() {
  // Export menu (CSV + custom formats) and a bulk-actions overflow menu:
  return (
    <DataTable
      columns={columns}
      data={rows}
      exportable
      exporters={[{ key: "json", label: "JSON", export: (cols, rows) => downloadJson(cols, rows) }]}
      actions={[
        {
          key: "delete",
          label: "Delete selected",
          destructive: true,
          action: (rows, selected) => onDelete(selected),
        },
      ]}
    />
  );
}

function Paged() {
  // Pagination footer includes a "Rows per page" selector (default 10/20/50):
  return (
    <DataTable
      columns={columns}
      data={rows}
      pagination
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
    />
  );
}`,
  "date-picker": `import { DatePicker } from "@arcevo/facet-components";

function Example() {
  return <DatePicker label="Due date" />;
}`,
  "number-input": `import { NumberInput, CURRENCIES } from "@arcevo/facet-components";

function Example() {
  return <NumberInput label="Quantity" min={0} max={10} />;
}

function Price() {
  // Built-in currency picker: hover/click to choose, pin via currency.
  return (
    <NumberInput
      label="Price"
      currency="$"
      currencyPicker
      onCurrencyChange={(c) => console.log(c.code)}
    />
  );
}

// Custom currency list:
// <NumberInput currencyPicker currencyOptions={[{ code: "XBT", symbol: "₿", name: "Bitcoin" }]} />`,
  "country-code-input": `import { CountryCodeInput, ISO_COUNTRY_CODES } from "@arcevo/facet-components";

function Example() {
  // Full ISO list, Africa only
  return (
    <CountryCodeInput
      label="Mobile number"
      countries={ISO_COUNTRY_CODES}
      includeRegions={["africa"]}
    />
  );
}`,
  "location-picker": `import { LocationPicker } from "@arcevo/facet-components";

function Example() {
  return <LocationPicker showLocality />;
}

// Standalone levels:
// import { CountryInput, StateInput, LGAInput } from "@arcevo/facet-components";
// <CountryInput value={c} onValueChange={setC} />
// <StateInput country={c} value={s} onValueChange={setS} />
// <LGAInput country={c} region={s} value={l} onValueChange={setL} />`,
  "date-input": `import { DateInput } from "@arcevo/facet-components";

function Example() {
  return <DateInput label="Start date" value="2026-03-05" />;
}`,
  "password-input": `import { PasswordInput } from "@arcevo/facet-components";

function Example() {
  return <PasswordInput label="Password" placeholder="••••••••" />;
}`,
  "mail-input": `import { MailInput } from "@arcevo/facet-components";

function Example() {
  return <MailInput placeholder="you@example.com" required />;
}`,
  "infinite-scroll": `import { InfiniteScroll } from "@arcevo/facet-components";

function Example() {
  return (
    <InfiniteScroll hasMore={hasMore} onLoadMore={loadMore} loading={loading}>
      {items}
    </InfiniteScroll>
  );
}`,
  "notification-drawer": `import { NotificationDrawer } from "@arcevo/facet-components";

function Example() {
  return (
    <NotificationDrawer
      notifications={[
        { id: "1", title: "New message", description: "Ada sent you a message", time: "2m", read: false, type: "info" },
      ]}
    />
  );
}`,
  "sign-in": `import { SignIn } from "@arcevo/facet-auth";
import { ArcProvider } from "@arcevo/facet-auth";

<ArcProvider client={client}>
  <SignIn config={fintechPreset} />
</ArcProvider>`,
  "console-layout": `import { ConsoleLayout, defaultLayoutPreset } from "@arcevo/facet-layout";

<ConsoleLayout config={defaultLayoutPreset} mode="full">
  <YourContent />
</ConsoleLayout>`,
  "auth-layout": `import { AuthLayout, fintechLayoutPreset } from "@arcevo/facet-layout";
import { SignIn, fintechPreset } from "@arcevo/facet-auth";

<AuthLayout config={fintechLayoutPreset}>
  <SignIn config={fintechPreset} />
</AuthLayout>

// Custom left panel: video, slideshow, Lottie, or anything else.
<AuthLayout
  config={fintechLayoutPreset}
  brandPanel={
    <div className="flex h-full items-center justify-center">
      <video src="/hero.mp4" className="h-full w-full object-cover" autoPlay muted loop />
    </div>
  }
>
  <SignIn config={fintechPreset} />
</AuthLayout>`,
  "landing-layout": `import { LandingLayout } from "@arcevo/facet-layout";
import { Navbar } from "@arcevo/facet-components";

<LandingLayout
  nav={<Navbar variant="pill" brand={brand} links={links} />}
  hero={<h1 className="text-5xl font-bold">Build faster</h1>}
  footer={<footer>© 2026</footer>}
>
  <section>Feature grid</section>
</LandingLayout>`,
  sidebar: `import { Sidebar, LayoutProvider, fintechLayoutPreset } from "@arcevo/facet-layout";

<LayoutProvider>
  <div className="flex">
    <Sidebar config={fintechLayoutPreset} />
    <main className="flex-1">Content</main>
  </div>
</LayoutProvider>`,
  topbar: `import { Topbar, LayoutProvider } from "@arcevo/facet-layout";

<LayoutProvider>
  <Topbar />
</LayoutProvider>`,
  animated: `import { Spotlight, Aurora, Beams, GridPattern, SparkleButton } from "@arcevo/facet-components";

// Hero section with animated layers under your content.
<div className="relative flex h-[60vh] items-center justify-center overflow-hidden">
  <Aurora className="absolute inset-0" />
  <Beams count={3} className="absolute inset-0" />
  <GridPattern className="absolute inset-0" />
  <Spotlight className="relative z-10">
    <h1 className="text-5xl font-bold">Build something great</h1>
  </Spotlight>
</div>

// CTA with a sparkle burst on click.
<SparkleButton label="Get started" />`,
  "animated-button": `import { AnimatedButton } from "@arcevo/facet-components";

// Pick an animation variant (shine default, sparkle, ripple, magnetic, none).
<AnimatedButton animation="sparkle">Get started</AnimatedButton>
<AnimatedButton animation="shine">Continue</AnimatedButton>
  <AnimatedButton animation="none">Plain button</AnimatedButton>
  <AnimatedButton animation="dissolve">Dissolve</AnimatedButton>

// Fully replace with your own component:
<AnimatedButton renderButton={(props) => <MyButton {...props} />}>Custom</AnimatedButton>

// Composed components use it too:
//   <BillingPage config={{ plans, ctaButton: { animation: "sparkle" } }} />
//   <FeedbackPage email="hi@x.com" submitButton={{ animation: "shine" }} />
//   <SignUp submitButton={{ animation: "sparkle" }} />`,
   "text-animations": `import { TypewriterText, BlurText, WaveText, FlipText, SplitText, FadeUpText, ShimmerText, GradientText, LetterSpacingText, CountUpText, DissolveText } from "@arcevo/facet-components";

// Cycle through phrases with a type/erase loop and a blinking caret.
<TypewriterText phrases={["one identity", "every door", "your key"]} />

// Each character fades in from a blur, staggered.
<BlurText text="Blur in" className="font-heading text-2xl font-bold" />

// Characters bob in a continuous wave.
<WaveText text="Wave hello" className="font-heading text-2xl font-bold" />

// Characters flip in sequentially.
<FlipText text="Flip it" className="font-heading text-2xl font-bold" />

// Words rise into place.
<SplitText text="Words rise into place" className="font-heading text-2xl font-bold" />

// The whole block fades + slides up on mount.
<FadeUpText text="Fade and slide" className="font-heading text-2xl font-bold" />

// A light sheen sweeps across the text.
<ShimmerText text="Shimmering headline" className="font-heading text-2xl font-extrabold" />

// An animated gradient fills the text.
<GradientText text="Animated gradient" className="font-heading text-2xl font-extrabold" />

// Letters expand on hover.
<LetterSpacingText text="Hover to expand" className="font-heading text-2xl font-bold" />

// Counts up to a number on mount.
<CountUpText to={64000} separator className="font-heading text-2xl font-bold" />

// Each character dissolves in, staggered.
<DissolveText text="Dissolve in" className="font-heading text-2xl font-bold" />`,
  "micro-interactions": `import { TiltCard, GlowCard, RippleButton, MagneticButton, ShineButton, ScrollReveal, DissolveButton } from "@arcevo/facet-components";

// A card that tilts toward the cursor in 3D.
<TiltCard maxTilt={10} className="w-64 rounded-xl border p-6">
  Move your cursor over me
</TiltCard>

// A card with a cursor-following glow.
<GlowCard color="var(--primary)" className="w-64 rounded-xl border p-6">
  A glow follows your cursor
</GlowCard>

// A button that ripples on click.
<RippleButton className="rounded-md bg-primary px-6 py-2 text-primary-foreground">
  Click me
</RippleButton>

// A button that gravitates toward the cursor.
<MagneticButton strength={16} className="rounded-md bg-primary px-6 py-2 text-primary-foreground">
  Magnetic
</MagneticButton>

// A button with a light sweep on hover.
<ShineButton className="rounded-md bg-primary px-6 py-2 text-primary-foreground">
  Shine on hover
</ShineButton>

// Reveals children as they scroll into view.
<ScrollReveal delay={100}>
  <Card>Revealed on scroll</Card>
</ScrollReveal>

// A button that emits particles on click.
<DissolveButton className="rounded-md bg-primary px-6 py-2 text-primary-foreground">
  Dissolve
</DissolveButton>`,
  footer: `import { Footer } from "@arcevo/facet-components";

<Footer
  brand={{ name: "facet", tagline: "The Arcevo UI system" }}
  columns={[
    { title: "Product", links: [{ label: "Components", href: "/components" }] },
    { title: "Resources", links: [{ label: "Docs", href: "/docs" }] },
  ]}
  socials={[{ label: "GitHub", href: "https://github.com/arcevodev", icon: "github" }]}
  bottomLinks={[{ label: "Feedback", href: "/feedback" }]}
  legal={\`© \${new Date().getFullYear()} facet. MIT License.\`}
/>

// Use variant="streamline" for a clean grid, how-it-works steps, and
// research notices (modeled after the stream-wise footer pattern).
// <Footer variant="streamline" brand={{ name: "facet" }} columns={[]} steps={[]} notices={[]} />`,
  "feedback-page": `import { FeedbackPage } from "@arcevo/facet-components";

<FeedbackPage
  title="Feedback & contact"
  description="Found a bug? Want a feature? We read everything."
  email="hello@arcevo.com"
  back={{ onClick: () => history.back() }}
  channels={[
    { label: "WhatsApp", href: "https://wa.me/123456", icon: "message-circle", description: "Chat with us" },
    { label: "LinkedIn", href: "https://linkedin.com/company/arcevo", icon: "linkedin", description: "Company page" },
  ]}
/>`,
  "not-found": `import { NotFound } from "@arcevo/facet-components";

<NotFound
  title="Page not found"
  description="The page you're looking for doesn't exist or has been moved."
  actionLabel="Go back home"
  actionHref="/"
  animation="gradient"
/>

// animation: "shimmer" | "aurora" | "none"
// Pass \`children\` to fully override the 404 / title / description / CTA block.`,
  "billing-page": `import { BillingPage } from "@arcevo/facet-components";
import type { BillingPlan } from "@arcevo/facet-components";

const plans: BillingPlan[] = [
  { id: "free", name: "Free", price: 0, features: ["1 project", "Community support"] },
  { id: "pro", name: "Pro", price: 19, highlight: true, discounts: { quarterly: 30, yearly: 16.67 }, features: ["Unlimited projects", "Priority support", "Advanced analytics"] },
  { id: "enterprise", name: "Enterprise", price: 0, customPriceLabel: "Custom", features: ["SSO/SAML", "Dedicated support", "SLA"] },
];

function Example() {
  return (
    <BillingPage
      config={{
        plans,
        title: "Pricing",
        description: "Simple, transparent pricing. Cancel anytime.",
        annualDiscountNote: "Save up to 30% with quarterly · ~16% with yearly",
      }}
    />
  );
}`,
  "billing-page-table": `import { BillingPageTable } from "@arcevo/facet-components";
import type { BillingPlan } from "@arcevo/facet-components";

const plans: BillingPlan[] = [
  { id: "free", name: "Free", price: 0, features: [] },
  { id: "pro", name: "Pro", price: 19, highlight: true, features: [] },
  { id: "enterprise", name: "Enterprise", price: 0, customPriceLabel: "Custom", features: [] },
];

function Example() {
  return (
    <BillingPageTable
      config={{ plans, title: "Compare plans" }}
      rows={[
        { label: "Projects", supports: { free: true, pro: true, enterprise: true } },
        { label: "SSO", supports: { free: false, pro: true, enterprise: true } },
        { label: "Audit log", supports: { free: false, pro: "7 days", enterprise: true } },
      ]}
    />
  );
}`,
  "billing-page-freemium": `import { BillingPageFreemium } from "@arcevo/facet-components";
import type { BillingPlan } from "@arcevo/facet-components";

const plans: BillingPlan[] = [
  { id: "free", name: "Free", price: 0, features: ["1 project", "Community support"] },
  { id: "pro", name: "Pro", price: 19, highlight: true, features: ["Unlimited projects", "Priority support"] },
  { id: "team", name: "Team", price: 49, features: ["Everything in Pro", "SSO/SAML"] },
];

function Example() {
  return (
    <BillingPageFreemium
      config={{ plans, title: "Start free, scale when you're ready" }}
      heroPlanId="pro"
    />
  );
}`,
  "card-animations": `import { FlipCard, DissolveCard } from "@arcevo/facet-components";

function Example() {
  return (
    <FlipCard
      className="w-64"
      front={<div>Front</div>}
      back={<div>Back</div>}
    />
  );
}

// A card that dissolves in on mount.
<DissolveCard className="w-64 rounded-xl border p-6">
  Dissolve in
</DissolveCard>`,
  "otp-verification-card": `import { OtpVerificationCard } from "@arcevo/facet-components";

function Example() {
  return <OtpVerificationCard onVerify={async (code) => validate(code)} />;
}`,
  "two-factor-setup-panel": `import { TwoFactorSetupPanel } from "@arcevo/facet-components";

function Example() {
  return (
    <TwoFactorSetupPanel
      otpauthUri="otpauth://totp/Example:ada@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
      secret="JBSWY3DPEHPK3PXP"
      onConfirm={async (code) => confirm(code)}
      recoveryCodes={["1111 2222", "3333 4444", "5555 6666", "7777 8888"]}
    />
  );
}`,
  "password-strength-meter": `import { PasswordStrengthMeter } from "@arcevo/facet-components";

function Example() {
  return <PasswordStrengthMeter value={password} />;
}`,
  "api-key-manager": `import { ApiKeyManager } from "@arcevo/facet-components";

function Example() {
  return (
    <ApiKeyManager
      keys={keys}
      onCreate={async ({ name, scope }) => createKey(name, scope)}
      onRevoke={async (id) => revokeKey(id)}
    />
  );
}`,
  "invite-team-form": `import { InviteTeamForm } from "@arcevo/facet-components";

function Example() {
  return <InviteTeamForm onInvite={async (invitees) => sendInvites(invitees)} />;
}`,
  "account-settings-panel": `import { AccountSettingsPanel } from "@arcevo/facet-components";

const sections = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "security", label: "Security", icon: "shield" },
];

function Example() {
  return (
    <AccountSettingsPanel
      sections={sections}
      content={{
        profile: <ProfileForm />,
        security: <SecuritySettings />,
      }}
    />
  );
}`,
  "security-section-card": `import { SecuritySectionCard } from "@arcevo/facet-components";

const features = [
  { id: "mfa", title: "Two-factor authentication", description: "Protect your account", icon: "lock" },
  { id: "passkeys", title: "Passkeys", description: "Passwordless sign-in", icon: "key" },
];

function Example() {
  return <SecuritySectionCard features={features} onSelect={(f) => open(f.id)} />;
}`,
  "announcement-bar": `import { AnnouncementBar } from "@arcevo/facet-components";

function Example() {
  return (
    <AnnouncementBar storageKey="my-announcement">
      New: read the changelog
    </AnnouncementBar>
  );
}`,
  "cookie-consent": `import { CookieConsent } from "@arcevo/facet-components";

function Example() {
  return (
    <CookieConsent
      onDecision={(choice) => track(choice)}
      details={<a href="/privacy">Read our privacy policy</a>}
    />
  );
}`,
  "testimonial-showcase": `import { TestimonialShowcase } from "@arcevo/facet-components";

const testimonials = [
  { quote: "The auth forms saved us weeks.", author: "Ada", role: "CTO", initials: "A" },
  { quote: "Composable and themeable.", author: "Grace", role: "Engineer", initials: "G" },
];

function Example() {
  return <TestimonialShowcase testimonials={testimonials} mode="grid" />;
}`,
  "faq-section": `import { FaqSection } from "@arcevo/facet-components";

const items = [
  { q: "Is it framework agnostic?", a: "Yes. The core is dependency-free React." },
];

function Example() {
  return <FaqSection items={items} title="FAQ" />;
}`,
  "page-header": `import { PageHeader } from "@arcevo/facet-components";

function Example() {
  return (
    <PageHeader
      title="Profile settings"
      description="Manage your account."
      crumbs={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
      actions={<Button>Save</Button>}
    />
  );
}`,
  "stat-card": `import { StatCard } from "@arcevo/facet-components";

function Example() {
  return <StatCard label="Monthly revenue" value="$48,290" delta={12.4} hint="vs last month" />;
}`,
  "activity-feed": `import { ActivityFeed } from "@arcevo/facet-components";

const items = [
  { id: "1", title: "Ada signed in", timestamp: new Date().toISOString(), icon: "log-in" },
];

function Example() {
  return <ActivityFeed items={items} />;
}`,
  "aspect-ratio": `import { AspectRatio } from "@arcevo/facet-components";

function Example() {
  return (
    <AspectRatio ratio={16 / 9} className="w-full max-w-md">
      <img src="https://placehold.co/640x360" alt="..." className="h-full w-full object-cover" />
    </AspectRatio>
  );
}`,
  "resizable": `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@arcevo/facet-components";

function Example() {
  return (
    <ResizablePanelGroup>
      <ResizablePanel defaultSize={50}>
        <div className="flex h-40 w-full items-center justify-center border-r bg-muted">
          Panel 1
        </div>
      </ResizablePanel>
      {/* Orientation is auto-inferred from the parent group */}
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="flex h-40 w-full items-center justify-center border bg-muted">
          Panel 2
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}`,

  /* ── Phase 1+ components that were missing usage snippets ────────── */

  carousel: `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@arcevo/facet-components";

function Example() {
  return (
    <Carousel className="max-w-xs">
      <CarouselContent>
        <CarouselItem>
          <div className="p-1">1</div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">2</div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">3</div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}`,

  chart: `import { Chart } from "@arcevo/facet-components";

function Example() {
  return (
    <Chart
      x={["Mon", "Tue", "Wed", "Thu", "Fri"]}
      series={[
        { id: "sales", label: "Sales", data: [30, 80, 50, 60, 90] },
        { id: "orders", label: "Orders", data: [40, 60, 70, 30, 50] },
      ]}
      curve="smooth"
      showCrosshair
    />
  );
}

/* Pie: type="pie" or type="donut" */
/* Bar: type="bar" layout="horizontal" for horizontal bars */
/* Composed: each series gets its own type="line" | "bar" | "area" */
/* Stacked: stacked prop */`,

  drawer: `import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@arcevo/facet-components";

function Example() {
  return (
    <Drawer>
      <DrawerTrigger>Open drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <button>Confirm</button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}`,

  stepper: `import {
  StepperProvider,
  StepperNav,
  StepperPanel,
  useStepper,
} from "@arcevo/facet-components";

const stepper = useStepper({
  steps: [
    { id: "details", title: "Details" },
    { id: "payment", title: "Payment" },
    { id: "confirm", title: "Confirm" },
  ],
});

function Example() {
  return (
    <StepperProvider value={stepper}>
      <StepperNav />
      <StepperPanel />
    </StepperProvider>
  );
}`,

  tree: `import { Tree } from "@arcevo/facet-components";

function Example() {
  return (
    <Tree
      nodes={[
        { id: "1", label: "Dashboard" },
        {
          id: "2",
          label: "Settings",
          children: [
            { id: "3", label: "Profile" },
            { id: "4", label: "Security" },
          ],
        },
      ]}
    />
  );
}`,

  "changelog-list": `import { ChangelogList } from "@arcevo/facet-components";

function Example() {
  return (
    <ChangelogList
      releases={[
        {
          version: "1.2.0",
          date: "2026-08-12",
          changes: [
            { kind: "added", text: "Stepper component" },
            { kind: "fixed", text: "Navbar hover blink" },
          ],
        },
      ]}
    />
  );
}`,

  "consent-capture": `import { ConsentCapture } from "@arcevo/facet-components";

function Example() {
  return (
    <ConsentCapture
      title="Terms of Service"
      body={<p>By accepting you agree to our terms and conditions.</p>}
      onSubmit={() => {}}
    />
  );
}`,

  "cookie-banner": `import { CookieBanner } from "@arcevo/facet-components";

function Example() {
  return <CookieBanner onChoose={() => {}} />;
}`,

  "data-table-page": `import { DataTablePage } from "@arcevo/facet-components";

function Example() {
  return (
    <DataTablePage
      title="Users"
      columns={[
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
      ]}
      rows={[
        { name: "Alice", email: "alice@acme.com" },
        { name: "Bob", email: "bob@acme.com" },
      ]}
    />
  );
}`,

  "date-range-picker": `import { DateRangePicker } from "@arcevo/facet-components";

function Example() {
  return <DateRangePicker />;
}`,

  "empty-state-page": `import { EmptyStatePage } from "@arcevo/facet-components";

function Example() {
  return (
    <EmptyStatePage
      title="No projects yet"
      description="Get started by creating your first project."
    />
  );
}`,

  "glow-border-card": `import { GlowBorderCard } from "@arcevo/facet-components";

function Example() {
  return (
    <GlowBorderCard className="p-6">
      <p>Glow Border Card</p>
    </GlowBorderCard>
  );
}`,

  "input-group": `import { Input, InputGroup, InputGroupAddon } from "@arcevo/facet-components";

function Example() {
  return (
    <InputGroup>
      <InputGroupAddon>@</InputGroupAddon>
      <Input type="email" placeholder="you@acme.com" />
    </InputGroup>
  );
}`,

  "kanban-board": `import { KanbanBoard, useKanban } from "@arcevo/facet-components";

const board = useKanban({
  columns: [
    { id: "todo", title: "Todo", cards: [{ id: "1", title: "Task A" }] },
    { id: "done", title: "Done", cards: [] },
  ],
});

function Example() {
  return <KanbanBoard board={board} />;
}`,

  "mention-input": `import { MentionInput } from "@arcevo/facet-components";

function Example() {
  return (
    <MentionInput
      value="@alice hello"
      onChange={() => {}}
      users={[{ id: "1", name: "Alice", handle: "alice" }]}
    />
  );
}`,

  "multi-combobox": `import { MultiCombobox } from "@arcevo/facet-components";

function Example() {
  return (
    <MultiCombobox
      options={[
        { id: "react", label: "React" },
        { id: "vue", label: "Vue" },
        { id: "svelte", label: "Svelte" },
      ]}
      value={["react"]}
      onChange={() => {}}
    />
  );
}`,

  "otp-input": `import { OtpInput } from "@arcevo/facet-components";

function Example() {
  return <OtpInput value="123456" onChange={() => {}} />;
}`,

  "phone-input": `import { PhoneInput } from "@arcevo/facet-components";

function Example() {
  return <PhoneInput value="+14155552671" onChange={() => {}} />;
}`,

  "pricing-comparison": `import { PricingComparison } from "@arcevo/facet-components";

function Example() {
  return (
    <PricingComparison
      tiers={[
        {
          id: "free",
          name: "Free",
          price: "$0",
          features: { "Unlimited projects": false, "5 users": false },
        },
        {
          id: "pro",
          name: "Pro",
          price: "$19",
          features: { "Unlimited projects": true, "5 users": true },
          highlighted: true,
        },
      ]}
      features={[
        { name: "Unlimited projects", values: { free: "✓", pro: true } },
        { name: "5 users", values: { free: false, pro: true } },
      ]}
    />
  );
}`,

  "qr-scanner": `import { QrScanner } from "@arcevo/facet-components";

function Example() {
  return <QrScanner onScan={(result) => console.log(result)} autoStart={false} />;
}`,

  "range-slider": `import { RangeSlider } from "@arcevo/facet-components";

function Example() {
  return <RangeSlider value={[25, 75]} onChange={() => {}} min={0} max={100} />;
}`,

  "rating-input": `import { RatingInput } from "@arcevo/facet-components";

function Example() {
  return <RatingInput value={4} onChange={() => {}} />;
}`,

  "rich-text-editor": `import { RichTextEditor } from "@arcevo/facet-components";

function Example() {
  return <RichTextEditor value="<p>Hello world</p>" onChange={() => {}} />;
}`,

  "shine-border-card": `import { ShineBorderCard } from "@arcevo/facet-components";

function Example() {
  return (
    <ShineBorderCard className="p-6">
      <p>Shine Border Card</p>
    </ShineBorderCard>
  );
}`,

  "tag-input": `import { TagInput } from "@arcevo/facet-components";

function Example() {
  return <TagInput value={["react", "typescript"]} onChange={() => {}} />;
}`,

  "wizard-form-page": `import { WizardFormPage, Input } from "@arcevo/facet-components";

function Example() {
  return (
    <WizardFormPage
      steps={[
        { id: "account", title: "Account", fields: ["email", "password"] },
        { id: "profile", title: "Profile", fields: ["name"] },
      ]}
      defaultValues={{ email: "", password: "", name: "" }}
      renderField={(name) => <Input />}
      onSubmit={(data) => console.log(data)}
    />
  );
}`,
};

/** Minimal import + usage snippet for a component slug. */
export function usageCode(slug: string): string {
  if (USAGE[slug]) return USAGE[slug];
  const name = importName(slug);
  return `import { ${name} } from "@arcevo/facet-components";

function Example() {
  return <${name} />;
}`;
}

/** lucide icon components that can appear inside facet usage snippets. */
const LUCIDE_ICONS = new Set([
  "Sparkles",
  "Check",
  "Sun",
  "Moon",
  "ArrowRight",
  "Copy",
  "Paste",
  "Users",
  "Settings",
  "Search",
  "ShieldAlert",
  "ChevronDown",
  "ChevronLeft",
  "ChevronRight",
  "Bell",
  "Menu",
  "Grid",
  "List",
  "Plus",
  "Trash",
  "Edit",
  "X",
]);

/** Placeholder JSX names in snippets that are NOT real imports (e.g.
 *  `<YourContent />`, `<ProtectedPage />`): the reader replaces these
 *  with their own components. */
const PLACEHOLDER_COMPONENTS = new Set([
  "YourContent",
  "ProtectedPage",
  "YourApp",
  "YourRoutes",
]);

/** Capitalized JSX element names used in a snippet (component names / icons).
 *  Only captures identifiers that appear as `<Name`, `</Name`: text content
 *  like "Glass" is ignored. */
function identifiersIn(code: string): string[] {
  const found = new Set<string>();
  for (const m of code.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)) {
    const name = m[1];
    if (name) found.add(name);
  }
  return [...found];
}

/** Whether a name appears as a JSX tag OR a bare identifier in the snippet
 *  (catches lowercase preset values like `fintechPreset` too). */
function usesName(code: string, name: string): boolean {
  if (identifiersIn(code).includes(name)) return true;
  return new RegExp(`\\b${name}\\b`).test(code);
}

/** Per-variant usage snippet for a slug. Returns { label, code } entries in
 *  gallery order, falling back to a single "Default" tab. */
export function variantUsage(slug: string): { label: string; code: string }[] {
  const variants = VARIANT_USAGE[slug];
  if (!variants) return [{ label: "Default", code: usageCode(slug) }];
  const pkg = PACKAGE_BY_SLUG[slug];
  const packageImports = PACKAGE_IMPORTS[slug];
  const extraPackages = EXTRA_PACKAGE_IMPORTS[slug];
  const extraImports = (code: string) => {
    const ids = identifiersIn(code);
    const parts: string[] = [];
    // Components that belong to a non-components package (auth/layout).
    const knownPkgIds = new Set<string>(packageImports ?? []);
    for (const names of Object.values(extraPackages ?? {})) names.forEach((n) => knownPkgIds.add(n));
    if (pkg && packageImports) {
      const used = packageImports.filter((c) => usesName(code, c));
      if (used.length > 0) parts.push(`import { ${used.join(", ")} } from "${pkg}";`);
    }
    // Extra cross-package imports (e.g. SignIn from facet-auth).
    if (extraPackages) {
      for (const [extraPkg, names] of Object.entries(extraPackages)) {
        const used = names.filter((c) => usesName(code, c));
        if (used.length > 0) parts.push(`import { ${used.join(", ")} } from "${extraPkg}";`);
      }
    }
    // Anything else capitalized is a facet component (Button, Label, ...)
    // or a lucide icon (Copy, Settings, ...).
    const facet = ids.filter(
      (id) => !knownPkgIds.has(id) && !LUCIDE_ICONS.has(id) && !PLACEHOLDER_COMPONENTS.has(id),
    );
    if (facet.length > 0) parts.push(`import { ${facet.join(", ")} } from "@arcevo/facet-components";`);
    const icons = ids.filter((id) => LUCIDE_ICONS.has(id));
    if (icons.length > 0) parts.push(`import { ${icons.join(", ")} } from "lucide-react";`);
    return parts.join("\n");
  };
  return Object.entries(variants).map(([label, code]) => ({
    label,
    code: `${extraImports(code)}
function Example() {
  return ${code};
}`,
  }));
}

/**
 * Per-variant usage snippets, keyed by slug then variant label (labels must
 * match the gallery cells in lib/variants.tsx). Components with meaningful
 * per-variant code get tabs; the rest fall back to a single "Default" tab
 * showing the base usage snippet.
 */
const VARIANT_USAGE: Record<string, Record<string, string>> = {
  "aspect-ratio": {
    "16:9": `<AspectRatio ratio={16 / 9}>
  <img src="https://placehold.co/600x400" alt="..." className="h-full w-full object-cover" />
</AspectRatio>`,
    "1:1": `<AspectRatio ratio={1}>
  <img src="https://placehold.co/400x400" alt="..." className="h-full w-full object-cover" />
</AspectRatio>`,
    "4:3": `<AspectRatio ratio={4 / 3}>
  <img src="https://placehold.co/600x450" alt="..." className="h-full w-full object-cover" />
</AspectRatio>`,
    "21:9": `<AspectRatio ratio={21 / 9}>
  <img src="https://placehold.co/600x286" alt="..." className="h-full w-full object-cover" />
</AspectRatio>`,
    "3:4": `<AspectRatio ratio={3 / 4}>
  <img src="https://placehold.co/400x533" alt="..." className="h-full w-full object-cover" />
</AspectRatio>`,
  },
  resizable: {
    horizontal: `<ResizablePanelGroup className="h-64">
  <ResizablePanel defaultSize={50}>
    <div className="flex h-40 w-full items-center justify-center border-r bg-muted">
      Panel 1
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel>
    <div className="flex h-40 w-full items-center justify-center border bg-muted">
      Panel 2
    </div>
  </ResizablePanel>
</ResizablePanelGroup>`,
    vertical: `<ResizablePanelGroup orientation="vertical" className="h-64">
  <ResizablePanel defaultSize={50}>
    <div className="flex h-40 w-full items-center justify-center border-b bg-muted">
      Panel 1
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel>
    <div className="flex h-40 w-full items-center justify-center border bg-muted">
      Panel 2
    </div>
  </ResizablePanel>
</ResizablePanelGroup>`,
  },
  button: {
    default: `<Button variant="default">Button</Button>`,
    secondary: `<Button variant="secondary">Button</Button>`,
    destructive: `<Button variant="destructive">Delete</Button>`,
    outline: `<Button variant="outline">Button</Button>`,
    ghost: `<Button variant="ghost">Button</Button>`,
    link: `<Button variant="link">Link</Button>`,
    glass: `<Button variant="glass">Glass</Button>`,
    glow: `<Button variant="glow">Glow</Button>`,
  },
  badge: {
    default: `<Badge>Default</Badge>`,
    secondary: `<Badge variant="secondary">Secondary</Badge>`,
    outline: `<Badge variant="outline">Outline</Badge>`,
    success: `<Badge variant="success">Live</Badge>`,
    warning: `<Badge variant="warning">Warning</Badge>`,
    destructive: `<Badge variant="destructive">Error</Badge>`,
    "with icon": `<Badge icon={<Sparkles className="size-3" />}>New</Badge>`,
    "icon only": `<Badge variant="success" iconOnly icon={<Check className="size-3.5" />} aria-label="Verified" />`,
  },
  pill: {
    default: `<Pill>Default</Pill>`,
    outline: `<Pill variant="outline">Outline</Pill>`,
    filled: `<Pill variant="filled">Filled</Pill>`,
    primary: `<Pill color="primary">Primary</Pill>`,
    success: `<Pill color="success">Success</Pill>`,
    warning: `<Pill color="warning">Warning</Pill>`,
    destructive: `<Pill color="destructive">Error</Pill>`,
    selected: `<Pill selected>Selected</Pill>`,
    removable: `<Pill removable onRemove={() => {}}>Tag</Pill>`,
  },
  alert: {
    Default: `<Alert>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Default alert</AlertDescription>
</Alert>`,
    Destructive: `<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Destructive alert</AlertDescription>
</Alert>`,
    Success: `<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Success alert</AlertDescription>
</Alert>`,
    Warning: `<Alert variant="warning">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Warning alert</AlertDescription>
</Alert>`,
  },
  card: {
    default: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
    glass: `<Card variant="glass">
  <CardHeader>
    <CardTitle>Glass</CardTitle>
    <CardDescription>Frosted surface.</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
    frost: `<Card variant="frost">
  <CardHeader>
    <CardTitle>Frost</CardTitle>
    <CardDescription>Frosted glass surface.</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
    glow: `<Card variant="glow">
  <CardHeader>
    <CardTitle>Glow</CardTitle>
    <CardDescription>Glowing surface.</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
    ghost: `<Card variant="ghost">
  <CardHeader>
    <CardTitle>Ghost</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
    outline: `<Card variant="outline">
  <CardHeader>
    <CardTitle>Outline</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
    elevated: `<Card variant="elevated">
  <CardHeader>
    <CardTitle>Elevated</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
    interactive: `<Card variant="interactive">
  <CardHeader>
    <CardTitle>Interactive</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>`,
  },
  spinner: {
    Default: `<Spinner />`,
    Primary: `<Spinner variant="primary" />`,
    Muted: `<Spinner variant="muted" />`,
    Small: `<Spinner size="sm" />`,
    Large: `<Spinner size="lg" />`,
  },
  switch: {
    Off: `<Switch />`,
    On: `<Switch checked />`,
    Disabled: `<Switch disabled />`,
  },
  toggle: {
    Default: `<Toggle>Bold</Toggle>`,
    Outline: `<Toggle variant="outline">Italic</Toggle>`,
    "With icon": `<Toggle aria-label="Settings">
  <Settings className="size-4" /> Settings
</Toggle>`,
  },
  "toggle-group": {
    Single: `<ToggleGroup type="single" defaultValue="a">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
</ToggleGroup>`,
    Multiple: `<ToggleGroup type="multiple" defaultValue={["a"]}>
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
</ToggleGroup>`,
    Outline: `<ToggleGroup type="single" variant="outline" defaultValue="a">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
</ToggleGroup>`,
  },
  tabs: {
    Default: `<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">A</TabsTrigger>
    <TabsTrigger value="b">B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Content A</TabsContent>
  <TabsContent value="b">Content B</TabsContent>
</Tabs>`,
    "Three tabs": `<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
</Tabs>`,
  },
  accordion: {
    Default: `<Accordion type="single" collapsible>
  <AccordionItem value="a">
    <AccordionTrigger>Item A</AccordionTrigger>
    <AccordionContent>Content A</AccordionContent>
  </AccordionItem>
</Accordion>`,
    Multiple: `<Accordion type="multiple">
  <AccordionItem value="a">
    <AccordionTrigger>Item A</AccordionTrigger>
    <AccordionContent>Content A</AccordionContent>
  </AccordionItem>
</Accordion>`,
    Separated: `<Accordion type="single" collapsible>
  <AccordionItem variant="separated" value="a">
    <AccordionTrigger>Item A</AccordionTrigger>
    <AccordionContent>Content A</AccordionContent>
  </AccordionItem>
</Accordion>`,
    Ghost: `<Accordion type="single" collapsible>
  <AccordionItem variant="ghost" value="a">
    <AccordionTrigger>Item A</AccordionTrigger>
    <AccordionContent>Content A</AccordionContent>
  </AccordionItem>
</Accordion>`,
    Compact: `<Accordion type="single" collapsible>
  <AccordionItem variant="compact" value="a">
    <AccordionTrigger>Item A</AccordionTrigger>
    <AccordionContent>Content A</AccordionContent>
  </AccordionItem>
</Accordion>`,
    Nested: `<Accordion type="single" collapsible>
  <AccordionItem value="parent">
    <AccordionTrigger>Parent</AccordionTrigger>
    <AccordionContent>
      <AccordionItem variant="nested" value="child">
        <AccordionTrigger>Child</AccordionTrigger>
        <AccordionContent>Deep content</AccordionContent>
      </AccordionItem>
    </AccordionContent>
  </AccordionItem>
</Accordion>`,
  },
  "alert-dialog": {
    Default: `<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Delete account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
    Destructive: `<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Revoke access</Button>
  </AlertDialogTrigger>
  <AlertDialogContent variant="destructive">
    <AlertDialogHeader>
      <AlertDialogTitle>Revoke API access?</AlertDialogTitle>
      <AlertDialogDescription>This will invalidate all tokens immediately.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep access</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Revoke</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
    "Confirm by typing": `<ConfirmAlertDialog
  entityName="facet"
  entityLabel="workspace"
  confirmPhrase="confirm delete"
  actionLabel="Delete workspace"
  trigger={<Button variant="destructive">Delete workspace</Button>}
  onConfirm={() => console.log("deleted")}
/>`,
  },
  "button-group": {
    Default: `<ButtonGroup>
  <Button size="sm">Left</Button>
  <Button size="sm">Middle</Button>
  <Button size="sm">Right</Button>
</ButtonGroup>`,
    Joined: `<ButtonGroup joined>
  <Button size="sm">Left</Button>
  <Button size="sm">Middle</Button>
  <Button size="sm">Right</Button>
</ButtonGroup>`,
  },
  breadcrumb: {
    "Two levels": `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Docs</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
    "Three levels": `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Guide</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
    "Ellipsis": `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
  },
  collapsible: {
    Default: `<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Collapsible content</CollapsibleContent>
</Collapsible>`,
    "Open by default": `<Collapsible defaultOpen>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Open content</CollapsibleContent>
</Collapsible>`,
  },
  menubar: {
    Default: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Exit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
    Composed: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>View</MenubarTrigger>
    <MenubarContent>
      <MenubarLabel>Appearance</MenubarLabel>
      <MenubarRadioGroup value="system">
        <MenubarRadioItem value="light">Light</MenubarRadioItem>
        <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
        <MenubarRadioItem value="system">System</MenubarRadioItem>
      </MenubarRadioGroup>
      <MenubarSeparator />
      <MenubarCheckboxItem checked>Show sidebar</MenubarCheckboxItem>
      <MenubarCheckboxItem>Show status bar</MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Insert</MenubarTrigger>
    <MenubarContent>
      <MenubarSub>
        <MenubarSubTrigger>Code block</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>TypeScript</MenubarItem>
          <MenubarItem>JavaScript</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarSeparator />
      <MenubarItem>
        Link
        <MenubarShortcut>mod+K</MenubarShortcut>
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
  },
  navbar: {
    default: `<Navbar
  brand={<span className="font-semibold">facet</span>}
  links={[{ href: "#", label: "Features" }]}
/>`,
    sticky: `<Navbar
  variant="sticky"
  brand={<span className="font-semibold">facet</span>}
  links={[{ href: "#", label: "Docs" }]}
/>`,
    glass: `<Navbar
  variant="glass"
  brand={<span className="font-semibold">facet</span>}
  links={[{ href: "#", label: "Docs" }]}
/>`,
    bordered: `<Navbar
  variant="bordered"
  brand={<span className="font-semibold">facet</span>}
  links={[{ href: "#", label: "Docs" }]}
/>`,
    transparent: `<Navbar
  variant="transparent"
  brand={<span className="font-semibold">facet</span>}
  links={[{ href: "#", label: "Docs" }]}
/>`,
    pill: `<Navbar
  variant="pill"
  brand={<span className="font-semibold">facet</span>}
  links={[{ href: "#", label: "Docs" }]}
/>`,
    "With dropdown": `<Navbar
  variant="default"
  brand={<span className="font-semibold">facet</span>}
  links={[
    { href: "#", label: "Features" },
    {
      href: "#",
      label: "Resources",
      children: [
        { href: "#", label: "Docs", description: "Guides and API reference" },
        { href: "#", label: "Blog", description: "Product updates" },
        { href: "#", label: "Changelog", description: "Version history", badge: "New" },
      ],
    },
    { href: "#", label: "Pricing" },
  ]}
/>`,
    "Theme toggle": `<ThemeProvider defaultTheme="system">
  <Navbar
    variant="sticky"
    brand={<span className="font-semibold">facet</span>}
    links={[{ href: "#", label: "Docs" }]}
    showThemeToggle
  />
</ThemeProvider>`,
  },
  "navigation-menu": {
    Default: `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="#">Getting Started</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
    "Multiple items": `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="#">Getting Started</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="#">API Reference</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
  },
  pagination: {
    Default: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
    Simple: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
  },
  "scroll-area": {
    Vertical: `<ScrollArea className="h-32 w-56 rounded-md border p-3">
  {Array.from({ length: 20 }, (_, i) => (
    <p key={i} className="py-0.5 text-sm">Line {i + 1}</p>
  ))}
  <ScrollBar />
</ScrollArea>`,
    Horizontal: `<ScrollArea className="h-24 w-56 whitespace-nowrap rounded-md border p-3">
  <div className="flex w-max gap-3">
    {items.map((item) => (
      <span key={item} className="w-32 rounded-md border p-2">{item}</span>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`,
    Both: `<ScrollArea className="h-40 w-56 rounded-md border p-3">
  <div className="grid w-max grid-cols-3 gap-3">
    {items.map((item, i) => (
      <div key={i} className="h-24 w-24 rounded-md border">{item}</div>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`,
  },
  separator: {
    Horizontal: `<div className="flex flex-col gap-2">
  <span>Above</span>
  <Separator />
  <span>Below</span>
</div>`,
    Vertical: `<div className="flex h-12 items-center gap-3">
  <span>Left</span>
  <Separator orientation="vertical" />
  <span>Right</span>
</div>`,
  },
  sheet: {
    Right: `<Sheet>
  <SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Sheet</SheetTitle>
      <SheetDescription>Sheet content</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`,
    Left: `<Sheet>
  <SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Sheet</SheetTitle>
      <SheetDescription>Sheet content</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`,
    Top: `<Sheet>
  <SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger>
  <SheetContent side="top">
    <SheetHeader>
      <SheetTitle>Sheet</SheetTitle>
      <SheetDescription>Sheet content</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`,
    Bottom: `<Sheet>
  <SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Sheet</SheetTitle>
      <SheetDescription>Sheet content</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`,
  },
  avatar: {
    "With image": `<Avatar className="h-10 w-10">
  <AvatarImage src="https://i.pravatar.cc/64?img=5" alt="Jane Archer" />
  <AvatarFallback>JA</AvatarFallback>
</Avatar>`,
    Fallback: `<Avatar className="h-10 w-10">
  <AvatarFallback>JA</AvatarFallback>
</Avatar>`,
    Large: `<Avatar className="h-16 w-16 text-lg">
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`,
    "Authenticated user": `<UserAvatar
  user={{ name: "Ada Lovelace", email: "ada@arcevo.dev" }}
  items={[
    { label: "Profile", shortcut: "⇧⌘P", icon: "users" },
    { label: "Settings", shortcut: "⌘,", icon: "settings" },
  ]}
/>`,
  },
  "avatar-group": {
    Default: `<AvatarGroup
  avatars={[
    { src: "https://i.pravatar.cc/64?img=1", alt: "Ada", fallback: "A" },
    { fallback: "B" },
    { fallback: "C" },
  ]}
/>`,
    Small: `<AvatarGroup
  size="sm"
  avatars={[
    { src: "https://i.pravatar.cc/64?img=1", alt: "Ada", fallback: "A" },
    { fallback: "B" },
  ]}
/>`,
    Large: `<AvatarGroup
  size="lg"
  avatars={[
    { src: "https://i.pravatar.cc/64?img=1", alt: "Ada", fallback: "A" },
    { fallback: "B" },
  ]}
/>`,
    "Max 2": `<AvatarGroup
  max={2}
  avatars={[
    { src: "https://i.pravatar.cc/64?img=1", alt: "Ada", fallback: "A" },
    { fallback: "B" },
    { fallback: "C" },
  ]}
/>`,
  },
  "empty-state": {
    Default: `<EmptyState title="No results" description="Try a different filter." />`,
    "With icon": `<EmptyState
  icon={<Search className="size-6" />}
  title="Nothing here"
  description="No items match your search."
/>`,
    "With action": `<EmptyState
  title="No documents"
  description="Create your first document to get started."
  action={<Button size="sm">New document</Button>}
/>`,
  },
  skeleton: {
    Text: `<div className="flex flex-col gap-2">
  <Skeleton className="h-4 w-48" />
  <Skeleton className="h-4 w-32" />
</div>`,
    Avatar: `<Skeleton className="size-12 rounded-full" />`,
    Card: `<div className="flex flex-col gap-3">
  <Skeleton className="h-28 w-56 rounded-lg" />
  <Skeleton className="h-4 w-40" />
</div>`,
  },
  progress: {
    Empty: `<Progress value={0} />`,
    "25%": `<Progress value={25} />`,
    "50%": `<Progress value={50} />`,
    "85%": `<Progress value={85} />`,
    Complete: `<Progress value={100} />`,
  },
  sonner: {
    Toaster: `<Toaster richColors position="top-right" />

<Button onClick={() => toast.success("Saved successfully")}>
  Show toast
</Button>`,
  },
  command: {
    Default: `<Command className="w-72">
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
    "With separator": `<Command className="w-72">
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results</CommandEmpty>
    <CommandGroup heading="General">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
    <CommandGroup heading="Danger">
      <CommandItem>Logout</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
  },
  "context-menu": {
    Default: `<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="rounded-md border border-dashed p-4">Right-click</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>Actions</ContextMenuLabel>
    <ContextMenuSeparator />
    <ContextMenuItem>Copy</ContextMenuItem>
    <ContextMenuItem>Paste</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
    "With icons": `<ContextMenu>
  <ContextMenuTrigger asChild>
    <div className="rounded-md border border-dashed p-4">Right-click</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>Actions</ContextMenuLabel>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Copy className="size-4" /> Copy
    </ContextMenuItem>
    <ContextMenuItem>
      <Paste className="size-4" /> Paste
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  },
  dialog: {
    Default: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog</DialogTitle>
      <DialogDescription>Dialog content</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`,
    "With footer": `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create project</DialogTitle>
      <DialogDescription>Fill in the details below.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  },
  "dropdown-menu": {
    Default: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    "With icons": `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Users className="size-4" /> Profile
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="size-4" /> Settings
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
  },
  "hover-card": {
    Default: `<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">Hover</Button>
  </HoverCardTrigger>
  <HoverCardContent>Hover card content</HoverCardContent>
</HoverCard>`,
    "With content": `<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@ada</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-64">
    <div className="space-y-1">
      <h4 className="text-sm font-semibold">Ada Lovelace</h4>
      <p className="text-sm text-muted-foreground">Mathematician and writer.</p>
    </div>
  </HoverCardContent>
</HoverCard>`,
  },
  popover: {
    Default: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open</Button>
  </PopoverTrigger>
  <PopoverContent>Popover content</PopoverContent>
</Popover>`,
    "With content": `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open</Button>
  </PopoverTrigger>
  <PopoverContent className="w-64">
    <div className="space-y-1">
      <h4 className="text-sm font-semibold">Dimensions</h4>
      <p className="text-sm text-muted-foreground">Set the width and height.</p>
    </div>
  </PopoverContent>
</Popover>`,
  },
  tooltip: {
    Default: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover</Button>
    </TooltipTrigger>
    <TooltipContent>Tooltip</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    Top: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover</Button>
    </TooltipTrigger>
    <TooltipContent side="top">Top tooltip</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  },
  table: {
    Default: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Ada</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    Wide: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Ada</TableCell>
      <TableCell>ada@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  },
  "notification-drawer": {
    Default: `<NotificationDrawer notifications={[]} />`,
    "With notifications": `<NotificationDrawer
  notifications={[
    { id: "1", title: "New message", description: "Ada sent you a message", time: "2m", read: false, type: "info" },
    { id: "2", title: "Build passed", description: "CI pipeline succeeded", time: "1h", read: false, type: "success" },
  ]}
/>`,
  },
  checkbox: {
    Default: `<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms</Label>`,
    Checked: `<Checkbox id="terms" defaultChecked />
<Label htmlFor="terms">Checked</Label>`,
    Disabled: `<Checkbox id="terms" disabled />
<Label htmlFor="terms">Disabled</Label>`,
  },
  combobox: {
    Default: `<Combobox
  options={[
    { value: "o1", label: "Option 1" },
    { value: "o2", label: "Option 2" },
  ]}
  placeholder="Select..."
  label="Options"
/>`,
    Placeholder: `<Combobox
  options={[{ value: "o1", label: "Option 1" }]}
  placeholder="Choose a framework..."
  label="Framework"
/>`,
  },
  input: {
    Default: `<Input placeholder="Type here..." />`,
    "With label": `<div className="grid gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="you@example.com" type="email" />
</div>`,
    Disabled: `<Input placeholder="Disabled" disabled />`,
  },
  "input-otp": {
    Default: `<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`,
    Separated: `<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`,
    Small: `<InputOTP maxLength={4}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
  </InputOTPGroup>
</InputOTP>`,
    "8-digit": `<InputOTP maxLength={8}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={5} />
    <InputOTPSlot index={6} />
    <InputOTPSlot index={7} />
  </InputOTPGroup>
</InputOTP>`,
  },
  label: {
    Default: `<Label htmlFor="email">Email</Label>`,
    "With input": `<div className="grid gap-1.5">
  <Label htmlFor="name">Full name</Label>
  <Input id="name" placeholder="Ada Lovelace" />
</div>`,
  },
  "radio-group": {
    Default: `<RadioGroup defaultValue="a">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="a" id="ra" />
    <Label htmlFor="ra">Option A</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="b" id="rb" />
    <Label htmlFor="rb">Option B</Label>
  </div>
</RadioGroup>`,
    Disabled: `<RadioGroup defaultValue="a">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="a" id="rd" />
    <Label htmlFor="rd">Option A</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="b" id="rd2" disabled />
    <Label htmlFor="rd2">Disabled</Label>
  </div>
</RadioGroup>`,
  },
  select: {
    Default: `<Select>
  <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Apple</SelectItem>
    <SelectItem value="b">Banana</SelectItem>
  </SelectContent>
</Select>`,
    "With value": `<Select defaultValue="b">
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Apple</SelectItem>
    <SelectItem value="b">Banana</SelectItem>
  </SelectContent>
</Select>`,
  },
  slider: {
    Default: `<Slider defaultValue={[50]} max={100} step={1} />`,
    Range: `<Slider defaultValue={[25, 75]} max={100} step={1} />`,
    Disabled: `<Slider defaultValue={[50]} max={100} step={1} disabled />`,
  },
  textarea: {
    Default: `<Textarea placeholder="Write something..." />`,
    "With label": `<div className="grid gap-1.5">
  <Label htmlFor="bio">Bio</Label>
  <Textarea id="bio" placeholder="Tell us about yourself" />
</div>`,
  },
  kbd: {
    Default: `<Kbd>⌘K</Kbd>`,
    Modifier: `<Kbd mod />`,
    Combination: `<Kbd>Shift + ⌘ + P</Kbd>`,
  },
  dropzone: {
    Default: `<Dropzone
  label="Drag files here or click to browse"
  hint="PDF, images, anything"
  onFiles={(files) => console.log(files)}
/>`,
    Disabled: `<Dropzone label="Uploads disabled" disabled />`,
    "Accept filter": `<Dropzone
  label="Images only"
  accept="image/*"
  onFiles={(files) => console.log(files)}
/>`,
    Paste: `<Dropzone
  label="Paste an image (Ctrl/Cmd+V)"
  accept="image/*"
  allowPaste
  onFiles={(files) => console.log(files)}
/>`,
  },
  "color-picker": {
    Default: `<ColorPicker value="#6366f1" label="Brand accent" />`,
    Compact: `<ColorPicker value="#10b981" compact label="Compact" />`,
  },
  qrcode: {
    Default: `<QRCode value="https://facet.arcevocirqle.com.ng" size={120} label="facet docs" />`,
    Large: `<QRCode value="https://github.com/arcevodev/facet" size={160} label="facet GitHub" />`,
    Colored: `<QRCode
  value="https://facet.arcevocirqle.com.ng"
  size={120}
  fgColor="#6366f1"
  label="branded"
/>`,
    Logo: `<QRCode
  value="https://github.com/arcevodev/facet"
  size={160}
  logo="/brand.png"
  logoSize={36}
  logoPosition="center"
/>`,
  },
  marquee: {
    Default: `<Marquee
  duration={16}
  items={["facet", "arc-id", "auth", "tokens", "React 19", "Radix"]}
/>`,
    Cards: `<Marquee
  duration={20}
  gap="1.25rem"
  items={["Design tokens", "Icon registry", "Auth flows"].map((label) => (
    <Card key={label} className="w-56 shrink-0">
      <CardHeader>
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">Card content.</p>
      </CardContent>
    </Card>
  ))}
/>`,
    Reverse: `<Marquee
  duration={16}
  reverse
  items={["A", "B", "C", "D", "E", "F"].map((letter) => (
    <span key={letter} className="rounded-full border px-4 py-2">
      Item {letter}
    </span>
  ))}
/>`,
    "Pause on hover": `<Marquee
  duration={18}
  items={["Hover", "to", "pause", "the", "scroll", "motion"].map((word) => (
    <span key={word} className="rounded-lg bg-primary/10 px-4 py-2 text-primary">
      {word}
    </span>
  ))}
/>`,
  },
  roadmap: {
    Default: `<Roadmap
  items={[
    { title: "Auth presets", description: "Fintech, med, edu", status: "done", date: "v1.0" },
    { title: "Passkey support", description: "WebAuthn across presets", status: "in-progress" },
    { title: "SAML/OIDC SSO", description: "Enterprise identity providers", status: "planned" },
  ]}
/>`,
    "No line": `<Roadmap
  showLine={false}
  items={[
    { title: "Auth presets", description: "Fintech, med, edu", status: "done", date: "v1.0" },
  ]}
/>`,
    Timeline: `<Roadmap
  variant="timeline"
  items={[
    { title: "Auth presets", description: "Fintech, med, edu", status: "done", date: "Phase 1" },
    { title: "Passkey support", description: "WebAuthn across presets", status: "in-progress", date: "Phase 2" },
    { title: "SAML/OIDC SSO", description: "Enterprise identity providers", status: "planned", date: "Phase 3" },
  ]}
/>`,
  },
  form: {
    "Basic form": `<Form form={form} onSubmit={(values) => console.log(values)}>
  <FormField name="name" label="Name" required>
    <Input placeholder="Ada Lovelace" />
  </FormField>
  <FormField name="email" label="Email" required>
    <Input placeholder="ada@example.com" type="email" />
  </FormField>
  <Button type="submit">Submit</Button>
</Form>`,
    "With validation": `<Form
  form={form}
  onSubmit={(values) => console.log(values)}
  schema={z.object({
    email: z.string().email("Enter a valid email"),
    name: z.string().min(2, "Name is too short"),
  })}
>
  <FormField name="name" label="Name" required>
    <Input placeholder="Ada Lovelace" />
  </FormField>
  <FormField name="email" label="Work email" required>
    <Input placeholder="you@company.com" type="email" />
  </FormField>
  <FormMessage />
  <Button type="submit">Continue</Button>
</Form>`,
  },
  "data-table": {
    Default: `<DataTable columns={columns} data={rows} />`,
    Searchable: `<DataTable columns={columns} data={rows} searchable />`,
    Selectable: `<DataTable columns={columns} data={rows} selectable />`,
    Toolbar: `<DataTable
  columns={columns}
  data={rows}
  searchable
  selectable
  exportable
  exporters={[{ key: "json", label: "JSON", export: (cols, rows) => downloadJson(cols, rows) }]}
  actions={[
    { key: "delete", label: "Delete selected", destructive: true, action: (rows, selected) => onDelete(selected) },
  ]}
/>`,
    "Rows per page": `<DataTable columns={columns} data={rows} pagination pageSize={10} pageSizeOptions={[10, 25, 50]} />`,
  },
  "date-picker": {
    Default: `<DatePicker label="Due date" />`,
    "Horizontal strip": `<DatePicker label="Pick a day" scrollMode="horizontal" horizontalDays={14} />`,
  },
  "date-input": {
    Default: `<DateInput label="Start date" value="2026-03-05" />`,
    Native: `<DateInput label="Due date" native />`,
  },
  "password-input": {
    Default: `<PasswordInput label="Password" />`,
    "No toggle": `<PasswordInput label="Password" showToggle={false} />`,
  },
  "mail-input": {
    Default: `<MailInput placeholder="you@example.com" required />`,
    "Custom domains": `<MailInput domains={["arcevocirqle.com.ng", "gmail.com", "yahoo.com"]} />`,
  },
  "infinite-scroll": {
    Vertical: `<InfiniteScroll
  hasMore={hasMore}
  onLoadMore={loadMore}
  loading={loading}
  className="max-h-96"
>
  {items}
</InfiniteScroll>`,
    Horizontal: `<InfiniteScroll
  hasMore={hasMore}
  onLoadMore={loadMore}
  direction="horizontal"
>
  {items}
</InfiniteScroll>`,
  },
  "number-input": {
    Default: `<NumberInput label="Quantity" min={0} max={10} />`,
    "With value": `<NumberInput label="Quantity" value={4} min={0} max={10} />`,
    Currency: `<NumberInput
  label="Amount"
  value={2500}
  currency="₦"
  min={0}
/>`,
    "Currency picker": `<NumberInput
  label="Price"
  value={price}
  onValueChange={setPrice}
  currency="$"
  currencyPicker
  onCurrencyChange={(c) => console.log(c.code)}
/>`,
  },
  "country-code-input": {
    Default: `<CountryCodeInput label="Mobile number" />`,
    "Full ISO list": `<CountryCodeInput countries={ISO_COUNTRY_CODES} label="Mobile number" />`,
    "Africa only": `<CountryCodeInput countries={ISO_COUNTRY_CODES} includeRegions={["africa"]} label="Mobile number" />`,
    "No Europe": `<CountryCodeInput countries={ISO_COUNTRY_CODES} excludeRegions={["europe"]} label="Mobile number" />`,
  },
  "location-picker": {
    Default: `<LocationPicker
  value={location}
  onValueChange={setLocation}
  showLocality
/>`,
    "Without locality": `<LocationPicker value={location} onValueChange={setLocation} />`,
    "Standalone levels": `<CountryInput value={c} onValueChange={setC} />
<StateInput country={c} value={s} onValueChange={setS} />
<LGAInput country={c} region={s} value={l} onValueChange={setL} />`,
  },
  "sign-in": {
    "Email + password": `<SignIn config={config} initialStep="login_form" />`,
    "Magic link": `<SignIn config={{ ...config, allowMagicLink: true }} initialStep="magic_link_form" />`,
    Passkey: `<SignIn config={{ ...config, allowPasskey: true }} initialStep="passkey_auth" />`,
    OAuth: `<SignIn config={{ ...config, oauthProviders: ["google", "github"] }} />`,
    "Forgot password": `<SignIn config={config} step="forgot_password" onStepChange={setStep} />`,
  },
  "console-layout": {
    Full: `<ConsoleLayout config={defaultLayoutPreset} mode="full">
  <YourContent />
</ConsoleLayout>`,
    Rail: `<ConsoleLayout config={defaultLayoutPreset} mode="rail">
  <YourContent />
</ConsoleLayout>`,
  },
  "auth-layout": {
    Fintech: `<AuthLayout config={fintechLayoutPreset}>
  <SignIn config={fintechPreset} />
</AuthLayout>`,
    Default: `<AuthLayout config={defaultLayoutPreset}>
  <SignIn config={defaultPreset} />
</AuthLayout>`,
    "Custom brand panel": `<AuthLayout
  config={fintechLayoutPreset}
  brandPanel={
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
      <p className="text-2xl font-bold text-white">Anything goes here</p>
    </div>
  }
>
  <SignIn config={fintechPreset} />
</AuthLayout>`,
  },
  "landing-layout": {
    Default: `<LandingLayout
  nav={<Navbar variant="pill" brand={brand} links={links} />}
  hero={<h1 className="text-5xl font-bold">Build faster</h1>}
>
  <section>Feature grid</section>
</LandingLayout>`,
  },
  sidebar: {
    Expanded: `<LayoutProvider>
  <div className="flex">
    <Sidebar config={fintechLayoutPreset} />
    <main className="flex-1">Content</main>
  </div>
</LayoutProvider>`,
  },
  topbar: {
    Default: `<LayoutProvider>
  <Topbar />
</LayoutProvider>`,
  },
  "text-animations": {
    Blur: `<BlurText text="Blur in, word by word" className="font-heading text-2xl font-bold text-foreground" />`,
    Wave: `<WaveText text="Wave hello" className="font-heading text-2xl font-bold text-foreground" />`,
    Flip: `<FlipText text="Flip it" className="font-heading text-2xl font-bold text-foreground" />`,
    "Split / rise": `<SplitText text="Words rise into place" className="font-heading text-2xl font-bold text-foreground" />`,
    "Fade up": `<FadeUpText text="Fade and slide up" className="font-heading text-2xl font-bold text-foreground" />`,
    Shimmer: `<ShimmerText text="Shimmering headline" className="font-heading text-2xl font-extrabold text-foreground" />`,
    Gradient: `<GradientText text="Animated gradient" className="font-heading text-2xl font-extrabold" />`,
    "Letter spacing": `<LetterSpacingText text="Hover to expand" className="font-heading text-2xl font-bold text-foreground" />`,
    "Count up": `<CountUpText to={64000} separator className="font-heading text-2xl font-bold text-foreground" />`,
    Typewriter: `<TypewriterText phrases={["one identity", "every door", "your key"]} className="font-heading text-xl font-bold text-foreground" />`,
    "Fast cycle": `<TypewriterText
  phrases={["build", "ship", "scale"]}
  typeSpeed={45}
  eraseSpeed={25}
  delay={900}
  className="font-heading text-xl font-bold text-foreground"
/>`,
  },
  "micro-interactions": {
    "Tilt card": `<TiltCard className="w-64 rounded-xl border border-border bg-background p-6 shadow-sm">
  <p className="text-sm font-semibold text-foreground">Move your cursor over me</p>
</TiltCard>`,
    "Glow card": `<GlowCard className="w-64 rounded-xl border border-border bg-background p-6 shadow-sm">
  <p className="text-sm font-semibold text-foreground">A glow follows your cursor</p>
</GlowCard>`,
    "Ripple button": `<RippleButton className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
  Click me
</RippleButton>`,
    "Magnetic button": `<MagneticButton className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
  Magnetic
</MagneticButton>`,
    "Shine button": `<ShineButton className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
  Shine on hover
</ShineButton>`,
    "Scroll reveal": `<ScrollReveal>
  <p className="text-sm font-semibold text-foreground">Reveals as you scroll</p>
</ScrollReveal>`,
  },
  animated: {
    Layers: `<div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
  <Aurora className="absolute inset-0" opacity={0.75} />
  <Beams count={4} className="absolute inset-0" color="rgba(129,140,248,0.35)" />
  <GridPattern className="absolute inset-0" />
  <p className="relative z-10 text-lg font-bold">Aurora + Beams + Grid</p>
</div>`,
    Spotlight: `<Spotlight className="relative flex h-full w-full items-center justify-center">
  <p className="text-lg font-bold">Move your cursor here</p>
</Spotlight>`,
    "Sparkle button": `<SparkleButton label="Click me" />`,
  },
  "animated-button": {
    Shine: `<AnimatedButton animation="shine">Continue</AnimatedButton>`,
    Sparkle: `<AnimatedButton animation="sparkle">Get started</AnimatedButton>`,
    Ripple: `<AnimatedButton animation="ripple">Click me</AnimatedButton>`,
    Magnetic: `<AnimatedButton animation="magnetic">Pull</AnimatedButton>`,
    None: `<AnimatedButton animation="none">Plain</AnimatedButton>`,
  },
  "card-animations": {
    "Flip card": `<FlipCard
  className="w-64"
  front={<div className="flex h-full items-center justify-center rounded-xl border border-border bg-background">Front</div>}
  back={<div className="flex h-full items-center justify-center rounded-xl bg-primary text-primary-foreground">Back</div>}
/>`,
    "Spotlight card": `<SpotlightCard className="w-64 rounded-xl border border-border bg-background p-6">
  <p className="text-sm font-semibold">Move your cursor over me</p>
</SpotlightCard>`,
    "Border beam": `<BorderBeamCard className="w-64">
  <div className="rounded-xl p-6">Animated border</div>
</BorderBeamCard>`,
    "Shine card": `<ShineCard className="w-64 rounded-xl border border-border bg-background p-6">
  <p className="text-sm font-semibold">Hover for a sheen</p>
</ShineCard>`,
    "Gradient border": `<GradientBorderCard className="w-64">
  <div className="rounded-xl p-6">Gradient border</div>
</GradientBorderCard>`,
    "Reveal card": `<RevealCard className="w-64 rounded-xl border border-border bg-background p-6">
  <p className="text-sm font-semibold">Scroll to reveal</p>
</RevealCard>`,
    "Hover scale": `<HoverScaleCard className="w-64 rounded-xl border border-border bg-background p-6">
  <p className="text-sm font-semibold">Hover to scale</p>
</HoverScaleCard>`,
    "Magnetic card": `<MagneticCard className="w-64 rounded-xl border border-border bg-background p-6">
  <p className="text-sm font-semibold">It pulls toward your cursor</p>
</MagneticCard>`,
  },
  "otp-verification-card": {
    Default: `<OtpVerificationCard onVerify={async (code) => validate(code)} />`,
    "With resend": `<OtpVerificationCard onVerify={async (code) => validate(code)} onResend={async () => resend()} length={4} />`,
  },
  "password-strength-meter": {
    Empty: `<PasswordStrengthMeter value="" />`,
    Weak: `<PasswordStrengthMeter value="abc" />`,
    Strong: `<PasswordStrengthMeter value="P@ssw0rd!123" />`,
  },
  "testimonial-showcase": {
    Grid: `<TestimonialShowcase testimonials={testimonials} mode="grid" />`,
    Carousel: `<TestimonialShowcase testimonials={testimonials} mode="carousel" />`,
  },
  "stat-card": {
    "Positive delta": `<StatCard label="Monthly revenue" value="$48,290" delta={12.4} hint="vs last month" />`,
    "Negative delta": `<StatCard label="Churn rate" value="2.1%" delta={-0.4} hint="vs last month" />`,
  },
};

/** The package a slug's components live in (for usage import lines). */
const PACKAGE_BY_SLUG: Record<string, string> = {
  "sign-in": "@arcevo/facet-auth",
  "sign-up": "@arcevo/facet-auth",
  "mfa-dialog": "@arcevo/facet-auth",
  guard: "@arcevo/facet-auth",
  "console-layout": "@arcevo/facet-layout",
  "auth-layout": "@arcevo/facet-layout",
  "landing-layout": "@arcevo/facet-layout",
  sidebar: "@arcevo/facet-layout",
  topbar: "@arcevo/facet-layout",
};

/** Components imported from a non-components package, keyed by slug. */
const PACKAGE_IMPORTS: Record<string, string[]> = {
  "sign-in": ["SignIn"],
  "sign-up": ["SignUp"],
  "mfa-dialog": ["MfaVerifyForm", "MfaSetupForm"],
  guard: ["Guard", "SignIn"],
  "console-layout": ["ConsoleLayout", "defaultLayoutPreset"],
  "auth-layout": ["AuthLayout", "fintechLayoutPreset", "defaultLayoutPreset"],
  "landing-layout": ["LandingLayout"],
  sidebar: ["Sidebar", "LayoutProvider", "fintechLayoutPreset"],
  topbar: ["Topbar", "LayoutProvider"],
};

/**
 * Additional cross-package imports for a slug's snippets, keyed by the
 * target package. E.g. auth-layout snippets compose SignIn from facet-auth
 * inside AuthLayout from facet-layout.
 */
const EXTRA_PACKAGE_IMPORTS: Record<string, Record<string, string[]>> = {
  "auth-layout": {
    "@arcevo/facet-auth": ["SignIn", "fintechPreset", "defaultPreset"],
  },
};
