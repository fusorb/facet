import * as React from "react";
import { LightIcon } from "@arcevo/facet-components/light";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AspectRatio,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardFlipBack,
  Pill,
  Progress,
  Spinner,
  Switch,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserAvatar,
  AvatarGroup,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogIcon,
  ConfirmAlertDialog,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  ButtonGroup,
  Checkbox,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Combobox,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  EmptyState,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  Kbd,
  getModSymbol,
  Label,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarShortcut,
  Navbar,
  ThemeProvider,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NotificationDrawer,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
  Popover,
  PopoverTrigger,
  PopoverContent,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  ScrollBar,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Separator,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Skeleton,
  Slider,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Textarea,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Dropzone,
  ColorPicker,
  QRCode,
  Marquee,
  Roadmap,
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
  Form,
  FormField,
  useForm,
  DataTable,
  DatePicker,
  DateInput,
  PasswordInput,
  MailInput,
  InfiniteScroll,
  NumberInput,
  CountryCodeInput,
  ISO_COUNTRY_CODES,
  LocationPicker,
  Aurora,
  Beams,
  GridPattern,
  Spotlight,
  SparkleButton,
  TypewriterText,
  AnimatedButton,
  BlurText,
  WaveText,
  FlipText,
  SplitText,
  FadeUpText,
  ShimmerText,
  GradientText,
  LetterSpacingText,
  CountUpText,
  DissolveText,
  TiltCard,
  GlowCard,
  RippleButton,
  MagneticButton,
  ShineButton,
  ScrollReveal,
  DissolveButton,
  FlipCard,
  SpotlightCard,
  BorderBeamCard,
  ShineCard,
  GradientBorderCard,
  RevealCard,
  HoverScaleCard,
   MagneticCard,
   DissolveCard,
  OtpVerificationCard,
  TwoFactorSetupPanel,
  PasswordStrengthMeter,
  ApiKeyManager,
  InviteTeamForm,
  AccountSettingsPanel,
  SecuritySectionCard,
  AnnouncementBar,
  CookieConsent,
  TestimonialShowcase,
  FaqSection,
  PageHeader,
  StatCard,
  ActivityFeed,
  Footer,
  FeedbackPage,
  NotFound,
  BillingPage,
  BillingPageTable,
  BillingPageFreemium,
  CountryInput,
  StateInput,
  LGAInput,
  type RoadmapItem,
  type DataTableColumn,
  type BillingPlan,
} from "@arcevo/facet-components";
import { ArcProvider, SignIn } from "@arcevo/facet-auth";
import { ArcIdClient } from "@arcevo/facet-sdk";
import {
  ConsoleLayout,
  AuthLayout,
  LandingLayout,
  Sidebar,
  Topbar,
  LayoutProvider,
  defaultLayoutPreset,
  fintechLayoutPreset,
} from "@arcevo/facet-layout";

/** No network: bootstrap stays signed out because no token is stored. */
const DEMO_CLIENT = new ArcIdClient({ baseUrl: "https://demo.invalid" });

/** One cell in the variant gallery: a label plus the rendered example. */
export interface VariantCell {
  label: string;
  node: React.ReactNode;
}

const IMG =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces";

const AVATARS = [
  { src: IMG, alt: "a", fallback: "A" },
  { fallback: "B" },
  { fallback: "C" },
  { fallback: "D" },
  { fallback: "E" },
];

const DEMO_ROWS: Record<string, unknown>[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
  { id: "2", name: "Grace Hopper", email: "grace@example.com", role: "Engineer" },
  { id: "3", name: "Alan Turing", email: "alan@example.com", role: "Researcher" },
];

const DEMO_COLUMNS: DataTableColumn<Record<string, unknown>>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
];

const BILLING_PLANS: BillingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "For side projects and evaluation",
    icon: "sparkles",
    features: ["1 project", "Community support", "Core components"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    highlight: true,
    discounts: { quarterly: 30 },
    description: "For growing teams",
    icon: "zap",
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "SSO/SAML",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: 49,
    discounts: { quarterly: 20 },
    description: "For organizations",
    icon: "users",
    features: ["Everything in Pro", "Audit log", "Custom roles"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    customPriceLabel: "Custom",
    description: "For large-scale deployments",
    icon: "building",
    features: ["Everything in Team", "Dedicated support", "SLA", "On-prem"],
  },
];

const ROADMAP_ITEMS: RoadmapItem[] = [
  { title: "Auth presets", description: "Fintech, med, edu", status: "done", date: "v1.0" },
  { title: "Passkey support", description: "WebAuthn across presets", status: "in-progress" },
  { title: "SAML/OIDC SSO", description: "Enterprise identity providers", status: "planned" },
];

const OTP = (
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

const OTP_SEPARATED = (
  <InputOTP maxLength={6}>
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
  </InputOTP>
);

function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Apple</SelectItem>
        <SelectItem value="b">Banana</SelectItem>
        <SelectItem value="c">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
}

function ComboboxDemo() {
  return (
    <div className="w-56">
      <Combobox
        options={[
          { value: "o1", label: "Option 1" },
          { value: "o2", label: "Option 2" },
          { value: "o3", label: "Option 3" },
        ]}
        value="o1"
        placeholder="Select..."
        label="Options"
      />
    </div>
  );
}

function CommandDemo() {
  return (
    <Command className="w-64">
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Settings</CommandItem>
          <CommandItem>Logout</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function DropdownMenuDemo() {
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
}

function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-24 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Right-click
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function MenubarDemo() {
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
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

function MenubarComposedDemo() {
  return (
    <Menubar>
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
    </Menubar>
  );
}

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SheetDemo({ side }: { side?: "left" | "right" | "top" | "bottom" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet</SheetTitle>
          <SheetDescription>Sheet content</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open</Button>
      </PopoverTrigger>
      <PopoverContent>Popover content</PopoverContent>
    </Popover>
  );
}

function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Hover</Button>
      </HoverCardTrigger>
      <HoverCardContent>Hover card content</HoverCardContent>
    </HoverCard>
  );
}

function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function NotificationDrawerToolbarDemo() {
  const [items, setItems] = React.useState([
    { id: "1", title: "New message", description: "Ada sent you a message", time: "2m", read: false, type: "info" as const },
    { id: "2", title: "Build passed", description: "CI pipeline succeeded", time: "1h", read: false, type: "success" as const },
    { id: "3", title: "Password changed", description: "Your password was updated", time: "1d", read: true, type: "warning" as const },
  ]);
  return (
    <NotificationDrawer
      notifications={items}
      onSearchChange={() => {}}
      onFilterChange={() => {}}
      onMarkAllRead={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
      onMarkRead={(n) => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
      onDelete={(n) => setItems((prev) => prev.filter((x) => x.id !== n.id))}
      onDismiss={(n) => setItems((prev) => prev.filter((x) => x.id !== n.id))}
    />
  );
}

function NavigationMenuDemo() {
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
}

function BreadcrumbDemo({ custom }: { custom?: boolean }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {custom && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{custom ? "Guide" : "Docs"}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function BreadcrumbEllipsisDemo() {
  return (
    <Breadcrumb>
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
    </Breadcrumb>
  );
}

function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">5</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/**
 * Per-component variant galleries for the /components/:slug pages.
 * Each slug maps to the labeled cells shown in the docs grid.
 * Falls back to a single default cell for slugs without a gallery.
 */
export function variantCells(slug: string): VariantCell[] | undefined {
  switch (slug) {
    /* ── Aspect ratio variants ───────────────────────────────── */
    case "aspect-ratio":
      return (["16:9", "1:1", "4:3", "21:9", "3:4" as const]).map((ratio) => ({
        label: ratio,
        node: (
          <div className="w-full max-w-md">
            <AspectRatio
              ratio={
                {
                  "16:9": 16 / 9,
                  "1:1": 1,
                  "4:3": 4 / 3,
                  "21:9": 21 / 9,
                  "3:4": 3 / 4,
                }[ratio]
              }
            >
              <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                {ratio}
              </div>
            </AspectRatio>
          </div>
        ),
      }));
    case "resizable":
      return [
        {
          label: "horizontal",
          node: (
            <div className="w-full max-w-lg h-80">
              <ResizablePanelGroup>
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full w-full items-center justify-center border-r bg-muted text-sm">
                    Panel 1
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                  <div className="flex h-full w-full items-center justify-center border border-l-0 bg-muted text-sm">
                    Panel 2
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          ),
        },
        {
          label: "vertical",
          node: (
            <div className="w-full max-w-lg h-80">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full w-full items-center justify-center border-b bg-muted text-sm">
                    Panel 1
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle orientation="vertical" />
                <ResizablePanel>
                  <div className="flex h-full w-full items-center justify-center border border-t-0 bg-muted text-sm">
                    Panel 2
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          ),
        },
      ];
    /* ── Buttons / actions ───────────────────────────────────── */
    case "button":
      return (
        ["default", "secondary", "destructive", "outline", "ghost", "link", "glass", "glow"] as const
      ).map((variant) => ({
        label: variant,
        node: <Button variant={variant}>Button</Button>,
      }));
    case "button-group":
      return [
        {
          label: "Default",
          node: (
            <ButtonGroup>
              <Button size="sm">Left</Button>
              <Button size="sm">Middle</Button>
              <Button size="sm">Right</Button>
            </ButtonGroup>
          ),
        },
        {
          label: "Joined",
          node: (
            <ButtonGroup joined>
              <Button size="sm">Left</Button>
              <Button size="sm">Middle</Button>
              <Button size="sm">Right</Button>
            </ButtonGroup>
          ),
        },
      ];

    /* ── Badges / display ────────────────────────────────────── */
    case "badge":
      return [
        ...(["default", "secondary", "outline", "success", "warning", "destructive"] as const).map(
          (variant) => ({
            label: variant,
            node: <Badge variant={variant}>{variant}</Badge>,
          }),
        ),
        { label: "with icon", node: <Badge icon={<LightIcon name="sparkles" className="size-3" />}>New</Badge> },
        {
          label: "icon only",
          node: (
            <Badge variant="success" iconOnly icon={<LightIcon name="check" className="size-3.5" />} aria-label="Verified" />
          ),
        },
      ];
    case "pill":
      return [
        ...(["default", "outline", "filled"] as const).map((variant) => ({
          label: variant,
          node: <Pill variant={variant}>{variant}</Pill>,
        })),
        ...(["primary", "success", "warning", "destructive"] as const).map((color) => ({
          label: color,
          node: <Pill color={color}>{color}</Pill>,
        })),
        { label: "selected", node: <Pill selected>Selected</Pill> },
        { label: "removable", node: <Pill removable onRemove={() => {}}>Tag</Pill> },
      ];
    case "kbd":
      return [
        { label: "Default", node: <Kbd>⌘K</Kbd> },
        { label: "Modifier", node: <Kbd mod /> },
        { label: "Combination", node: <Kbd>Shift + ⌘ + P</Kbd> },
      ];

    /* ── Feedback / alerts ───────────────────────────────────── */
    case "alert":
      return (
        [
          { label: "Default", variant: "default", title: "Heads up", desc: "Default alert" },
          { label: "Destructive", variant: "destructive", title: "Error", desc: "Destructive alert" },
          { label: "Success", variant: "success", title: "Success", desc: "Success alert" },
          { label: "Warning", variant: "warning", title: "Warning", desc: "Warning alert" },
        ] as const
      ).map(({ label, variant, title, desc }) => ({
        label,
        node: (
          <Alert variant={variant} className="w-full">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{desc}</AlertDescription>
          </Alert>
        ),
      }));
    case "empty-state":
      return [
        {
          label: "Default",
          node: <EmptyState title="No results" description="Try a different filter." />,
        },
        {
          label: "With icon",
          node: (
            <EmptyState
              icon={<LightIcon name="search" className="size-6" />}
              title="Nothing here"
              description="No items match your search."
            />
          ),
        },
        {
          label: "With action",
          node: (
            <EmptyState
              icon={<LightIcon name="document" className="size-6" />}
              title="No documents"
              description="Create your first document to get started."
              action={<Button size="sm">New document</Button>}
            />
          ),
        },
      ];
    case "skeleton":
      return [
        {
          label: "Text",
          node: (
            <div className="flex w-56 flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ),
        },
        {
          label: "Avatar",
          node: <Skeleton className="size-12 rounded-full" />,
        },
        {
          label: "Card",
          node: (
            <div className="flex w-56 flex-col gap-3">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ),
        },
      ];
    case "progress":
      return [0, 25, 50, 85, 100].map((value) => ({
        label: value === 0 ? "Empty" : value === 100 ? "Complete" : `${value}%`,
        node: <Progress value={value} className="w-56" />,
      }));
    case "spinner":
      return (
        [
          { label: "Default", variant: "default" },
          { label: "Primary", variant: "primary" },
          { label: "Muted", variant: "muted" },
          { label: "Small", variant: "default", size: "sm" },
          { label: "Large", variant: "default", size: "lg" },
        ] as const
      ).map(({ label, ...props }) => ({
        label,
        node: <Spinner {...props} />,
      }));
    case "sonner":
      return [
        {
          label: "Toaster",
          node: (
            <div className="w-64 space-y-2 rounded-lg border border-border bg-background p-3 text-sm">
              <div className="flex items-center gap-2">
                <LightIcon name="check" className="size-4 text-success" />
                <span className="text-foreground">Saved successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <LightIcon name="triangle-alert" className="size-4 text-warning" />
                <span className="text-foreground">Check your connection</span>
              </div>
            </div>
          ),
        },
      ];

    /* ── Layout / navigation ─────────────────────────────────── */
    case "accordion":
      return [
        {
          label: "Default",
          node: (
            <Accordion type="single" collapsible className="w-64">
              <AccordionItem value="a">
                <AccordionTrigger>Item A</AccordionTrigger>
                <AccordionContent>Content A</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Item B</AccordionTrigger>
                <AccordionContent>Content B</AccordionContent>
              </AccordionItem>
              <AccordionItem value="c">
                <AccordionTrigger>Item C</AccordionTrigger>
                <AccordionContent>Content C</AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        },
        {
          label: "Multiple",
          node: (
            <Accordion type="multiple" className="w-64">
              <AccordionItem value="a">
                <AccordionTrigger>Item A</AccordionTrigger>
                <AccordionContent>Content A</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Item B</AccordionTrigger>
                <AccordionContent>Content B</AccordionContent>
              </AccordionItem>
              <AccordionItem value="c">
                <AccordionTrigger>Item C</AccordionTrigger>
                <AccordionContent>Content C</AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        },
        {
          label: "Separated",
          node: (
            <Accordion type="single" collapsible className="w-64">
              <AccordionItem variant="separated" value="a">
                <AccordionTrigger>Item A</AccordionTrigger>
                <AccordionContent>Content A</AccordionContent>
              </AccordionItem>
              <AccordionItem variant="separated" value="b">
                <AccordionTrigger>Item B</AccordionTrigger>
                <AccordionContent>Content B</AccordionContent>
              </AccordionItem>
              <AccordionItem variant="separated" value="c">
                <AccordionTrigger>Item C</AccordionTrigger>
                <AccordionContent>Content C</AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        },
        {
          label: "Ghost",
          node: (
            <Accordion type="single" collapsible className="w-64">
              <AccordionItem variant="ghost" value="a">
                <AccordionTrigger>Item A</AccordionTrigger>
                <AccordionContent>Content A</AccordionContent>
              </AccordionItem>
              <AccordionItem variant="ghost" value="b">
                <AccordionTrigger>Item B</AccordionTrigger>
                <AccordionContent>Content B</AccordionContent>
              </AccordionItem>
              <AccordionItem variant="ghost" value="c">
                <AccordionTrigger>Item C</AccordionTrigger>
                <AccordionContent>Content C</AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        },
        {
          label: "Compact",
          node: (
            <Accordion type="single" collapsible className="w-64">
              <AccordionItem variant="compact" value="a">
                <AccordionTrigger>Item A</AccordionTrigger>
                <AccordionContent>Content A</AccordionContent>
              </AccordionItem>
              <AccordionItem variant="compact" value="b">
                <AccordionTrigger>Item B</AccordionTrigger>
                <AccordionContent>Content B</AccordionContent>
              </AccordionItem>
              <AccordionItem variant="compact" value="c">
                <AccordionTrigger>Item C</AccordionTrigger>
                <AccordionContent>Content C</AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        },
        {
          label: "Nested",
          node: (
            <Accordion type="single" collapsible className="w-64">
              <AccordionItem value="parent">
                <AccordionTrigger>Parent</AccordionTrigger>
                <AccordionContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem variant="nested" value="child">
                      <AccordionTrigger>Child item</AccordionTrigger>
                      <AccordionContent>Deep content</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        },
      ];
    case "breadcrumb":
      return [
        { label: "Two levels", node: <BreadcrumbDemo /> },
        { label: "Three levels", node: <BreadcrumbDemo custom /> },
        { label: "Ellipsis", node: <BreadcrumbEllipsisDemo /> },
      ];
    case "collapsible":
      return [
        {
          label: "Default",
          node: (
            <Collapsible className="w-64">
              <CollapsibleTrigger>Toggle</CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
                Collapsible content
              </CollapsibleContent>
            </Collapsible>
          ),
        },
        {
          label: "Open by default",
          node: (
            <Collapsible defaultOpen className="w-64">
              <CollapsibleTrigger>Toggle</CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
                Open content
              </CollapsibleContent>
            </Collapsible>
          ),
        },
      ];
    case "menubar":
      return [
        { label: "Default", node: <MenubarDemo /> },
        { label: "Composed", node: <MenubarComposedDemo /> },
      ];
    case "navbar":
      return (
        [
          ...(["default", "sticky", "glass", "bordered", "transparent", "pill"] as const).map(
            (variant) => ({
              label: variant,
              node: (
                <div className="w-full max-w-md">
                  <Navbar
                    variant={variant}
                    brand={<span className="font-semibold">facet</span>}
                    links={[
                      { href: "#", label: "Features" },
                      { href: "#", label: "Docs" },
                    ]}
                  />
                </div>
              ),
            }),
          ),
          {
            label: "With dropdown",
            node: (
              <div className="w-full max-w-md">
                <Navbar
                  variant="default"
                  brand={<span className="font-semibold">facet</span>}
                  links={[
                    { href: "#", label: "Features" },
                    {
                      href: "#",
                      label: "Resources",
                      columns: 2,
                      panelWidth: "w-[30rem]",
                      children: [
                        { href: "#", label: "Docs", description: "Guides and API reference", icon: <LightIcon name="book-open" className="size-4" /> },
                        { href: "#", label: "Blog", description: "Product updates", icon: <LightIcon name="sparkles" className="size-4" /> },
                        { href: "#", label: "Changelog", description: "Version history", badge: "New", icon: <LightIcon name="list" className="size-4" /> },
                        { href: "#", label: "Community", description: "Discussions and support", icon: <LightIcon name="users" className="size-4" /> },
                      ],
                    },
                    { href: "#", label: "Pricing" },
                  ]}
                />
              </div>
            ),
          },
          {
            label: "Nested links",
            node: (
              <div className="w-full max-w-md">
                <Navbar
                  variant="default"
                  brand={<span className="font-semibold">facet</span>}
                  links={[
                    {
                      href: "#",
                      label: "Product",
                      children: [
                        { href: "#", label: "Overview", description: "What facet is" },
                        {
                          href: "#",
                          label: "Components",
                          children: [
                            { href: "#", label: "Buttons" },
                            { href: "#", label: "Cards" },
                            { href: "#", label: "Forms" },
                          ],
                        },
                        { href: "#", label: "Pricing", badge: "New" },
                      ],
                    },
                    { href: "#", label: "Docs" },
                  ]}
                />
              </div>
            ),
          },
          {
            label: "Theme toggle",
            node: (
              <div className="w-full max-w-md">
                <ThemeProvider defaultTheme="system">
                  <Navbar
                    variant="sticky"
                    brand={<span className="font-semibold">facet</span>}
                    links={[{ href: "#", label: "Docs" }]}
                    showThemeToggle
                  />
                </ThemeProvider>
              </div>
            ),
          },
        ] as { label: string; node: React.ReactNode }[]
      );
    case "navigation-menu":
      return [
        { label: "Default", node: <NavigationMenuDemo /> },
        {
          label: "Multiple items",
          node: (
            <NavigationMenu>
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
            </NavigationMenu>
          ),
        },
      ];
    case "pagination":
      return [
        { label: "Default", node: <PaginationDemo /> },
        {
          label: "Simple",
          node: (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ),
        },
      ];
    case "scroll-area":
      return [
        {
          label: "Vertical",
          node: (
            <ScrollArea className="h-32 w-56 rounded-md border border-border p-3">
              {Array.from({ length: 20 }, (_, i) => (
                <p key={i} className="py-0.5 text-sm">
                  Line {i + 1}
                </p>
              ))}
              <ScrollBar />
            </ScrollArea>
          ),
        },
        {
          label: "Horizontal",
          node: (
            <ScrollArea className="h-24 w-56 whitespace-nowrap rounded-md border border-border p-3">
              <div className="flex w-max gap-3">
                {Array.from({ length: 12 }, (_, i) => (
                  <span
                    key={i}
                    className="inline-flex h-16 w-32 items-center justify-center rounded-md border border-border bg-muted/30 text-sm"
                  >
                    Card {i + 1}
                  </span>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ),
        },
        {
          label: "Both",
          node: (
            <ScrollArea className="h-40 w-56 rounded-md border border-border p-3">
              <div className="grid w-max grid-cols-3 gap-3">
                {Array.from({ length: 18 }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-24 w-24 items-center justify-center rounded-md border border-border bg-muted/30 text-sm"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ),
        },
      ];
    case "infinite-scroll":
      return [
        {
          label: "Vertical",
          node: (
            <div className="max-h-48 w-full overflow-hidden rounded-md border border-border p-2">
              <InfiniteScroll
                hasMore={false}
                onLoadMore={() => {}}
                className="max-h-40 overflow-y-auto"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    Item {i + 1}
                  </div>
                ))}
              </InfiniteScroll>
            </div>
          ),
        },
        {
          label: "Horizontal",
          node: (
            <div className="w-full overflow-hidden rounded-md border border-border p-2">
              <InfiniteScroll
                hasMore={false}
                onLoadMore={() => {}}
                direction="horizontal"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-16 w-28 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-sm"
                  >
                    Card {i + 1}
                  </div>
                ))}
              </InfiniteScroll>
            </div>
          ),
        },
      ];
    case "separator":
      return [
        {
          label: "Horizontal",
          node: (
            <div className="flex w-56 flex-col gap-2">
              <span>Above</span>
              <Separator />
              <span>Below</span>
            </div>
          ),
        },
        {
          label: "Vertical",
          node: (
            <div className="flex h-12 items-center gap-3">
              <span>Left</span>
              <Separator orientation="vertical" />
              <span>Right</span>
            </div>
          ),
        },
      ];
    case "sheet":
      return [
        { label: "Right", node: <SheetDemo /> },
        { label: "Left", node: <SheetDemo side="left" /> },
        { label: "Top", node: <SheetDemo side="top" /> },
        { label: "Bottom", node: <SheetDemo side="bottom" /> },
      ];
    case "tabs":
      return [
        {
          label: "Default",
          node: (
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">A</TabsTrigger>
                <TabsTrigger value="b">B</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Content A</TabsContent>
              <TabsContent value="b">Content B</TabsContent>
            </Tabs>
          ),
        },
        {
          label: "Three tabs",
          node: (
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">Account</TabsTrigger>
                <TabsTrigger value="b">Settings</TabsTrigger>
                <TabsTrigger value="c">Billing</TabsTrigger>
              </TabsList>
              <TabsContent value="a">Account content</TabsContent>
            </Tabs>
          ),
        },
      ];

    /* ── Data display ────────────────────────────────────────── */
    case "avatar":
      return [
        {
          label: "With image",
          node: (
            <Avatar className="h-10 w-10">
              <AvatarImage src={IMG} alt="Jane Archer" />
              <AvatarFallback>JA</AvatarFallback>
            </Avatar>
          ),
        },
        {
          label: "Fallback",
          node: (
            <Avatar className="h-10 w-10">
              <AvatarFallback>JA</AvatarFallback>
            </Avatar>
          ),
        },
        {
          label: "Large",
          node: (
            <Avatar className="h-16 w-16 text-lg">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          ),
        },
        {
          label: "Authenticated user",
          node: (
            <UserAvatar
              user={{ name: "Ada Lovelace", email: "ada@arcevo.dev" }}
              items={[
                { label: "Profile", shortcut: `⇧${getModSymbol()}P`, icon: "users" },
                { label: "Settings", shortcut: `${getModSymbol()},`, icon: "settings" },
              ]}
            />
          ),
        },
      ];
    case "avatar-group":
      return [
        {
          label: "Default",
          node: <AvatarGroup avatars={AVATARS} />,
        },
        {
          label: "Small",
          node: <AvatarGroup avatars={AVATARS} size="sm" />,
        },
        {
          label: "Large",
          node: <AvatarGroup avatars={AVATARS} size="lg" />,
        },
        {
          label: "Max 2",
          node: <AvatarGroup avatars={AVATARS} max={2} />,
        },
      ];
    case "card":
      return (
        [
          ...(["default", "glass", "frost", "glow", "ghost", "outline", "elevated", "interactive",
            "tilt", "gradient-border", "zoom"] as const).map((variant) => ({
              label: variant,
              node: (
                <Card variant={variant} className="w-full">
                  <CardHeader>
                    <CardTitle className="capitalize">{variant}</CardTitle>
                    <CardDescription>The {variant} card variant.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {variant === "zoom" ? (
                      <div className="-mx-6 -mt-6 mb-4 overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=300&fit=crop"
                          alt=""
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Card content area.</p>
                    )}
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button size="sm" variant="outline">
                      Action
                    </Button>
                  </CardFooter>
                </Card>
              ),
            })),
          {
            label: "Flip",
            node: (
              <Card variant="flip" className="h-56 w-full" flipDirection="horizontal">
                <div className="flex h-full items-center justify-center rounded-[inherit] bg-card p-6">
                  <CardTitle>Hover (or tap) to flip</CardTitle>
                </div>
                <CardFlipBack>
                  <div className="text-center">
                    <CardTitle>Surprise!</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The back face reveals on hover, and returns on mouse-out.
                    </p>
                  </div>
                </CardFlipBack>
              </Card>
            ),
          },
        ] as { label: string; node: React.ReactNode }[]
      );
    case "table":
      return [
        {
          label: "Default",
          node: (
            <Table className="w-72">
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
                <TableRow>
                  <TableCell>Grace</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ),
        },
        {
          label: "Wide",
          node: (
            <Table className="w-96">
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
            </Table>
          ),
        },
      ];
    case "notification-drawer":
      return [
        {
          label: "Default",
          node: <NotificationDrawer notifications={[]} />,
        },
        {
          label: "With notifications",
          node: <NotificationDrawerToolbarDemo />,
        },
      ];

    /* ── Inputs / forms ──────────────────────────────────────── */
    case "checkbox":
      return [
        {
          label: "Default",
          node: (
            <div className="flex items-center gap-2">
              <Checkbox id="c1" />
              <Label htmlFor="c1">Accept terms</Label>
            </div>
          ),
        },
        {
          label: "Checked",
          node: (
            <div className="flex items-center gap-2">
              <Checkbox id="c2" defaultChecked />
              <Label htmlFor="c2">Checked</Label>
            </div>
          ),
        },
        {
          label: "Disabled",
          node: (
            <div className="flex items-center gap-2">
              <Checkbox id="c3" disabled />
              <Label htmlFor="c3">Disabled</Label>
            </div>
          ),
        },
      ];
    case "combobox":
      return [
        { label: "Default", node: <ComboboxDemo /> },
        {
          label: "Placeholder",
          node: (
            <div className="w-56">
              <Combobox
                options={[{ value: "o1", label: "Option 1" }]}
                placeholder="Choose a framework..."
                label="Framework"
              />
            </div>
          ),
        },
      ];
    case "input":
      return [
        { label: "Default", node: <Input className="w-56" placeholder="Type here..." /> },
        {
          label: "With label",
          node: (
            <div className="grid w-56 gap-1.5">
              <Label htmlFor="in-1">Email</Label>
              <Input id="in-1" placeholder="you@example.com" type="email" />
            </div>
          ),
        },
        { label: "Disabled", node: <Input className="w-56" placeholder="Disabled" disabled /> },
      ];
    case "input-otp":
      return [
        { label: "Default", node: OTP },
        { label: "Separated", node: OTP_SEPARATED },
        {
          label: "Small",
          node: (
            <InputOTP maxLength={4}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          ),
        },
        {
          label: "8-digit",
          node: (
            <InputOTP maxLength={8}>
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
            </InputOTP>
          ),
        },
      ];
    case "label":
      return [
        { label: "Default", node: <Label htmlFor="x">Email</Label> },
        {
          label: "With input",
          node: (
            <div className="grid w-56 gap-1.5">
              <Label htmlFor="lbl">Full name</Label>
              <Input id="lbl" placeholder="Ada Lovelace" />
            </div>
          ),
        },
      ];
    case "radio-group":
      return [
        {
          label: "Default",
          node: (
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
          ),
        },
        {
          label: "Disabled",
          node: (
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="rd" />
                <Label htmlFor="rd">Option A</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="rd2" disabled />
                <Label htmlFor="rd2">Disabled</Label>
              </div>
            </RadioGroup>
          ),
        },
      ];
    case "select":
      return [
        { label: "Default", node: <SelectDemo /> },
        {
          label: "With value",
          node: (
            <Select defaultValue="b">
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Apple</SelectItem>
                <SelectItem value="b">Banana</SelectItem>
              </SelectContent>
            </Select>
          ),
        },
      ];
    case "slider":
      return [
        { label: "Default", node: <Slider defaultValue={[50]} max={100} step={1} className="w-56" /> },
        { label: "Range", node: <Slider defaultValue={[25, 75]} max={100} step={1} className="w-56" /> },
        { label: "Disabled", node: <Slider defaultValue={[50]} max={100} step={1} disabled className="w-56" /> },
      ];
    case "switch":
      return (
        [
          { label: "Off", checked: false },
          { label: "On", checked: true },
          { label: "Disabled", checked: false, disabled: true },
        ] as const
      ).map(({ label, ...props }) => ({
        label,
        node: <Switch {...props} />,
      }));
    case "textarea":
      return [
        { label: "Default", node: <Textarea className="w-56" placeholder="Write something..." /> },
        {
          label: "With label",
          node: (
            <div className="grid w-56 gap-1.5">
              <Label htmlFor="ta-1">Bio</Label>
              <Textarea id="ta-1" placeholder="Tell us about yourself" />
            </div>
          ),
        },
      ];
    case "toggle":
      return (
        [
          { label: "Default", pressed: true, children: "Bold" },
          { label: "Outline", variant: "outline", children: "Italic" },
          {
            label: "With icon",
            children: (
              <>
                <LightIcon name="settings" className="size-4" /> Settings
              </>
            ),
          },
        ] as const
      ).map(({ label, children, ...props }) => ({
        label,
        node: <Toggle {...props}>{children}</Toggle>,
      }));
    case "toggle-group":
      return [
        {
          label: "Single",
          node: (
            <ToggleGroup type="single" defaultValue="a">
              <ToggleGroupItem value="a">A</ToggleGroupItem>
              <ToggleGroupItem value="b">B</ToggleGroupItem>
              <ToggleGroupItem value="c">C</ToggleGroupItem>
            </ToggleGroup>
          ),
        },
        {
          label: "Multiple",
          node: (
            <ToggleGroup type="multiple" defaultValue={["a"]}>
              <ToggleGroupItem value="a">A</ToggleGroupItem>
              <ToggleGroupItem value="b">B</ToggleGroupItem>
              <ToggleGroupItem value="c">C</ToggleGroupItem>
            </ToggleGroup>
          ),
        },
        {
          label: "Outline",
          node: (
            <ToggleGroup type="single" variant="outline" defaultValue="a">
              <ToggleGroupItem value="a">A</ToggleGroupItem>
              <ToggleGroupItem value="b">B</ToggleGroupItem>
            </ToggleGroup>
          ),
        },
      ];

    /* ── Overlays / menus ────────────────────────────────────── */
    case "alert-dialog":
      return [
        {
          label: "Default",
          node: (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ),
        },
        {
          label: "Destructive",
          node: (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Revoke access</Button>
              </AlertDialogTrigger>
              <AlertDialogContent variant="destructive">
                <AlertDialogHeader>
                  <div className="flex items-start gap-3 sm:items-center">
                    <AlertDialogIcon className="mt-0.5 shrink-0 sm:mt-0" />
                    <div className="flex flex-col gap-1.5">
                      <AlertDialogTitle>Revoke API access?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will invalidate all tokens immediately.
                      </AlertDialogDescription>
                    </div>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep access</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Revoke</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ),
        },
        {
          label: "Confirm by typing",
          node: (
            <ConfirmAlertDialog
              entityName="facet"
              entityLabel="workspace"
              confirmPhrase="confirm delete"
              actionLabel="Delete workspace"
              description="This action cannot be undone. Type the workspace name and the confirmation phrase to continue."
              trigger={<Button variant="destructive">Delete workspace</Button>}
            />
          ),
        },
      ];
    case "command":
      return [
        { label: "Default", node: <CommandDemo /> },
        {
          label: "With separator",
          node: (
            <Command className="w-64">
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
            </Command>
          ),
        },
      ];
    case "context-menu":
      return [
        { label: "Default", node: <ContextMenuDemo /> },
        {
          label: "With icons",
          node: (
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="flex h-24 w-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  Right-click
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>Actions</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem>
                  <LightIcon name="copy" className="size-4" /> Copy
                </ContextMenuItem>
                <ContextMenuItem>
                  <LightIcon name="list" className="size-4" /> Paste
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ),
        },
      ];
    case "dialog":
      return [
        { label: "Default", node: <DialogDemo /> },
        {
          label: "With footer",
          node: (
            <Dialog>
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
            </Dialog>
          ),
        },
      ];
    case "dropdown-menu":
      return [
        { label: "Default", node: <DropdownMenuDemo /> },
        {
          label: "With icons",
          node: (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LightIcon name="users" className="size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LightIcon name="settings" className="size-4" /> Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ];
    case "hover-card":
      return [
        { label: "Default", node: <HoverCardDemo /> },
        {
          label: "With content",
          node: (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">@ada</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Ada Lovelace</h4>
                  <p className="text-sm text-muted-foreground">Mathematician and writer.</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          ),
        },
      ];
    case "popover":
      return [
        { label: "Default", node: <PopoverDemo /> },
        {
          label: "With content",
          node: (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">Set the width and height.</p>
                </div>
              </PopoverContent>
            </Popover>
          ),
        },
      ];
    case "tooltip":
      return [
        { label: "Default", node: <TooltipDemo /> },
        {
          label: "Top",
          node: (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover</Button>
                </TooltipTrigger>
                <TooltipContent side="top">Top tooltip</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          label: "Bottom",
          node: (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover</Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Bottom tooltip</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          label: "Left",
          node: (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover</Button>
                </TooltipTrigger>
                <TooltipContent side="left">Left tooltip</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          label: "Right",
          node: (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover</Button>
                </TooltipTrigger>
                <TooltipContent side="right">Right tooltip</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
      ];

    /* ── Ready-to-use ────────────────────────────────────────── */
    case "dropzone":
      return [
        {
          label: "Default",
          node: (
            <div className="w-full max-w-sm">
              <Dropzone label="Drag files here or click to browse" hint="PDF, images, anything" />
            </div>
          ),
        },
        {
          label: "Disabled",
          node: (
            <div className="w-full max-w-sm">
              <Dropzone label="Uploads disabled" disabled />
            </div>
          ),
        },
      ];
    case "color-picker":
      return [
        { label: "Default", node: <ColorPicker value="#6366f1" label="Brand accent" /> },
        {
          label: "Compact",
          node: (
            <div className="flex flex-col gap-2">
              <ColorPicker value="#10b981" compact label="Compact" />
              <span className="text-xs text-muted-foreground">Swatch only</span>
            </div>
          ),
        },
      ];
    case "qrcode":
      return [
        {
          label: "Default",
          node: <QRCode value="https://facet.arcevocirqle.com.ng" size={120} label="facet docs" />,
        },
        {
          label: "Large",
          node: <QRCode value="https://github.com/arcevodev/facet" size={160} label="facet GitHub" />,
        },
        {
          label: "Colored",
          node: <QRCode value="https://facet.arcevocirqle.com.ng" size={120} fgColor="#6366f1" label="branded" />,
        },
        {
          label: "Logo",
          node: (
            <QRCode
              value="https://github.com/arcevodev/facet"
              size={140}
              label="QR with brand logo"
              logo="https://raw.githubusercontent.com/github/explore/main/topics/github/github.png"
              logoSize={32}
              logoPosition="top-right"
            />
          ),
        },
      ];
    case "marquee":
      return [
        {
          label: "Default",
          node: (
            <div className="w-full">
              <Marquee
                duration={16}
                items={["facet", "auth", "tokens", "React 19", "Radix"].map(
                  (word) => (
                    <span key={word} className="whitespace-nowrap text-sm font-medium">
                      {word}
                    </span>
                  ),
                )}
              />
            </div>
          ),
        },
        {
          label: "Cards",
          node: (
            <div className="w-full">
              <Marquee
                duration={20}
                gap="1.25rem"
                items={[
                  "Design tokens",
                  "Icon registry",
                  "Auth flows",
                  "Layout shells",
                  "Docs engine",
                  "CLI tooling",
                ].map((label) => (
                  <Card key={label} className="w-56 shrink-0">
                    <CardHeader>
                      <CardTitle className="text-sm">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        A reusable facet surface that scrolls seamlessly.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              />
            </div>
          ),
        },
        {
          label: "Reverse",
          node: (
            <div className="w-full">
              <Marquee
                duration={16}
                reverse
                items={["A", "B", "C", "D", "E", "F"].map((letter) => (
                  <span
                    key={letter}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
                  >
                    Item {letter}
                  </span>
                ))}
              />
            </div>
          ),
        },
        {
          label: "Pause on hover",
          node: (
            <div className="w-full">
              <Marquee
                duration={18}
                items={["Hover", "to", "pause", "the", "scroll", "motion"].map((word) => (
                  <span
                    key={word}
                    className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                  >
                    {word}
                  </span>
                ))}
              />
            </div>
          ),
        },
      ];
    case "animated":
      return [
        {
          label: "Layers",
          node: (
            <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              <Aurora className="absolute inset-0" opacity={0.75} />
              <Beams count={4} className="absolute inset-0" color="rgba(129,140,248,0.35)" />
              <GridPattern className="absolute inset-0" />
              <p className="relative z-10 text-lg font-bold">Aurora + Beams + Grid</p>
            </div>
          ),
        },
        {
          label: "Spotlight",
          node: (
            <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              <Spotlight className="relative flex h-full w-full items-center justify-center">
                <p className="text-lg font-bold">Move your cursor here</p>
              </Spotlight>
            </div>
          ),
        },
        {
          label: "Sparkle button",
          node: <SparkleButton label="Click me" />,
        },
      ];
    case "text-animations":
      return [
        {
          label: "Blur",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <BlurText text="Blur in, word by word" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
        {
          label: "Wave",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <WaveText text="Wave hello" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
        {
          label: "Flip",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <FlipText text="Flip it" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
        {
          label: "Split / rise",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <SplitText text="Words rise into place" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
        {
          label: "Fade up",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <FadeUpText text="Fade and slide up" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
        {
          label: "Shimmer",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <ShimmerText text="Shimmering headline" className="font-heading text-2xl font-extrabold text-foreground" />
            </div>
          ),
        },
        {
          label: "Gradient",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <GradientText text="Animated gradient" className="font-heading text-2xl font-extrabold" />
            </div>
          ),
        },
        {
          label: "Letter spacing",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <LetterSpacingText text="Hover to expand" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
        {
          label: "Count up",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center gap-6 rounded-lg border border-border bg-background">
              <CountUpText to={64000} separator className="font-heading text-2xl font-bold text-foreground" />
              <CountUpText to={99.5} decimals={1} className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
        {
          label: "Typewriter",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <TypewriterText
                phrases={["one identity", "every door", "your key"]}
                className="font-heading text-xl font-bold text-foreground"
              />
            </div>
          ),
        },
        {
          label: "Fast cycle",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <TypewriterText
                phrases={["build", "ship", "scale"]}
                typeSpeed={45}
                eraseSpeed={25}
                delay={900}
                className="font-heading text-xl font-bold text-foreground"
              />
            </div>
          ),
        },
        {
          label: "Dissolve",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <DissolveText text="Dissolve in, char by char" className="font-heading text-2xl font-bold text-foreground" />
            </div>
          ),
        },
      ];
    case "micro-interactions":
      return [
        {
          label: "Tilt card",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <TiltCard className="w-64 rounded-xl border border-border bg-background p-6 shadow-sm">
                <p className="text-sm font-semibold text-foreground">Move your cursor over me</p>
              </TiltCard>
            </div>
          ),
        },
        {
          label: "Glow card",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <GlowCard className="w-64 rounded-xl border border-border bg-background p-6 shadow-sm">
                <p className="text-sm font-semibold text-foreground">A glow follows your cursor</p>
              </GlowCard>
            </div>
          ),
        },
        {
          label: "Ripple button",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <RippleButton className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
                Click me
              </RippleButton>
            </div>
          ),
        },
        {
          label: "Magnetic button",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <MagneticButton className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
                Magnetic
              </MagneticButton>
            </div>
          ),
        },
        {
          label: "Shine button",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <ShineButton className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
                Shine on hover
              </ShineButton>
            </div>
          ),
        },
        {
          label: "Scroll reveal",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background">
              <ScrollReveal>
                <p className="text-sm font-semibold text-foreground">Reveals as you scroll</p>
              </ScrollReveal>
            </div>
          ),
        },
        {
          label: "Dissolve button",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <DissolveButton className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
                Dissolve
              </DissolveButton>
            </div>
          ),
        },
      ];
    case "animated-button":
      return [
        {
          label: "Shine",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <AnimatedButton animation="shine">Continue</AnimatedButton>
            </div>
          ),
        },
        {
          label: "Sparkle",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <AnimatedButton animation="sparkle">Get started</AnimatedButton>
            </div>
          ),
        },
        {
          label: "Ripple",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <AnimatedButton animation="ripple">Click me</AnimatedButton>
            </div>
          ),
        },
        {
          label: "Magnetic",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <AnimatedButton animation="magnetic">Pull</AnimatedButton>
            </div>
          ),
        },
        {
          label: "None",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <AnimatedButton animation="none">Plain</AnimatedButton>
            </div>
          ),
        },
        {
          label: "Dissolve",
          node: (
            <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
              <AnimatedButton animation="dissolve">Dissolve</AnimatedButton>
            </div>
          ),
        },
      ];
    case "footer":
      return [
        {
          label: "Default",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <Footer
                brand={{ name: "facet", tagline: "The Arcevo UI system" }}
                columns={[
                  {
                    title: "Product",
                    links: [
                      { label: "Components", href: "#" },
                      { label: "Tokens", href: "#" },
                    ],
                  },
                  {
                    title: "Resources",
                    links: [
                      { label: "Docs", href: "#" },
                      { label: "CLI", href: "#" },
                    ],
                  },
                ]}
                socials={[{ label: "GitHub", href: "#", icon: "github" }]}
                bottomLinks={[{ label: "Feedback", href: "#" }]}
                legal="© 2026 facet. MIT License."
              />
            </div>
          ),
        },
        {
          label: "Minimal",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <Footer
                variant="minimal"
                brand={{ name: "facet", tagline: "The Arcevo UI system" }}
                socials={[{ label: "GitHub", href: "#", icon: "github" }]}
                legal="© 2026 facet. MIT License."
              />
            </div>
          ),
        },
        {
          label: "Columns",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <Footer
                variant="columns"
                brand={{ name: "facet", tagline: "The Arcevo UI system" }}
                columns={[
                  { title: "Product", links: [{ label: "Components", href: "#" }, { label: "Tokens", href: "#" }] },
                  { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "CLI", href: "#" }] },
                  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }] },
                ]}
                socials={[{ label: "GitHub", href: "#", icon: "github" }]}
                bottomLinks={[{ label: "Privacy", href: "#" }]}
                legal="© 2026 facet. MIT License."
              />
            </div>
          ),
        },
        {
          label: "Newsletter",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <Footer
                variant="newsletter"
                brand={{ name: "facet", tagline: "The Arcevo UI system" }}
                columns={[
                  { title: "Product", links: [{ label: "Components", href: "#" }] },
                  { title: "Resources", links: [{ label: "Docs", href: "#" }] },
                ]}
                newsletter={{
                  title: "Stay in the loop",
                  description: "Product updates, straight to your inbox.",
                  buttonLabel: "Subscribe",
                }}
                socials={[{ label: "GitHub", href: "#", icon: "github" }]}
                legal="© 2026 facet. MIT License."
              />
            </div>
          ),
        },
        {
          label: "Split",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <Footer
                variant="split"
                brand={{ name: "facet", tagline: "The Arcevo UI system" }}
                columns={[
                  { title: "Product", links: [{ label: "Components", href: "#" }, { label: "Tokens", href: "#" }] },
                  { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "CLI", href: "#" }] },
                  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }] },
                  { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
                ]}
                socials={[{ label: "GitHub", href: "#", icon: "github" }]}
                legal="© 2026 facet. MIT License."
              />
            </div>
          ),
        },
        {
          label: "Streamline",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <Footer
                variant="streamline"
                brand={{ name: "facet", tagline: "The Arcevo UI system" }}
                columns={[
                  { title: "Product", links: [{ label: "Components", href: "#" }, { label: "Tokens", href: "#" }] },
                  { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "CLI", href: "#" }] },
                ]}
                socials={[{ label: "GitHub", href: "#", icon: "github" }]}
                notices={[<span key="research">Research notice: We log anonymous usage to improve docs.</span>]}
                steps={[
                  { number: "1", label: "Sign up", description: "Create a free account" },
                  { number: "2", label: "Build", description: "Start composing" },
                  { number: "3", label: "Ship", description: "Go live" },
                ]}
                legal="© 2026 facet. MIT License."
              />
            </div>
          ),
        },
      ];
    case "feedback-page":
      return [
        {
          label: "Default",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <FeedbackPage
                title="Feedback & contact"
                description="Found a bug? Want a feature? We read everything."
                email="hello@arcevo.com"
                channels={[
                  {
                    label: "WhatsApp",
                    href: "#",
                    icon: "message-circle",
                    description: "Chat with us directly",
                  },
                ]}
              />
            </div>
          ),
        },
      ];
    case "not-found":
      return [
        {
          label: "Gradient",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <NotFound animation="gradient" />
            </div>
          ),
        },
        {
          label: "Shimmer",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <NotFound animation="shimmer" />
            </div>
          ),
        },
        {
          label: "Aurora",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <NotFound animation="aurora" />
            </div>
          ),
        },
        {
          label: "Custom",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-4">
              <NotFound
                animation="none"
                title="Resource unavailable"
                description="We couldn't load the content you requested. Try again in a few minutes or reach out to support."
                actionLabel="Contact support"
                actionHref="/contact"
                actionIcon={
                  <span className="text-xl" aria-hidden>
                    &#8249;
                  </span>
                }
              />
            </div>
          ),
        },
      ];
    case "roadmap":
      return [
        { label: "Default", node: <Roadmap items={ROADMAP_ITEMS} /> },
        {
          label: "Timeline",
          node: <Roadmap items={ROADMAP_ITEMS} variant="timeline" />,
        },
        {
          label: "No line",
          node: <Roadmap items={ROADMAP_ITEMS} showLine={false} />,
        },
      ];
    case "form":
      return [
        {
          label: "Basic form",
          node: <BasicFormDemo />,
        },
        {
          label: "With validation",
          node: <ValidatedFormDemo />,
        },
      ];
    case "data-table":
      return [
        {
          label: "Default",
          node: <DataTable columns={DEMO_COLUMNS} data={DEMO_ROWS} />,
        },
        {
          label: "Searchable",
          node: <DataTable columns={DEMO_COLUMNS} data={DEMO_ROWS} searchable />,
        },
        {
          label: "Selectable",
          node: <DataTable columns={DEMO_COLUMNS} data={DEMO_ROWS} selectable />,
        },
        {
          label: "Toolbar",
          node: (
            <DataTable
              columns={DEMO_COLUMNS}
              data={DEMO_ROWS}
              searchable
              selectable
              exportable
              exporters={[{ key: "json", label: "JSON", export: () => {} }]}
              actions={[{ key: "mark", label: "Mark all as read", action: () => {} }]}
            />
          ),
        },
        {
          label: "Rows per page",
          node: (
            <DataTable
              columns={DEMO_COLUMNS}
              data={DEMO_ROWS}
              pagination
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
            />
          ),
        },
      ];
    case "date-picker":
      return [
        {
          label: "Default",
          node: (
            <div className="max-w-xs">
              <DatePicker label="Due date" />
            </div>
          ),
        },
        {
          label: "Horizontal strip",
          node: (
            <div className="max-w-sm">
              <DatePicker label="Pick a day" scrollMode="horizontal" horizontalDays={14} />
            </div>
          ),
        },
      ];
    case "date-input":
      return [
        {
          label: "Default",
          node: (
            <div className="max-w-xs">
              <DateInput label="Start date" value="2026-03-05" />
            </div>
          ),
        },
        {
          label: "Native",
          node: (
            <div className="max-w-xs">
              <DateInput label="Due date" native />
            </div>
          ),
        },
      ];
    case "password-input":
      return [
        {
          label: "Default",
          node: (
            <div className="max-w-xs">
              <PasswordInput label="Password" placeholder="••••••••" />
            </div>
          ),
        },
        {
          label: "No toggle",
          node: (
            <div className="max-w-xs">
              <PasswordInput label="Password" showToggle={false} />
            </div>
          ),
        },
       ];
    case "mail-input":
      return [
        {
          label: "Default",
          node: (
            <div className="max-w-xs">
              <MailInput placeholder="you@example.com" required />
            </div>
          ),
        },
        {
          label: "Custom domains",
          node: (
            <div className="max-w-xs">
              <MailInput
                placeholder="you@example.com"
                domains={["arcevocirqle.com.ng", "gmail.com", "yahoo.com"]}
                required
              />
            </div>
          ),
        },
      ];
    case "number-input":
      return [
        {
          label: "Default",
          node: (
            <div className="max-w-xs">
              <NumberInput label="Quantity" min={0} max={10} />
            </div>
          ),
        },
        {
          label: "With value",
          node: (
            <div className="max-w-xs">
              <NumberInput label="Quantity" value={4} min={0} max={10} />
            </div>
          ),
        },
        {
          label: "Currency",
          node: (
            <div className="max-w-xs">
              <NumberInput label="Amount" value={2500} currency="₦" min={0} />
            </div>
          ),
        },
        {
          label: "Currency picker",
          node: (
            <div className="max-w-xs">
              <NumberInput
                label="Price"
                value={100}
                currency="$"
                currencyPicker
                onCurrencyChange={() => {}}
              />
            </div>
          ),
        },
      ];
    case "country-code-input":
      return [
        {
          label: "Default",
          node: (
            <div className="max-w-xs">
              <CountryCodeInput label="Mobile number" />
            </div>
          ),
        },
        {
          label: "Full ISO list",
          node: (
            <div className="max-w-xs">
              <CountryCodeInput label="Mobile number" countries={ISO_COUNTRY_CODES} />
            </div>
          ),
        },
        {
          label: "Africa only",
          node: (
            <div className="max-w-xs">
              <CountryCodeInput
                label="Mobile number"
                countries={ISO_COUNTRY_CODES}
                includeRegions={["africa"]}
              />
            </div>
          ),
        },
        {
          label: "No Europe",
          node: (
            <div className="max-w-xs">
              <CountryCodeInput
                label="Mobile number"
                countries={ISO_COUNTRY_CODES}
                excludeRegions={["europe"]}
              />
            </div>
          ),
        },
      ];
    case "location-picker":
      return [
        {
          label: "Default",
          node: (
            <div className="max-w-sm">
              <LocationPicker showLocality />
            </div>
          ),
        },
        {
          label: "Without locality",
          node: (
            <div className="max-w-sm">
              <LocationPicker />
            </div>
          ),
        },
        {
          label: "Standalone levels",
          node: (
            <div className="max-w-sm space-y-2">
              <CountryInput />
              <StateInput country="NG" />
              <LGAInput country="NG" region="lagos" />
            </div>
          ),
        },
      ];

    /* ── Auth (@arcevo/facet-auth) ───────────────────────────── */
    case "sign-in":
      return [
        {
          label: "Email + password",
          node: (
            <div className="w-full max-w-md">
              <ArcProvider client={DEMO_CLIENT}>
                <SignIn config={{}} step="login_form" />
              </ArcProvider>
            </div>
          ),
        },
        {
          label: "Magic link",
          node: (
            <div className="w-full max-w-md">
              <ArcProvider client={DEMO_CLIENT}>
                <SignIn config={{ allowMagicLink: true }} step="magic_link_form" />
              </ArcProvider>
            </div>
          ),
        },
        {
          label: "Passkey",
          node: (
            <div className="w-full max-w-md">
              <ArcProvider client={DEMO_CLIENT}>
                <SignIn config={{ allowPasskey: true }} step="passkey_auth" />
              </ArcProvider>
            </div>
          ),
        },
        {
          label: "OAuth",
          node: (
            <div className="w-full max-w-md">
              <ArcProvider client={DEMO_CLIENT}>
                <SignIn config={{ oauthProviders: ["google", "github"] }} step="login_form" />
              </ArcProvider>
            </div>
          ),
        },
        {
          label: "Forgot password",
          node: (
            <div className="w-full max-w-md">
              <ArcProvider client={DEMO_CLIENT}>
                <SignIn config={{}} step="forgot_password" />
              </ArcProvider>
            </div>
          ),
        },
      ];
    /* ── Layout (@arcevo/facet-layout) ───────────────────────── */
    case "console-layout":
      return [
        {
          label: "Full",
          node: (
            <div className="h-96 w-full">
              <ConsoleLayout config={defaultLayoutPreset} mode="full">
                <div className="p-6 text-sm text-muted-foreground">Content area</div>
              </ConsoleLayout>
            </div>
          ),
        },
        {
          label: "Rail",
          node: (
            <div className="h-96 w-full">
              <ConsoleLayout config={defaultLayoutPreset} mode="rail">
                <div className="p-6 text-sm text-muted-foreground">Content area</div>
              </ConsoleLayout>
            </div>
          ),
        },
      ];
    case "auth-layout":
      return [
        {
          label: "Fintech",
          node: (
            <div className="h-96 w-full overflow-hidden rounded-md border border-border">
              <AuthLayout config={fintechLayoutPreset}>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Sign in</p>
                  <div className="space-y-2">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      placeholder="you@company.com"
                    />
                    <input
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      placeholder="Password"
                      type="password"
                    />
                  </div>
                  <Button className="w-full">Sign in</Button>
                </div>
              </AuthLayout>
            </div>
          ),
        },
        {
          label: "Default",
          node: (
            <div className="h-96 w-full overflow-hidden rounded-md border border-border">
              <AuthLayout config={defaultLayoutPreset}>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Sign in</p>
                  <div className="space-y-2">
                    <input
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      placeholder="you@company.com"
                    />
                    <input
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      placeholder="Password"
                      type="password"
                    />
                  </div>
                  <Button className="w-full">Sign in</Button>
                </div>
              </AuthLayout>
            </div>
          ),
        },
        {
          label: "Custom brand panel",
          node: (
            <div className="h-96 w-full overflow-hidden rounded-md border border-border">
              <AuthLayout
                config={fintechLayoutPreset}
                brandPanel={
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
                    <p className="px-4 text-2xl font-bold text-white">
                      Slideshow / video / Lottie goes here
                    </p>
                  </div>
                }
              >
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Sign in</p>
                  <Button className="w-full">Sign in</Button>
                </div>
              </AuthLayout>
            </div>
          ),
        },
      ];
    case "landing-layout":
      return [
        {
          label: "Default",
          node: (
            <div className="h-96 w-full overflow-hidden rounded-md border border-border">
              <LandingLayout
                nav={
                  <Navbar
                    variant="pill"
                    brand={<span className="font-semibold">facet</span>}
                    links={[{ href: "#", label: "Features" }]}
                  />
                }
                hero={
                  <div className="flex flex-col items-center gap-4 text-center">
                    <h1 className="font-heading text-4xl font-bold text-foreground">Build faster</h1>
                    <p className="max-w-md text-muted-foreground">A glassmorphic hero.</p>
                    <Button className="glow-indigo">Get started</Button>
                  </div>
                }
              >
                <div className="px-8 py-12">Marketing content</div>
              </LandingLayout>
            </div>
          ),
        },
      ];
    case "sidebar":
      return [
        {
          label: "Expanded",
          node: (
            <div className="h-96 w-full overflow-hidden rounded-md border border-border">
              <LayoutProvider>
                <Sidebar config={fintechLayoutPreset} />
              </LayoutProvider>
            </div>
          ),
        },
      ];
    case "topbar":
      return [
        {
          label: "Default",
          node: (
            <div className="w-full overflow-hidden rounded-md border border-border">
              <LayoutProvider>
                <Topbar />
              </LayoutProvider>
            </div>
          ),
        },
      ];

    case "billing-page":
      return [
        {
          label: "Card grid",
          node: (
            <div className="w-full overflow-x-auto rounded-lg border border-border p-4">
              <div className="min-w-0 lg:min-w-[1152px]">
                <BillingPage config={{ plans: BILLING_PLANS, title: "Pricing", annualDiscountNote: "Save up to 30% with quarterly · ~16% with yearly" }} />
              </div>
            </div>
          ),
        },
      ];
    case "billing-page-table":
      return [
        {
          label: "Comparison",
          node: (
            <div className="w-full overflow-x-auto rounded-lg border border-border p-4">
              <BillingPageTable
                config={{ plans: BILLING_PLANS, title: "Compare plans", annualDiscountNote: "Save up to 30% with quarterly · ~16% with yearly" }}
                rows={[
                  { label: "Projects", supports: { free: true, pro: true, team: true, enterprise: true } },
                  { label: "SSO", supports: { free: false, pro: true, team: true, enterprise: true } },
                  { label: "Audit log", supports: { free: false, pro: "7 days", team: true, enterprise: true } },
                  { label: "On-prem", supports: { free: false, pro: false, team: false, enterprise: true } },
                ]}
              />
            </div>
          ),
        },
      ];
    case "billing-page-freemium":
      return [
        {
          label: "Freemium",
          node: (
            <div className="w-full overflow-x-auto rounded-lg border border-border p-4">
              <BillingPageFreemium
                config={{ plans: BILLING_PLANS, title: "Start free, scale when you're ready", annualDiscountNote: "Save up to 30% with quarterly · ~16% with yearly" }}
                heroPlanId="pro"
              />
            </div>
          ),
        },
      ];

    case "card-animations":
      return [
        {
          label: "Flip card",
          node: (
            <div className="flex min-h-64 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <FlipCard
                className="w-64"
                front={
                  <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-background">
                    <p className="font-medium text-foreground">Front</p>
                  </div>
                }
                back={
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <p className="font-medium">Back</p>
                  </div>
                }
              />
            </div>
          ),
        },
        {
          label: "Spotlight card",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <SpotlightCard className="w-64 rounded-xl border border-border bg-background p-6">
                <p className="text-sm font-semibold text-foreground">Move your cursor over me</p>
              </SpotlightCard>
            </div>
          ),
        },
        {
          label: "Border beam",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <BorderBeamCard className="w-64">
                <div className="rounded-xl p-6">
                  <p className="text-sm font-semibold text-foreground">Animated border</p>
                </div>
              </BorderBeamCard>
            </div>
          ),
        },
        {
          label: "Shine card",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <ShineCard className="w-64 rounded-xl border border-border bg-background p-6">
                <p className="text-sm font-semibold text-foreground">Hover for a sheen</p>
              </ShineCard>
            </div>
          ),
        },
        {
          label: "Gradient border",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <GradientBorderCard className="w-64">
                <div className="rounded-xl p-6">
                  <p className="text-sm font-semibold text-foreground">Gradient border</p>
                </div>
              </GradientBorderCard>
            </div>
          ),
        },
        {
          label: "Reveal card",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <RevealCard className="w-64 rounded-xl border border-border bg-background p-6">
                <p className="text-sm font-semibold text-foreground">Scroll to reveal</p>
              </RevealCard>
            </div>
          ),
        },
        {
          label: "Hover scale",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <HoverScaleCard className="w-64 rounded-xl border border-border bg-background p-6">
                <p className="text-sm font-semibold text-foreground">Hover to scale</p>
              </HoverScaleCard>
            </div>
          ),
        },
        {
          label: "Magnetic card",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <MagneticCard className="w-64 rounded-xl border border-border bg-background p-6">
                <p className="text-sm font-semibold text-foreground">It pulls toward your cursor</p>
              </MagneticCard>
            </div>
          ),
        },
        {
          label: "Dissolve card",
          node: (
            <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <DissolveCard className="w-64 rounded-xl border border-border bg-background p-6">
                <p className="text-sm font-semibold text-foreground">Dissolves in on mount</p>
              </DissolveCard>
            </div>
          ),
        },
      ];

    case "otp-verification-card":
      return [
        {
          label: "Default",
          node: (
            <div className="flex min-h-64 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <OtpVerificationCard onVerify={() => {}} />
            </div>
          ),
        },
        {
          label: "With resend",
          node: (
            <div className="flex min-h-64 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <OtpVerificationCard onVerify={() => {}} onResend={() => {}} length={4} />
            </div>
          ),
        },
      ];

    case "two-factor-setup-panel":
      return [
        {
          label: "Setup flow",
          node: (
            <div className="flex min-h-96 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <TwoFactorSetupPanel
                otpauthUri="otpauth://totp/Example:ada@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
                secret="JBSWY3DPEHPK3PXP"
                onConfirm={async () => {}}
                recoveryCodes={["1111 2222", "3333 4444", "5555 6666", "7777 8888"]}
              />
            </div>
          ),
        },
      ];

    case "password-strength-meter":
      return [
        {
          label: "Empty",
          node: (
            <div className="flex min-h-32 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <PasswordStrengthMeter value="" className="w-64" />
            </div>
          ),
        },
        {
          label: "Weak",
          node: (
            <div className="flex min-h-32 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <PasswordStrengthMeter value="abc" className="w-64" />
            </div>
          ),
        },
        {
          label: "Strong",
          node: (
            <div className="flex min-h-32 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
              <PasswordStrengthMeter value="P@ssw0rd!123" className="w-64" />
            </div>
          ),
        },
      ];

    case "api-key-manager":
      return [
        {
          label: "With keys",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <ApiKeyManager
                keys={[
                  { id: "1", name: "Staging server", last4: "3f2a", prefix: "facet_live", scopes: ["read"], createdAt: "2026-08-01T00:00:00Z" },
                  { id: "2", name: "CI", last4: "8b1c", prefix: "facet_live", scopes: ["read", "write"], createdAt: "2026-07-20T00:00:00Z", expiresAt: "2026-10-20T00:00:00Z" },
                ]}
                onCreate={async () => ({ secret: "facet_live_abc123" })}
                onRevoke={() => {}}
              />
            </div>
          ),
        },
      ];

    case "invite-team-form":
      return [
        {
          label: "Default",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <InviteTeamForm onInvite={async () => {}} />
            </div>
          ),
        },
      ];

    case "account-settings-panel":
      return [
        {
          label: "Profile + security",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <AccountSettingsPanel
                sections={[
                  { id: "profile", label: "Profile", icon: "user" },
                  { id: "security", label: "Security", icon: "shield" },
                ]}
                content={{
                  profile: (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Display name</p>
                      <p className="text-sm text-muted-foreground">Ada Lovelace</p>
                      <Button size="sm">Edit profile</Button>
                    </div>
                  ),
                  security: (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Two-factor authentication</p>
                      <p className="text-sm text-muted-foreground">Enabled</p>
                    </div>
                  ),
                }}
              />
            </div>
          ),
        },
      ];

    case "security-section-card":
      return [
        {
          label: "Security grid",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <SecuritySectionCard
                features={[
                  { id: "mfa", title: "Two-factor authentication", description: "Protect your account with an authenticator app", icon: "lock" },
                  { id: "passkeys", title: "Passkeys", description: "Passwordless sign-in with WebAuthn", icon: "key" },
                  { id: "sessions", title: "Sessions", description: "View and revoke active sessions", icon: "monitor" },
                ]}
              />
            </div>
          ),
        },
      ];

    case "announcement-bar":
      return [
        {
          label: "Primary",
          node: (
            <div className="w-full rounded-lg border border-border bg-background">
              <AnnouncementBar storageKey="facet-docs-announcement">New: facet 1.7 is here</AnnouncementBar>
            </div>
          ),
        },
      ];

    case "cookie-consent":
      return [
        {
          label: "Banner",
          node: (
            <div className="relative flex min-h-48 w-full items-end justify-center rounded-lg border border-border bg-background p-6">
              <CookieConsent
                storageKey="facet-docs-cookie-consent"
                position="bottom"
                alwaysShow
                className="static inset-auto p-0"
              />
            </div>
          ),
        },
      ];

    case "testimonial-showcase":
      return [
        {
          label: "Grid",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <TestimonialShowcase
                testimonials={[
                  { quote: "The auth forms alone saved us weeks.", author: "Ada", role: "CTO, Finly", initials: "A" },
                  { quote: "Every surface is composable and themeable.", author: "Grace", role: "Engineer, Nimbus", initials: "G" },
                  { quote: "The docs are a joy to explore.", author: "Alan", role: "Founder, Turing Labs", initials: "T" },
                ]}
              />
            </div>
          ),
        },
        {
          label: "Carousel",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <TestimonialShowcase
                mode="carousel"
                testimonials={[
                  { quote: "The auth forms alone saved us weeks.", author: "Ada", role: "CTO, Finly", initials: "A" },
                  { quote: "Every surface is composable and themeable.", author: "Grace", role: "Engineer, Nimbus", initials: "G" },
                  { quote: "The docs are a joy to explore.", author: "Alan", role: "Founder, Turing Labs", initials: "T" },
                ]}
              />
            </div>
          ),
        },
      ];

    case "faq-section":
      return [
        {
          label: "Default",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <FaqSection
                className="w-full max-w-lg"
                title="Frequently asked"
                items={[
                  { q: "Is it framework agnostic?", a: "Yes. The core is dependency-free React." },
                  { q: "Can I theme it?", a: "Everything reads from your Tailwind theme tokens." },
                  { q: "Is it accessible?", a: "Yes. All primitives ship with ARIA wiring." },
                ]}
              />
            </div>
          ),
        },
      ];

    case "page-header":
      return [
        {
          label: "With crumbs + actions",
          node: (
            <div className="w-full rounded-lg border border-border bg-background p-6">
              <PageHeader
                title="Profile settings"
                description="Manage your account details and preferences."
                crumbs={[{ label: "Dashboard", href: "#" }, { label: "Settings" }]}
                actions={<Button size="sm">Save changes</Button>}
              />
            </div>
          ),
        },
      ];

    case "stat-card":
      return [
        {
          label: "Positive delta",
          node: (
            <div className="flex min-h-32 w-full items-center justify-center gap-4 rounded-lg border border-border bg-background p-6">
              <StatCard label="Monthly revenue" value="$48,290" delta={12.4} hint="vs last month" className="w-56" />
            </div>
          ),
        },
        {
          label: "Negative delta",
          node: (
            <div className="flex min-h-32 w-full items-center justify-center gap-4 rounded-lg border border-border bg-background p-6">
              <StatCard label="Churn rate" value="2.1%" delta={-0.4} hint="vs last month" className="w-56" />
            </div>
          ),
        },
      ];

    case "activity-feed":
      return [
        {
          label: "Grouped by day",
          node: (
            <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
              <ActivityFeed
                className="w-full max-w-md"
                items={[
                  { id: "1", title: "Ada signed in", description: "From a new device", timestamp: new Date().toISOString(), icon: "log-in" },
                  { id: "2", title: "API key created", description: "Staging server", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), icon: "key" },
                  { id: "3", title: "Password changed", timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), icon: "shield" },
                ]}
              />
            </div>
          ),
        },
      ];

    default:
      return undefined;
  }
}

/** Renders the live preview cell for a slug + variant label. Exported so
 * InteractiveDemo can lazy-load this module (and its heavy preview graph)
 * only when a demo actually renders. */
export function VariantPreview({
  slug,
  label,
}: {
  slug: string;
  label: string | undefined;
}): React.ReactNode {
  const cells = variantCells(slug);
  const cell = cells?.find((c) => c.label === label) ?? cells?.[0];
  return cell ? cell.node : null;
}

function BasicFormDemo() {
  const form = useForm<{ name: string; email: string }>({
    defaultValues: { name: "", email: "" },
  });
  return (
    <div className="w-full max-w-sm">
      <Form form={form} onSubmit={() => {}}>
        <FormField name="name" label="Name" required>
          <Input placeholder="Ada Lovelace" />
        </FormField>
        <FormField name="email" label="Email" required>
          <Input placeholder="ada@example.com" type="email" />
        </FormField>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}

function ValidatedFormDemo() {
  const form = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });
  return (
    <div className="w-full max-w-sm">
      <Form form={form} onSubmit={() => {}}>
        <FormField name="email" label="Work email" required>
          <Input placeholder="you@company.com" type="email" />
        </FormField>
        <Button type="submit">Continue</Button>
      </Form>
    </div>
  );
}
