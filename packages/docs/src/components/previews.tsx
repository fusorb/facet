import { useState } from "react";
import { LightIcon } from "@fusorb/facet-components/light";
import {
   Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Pill,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Alert,
  AlertTitle,
  AlertDescription,
  AvatarGroup,
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserAvatar,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Checkbox,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Kbd,
  getModSymbol,
  Label,
  MailInput,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
  EmptyState,
  ButtonGroup,
  Combobox,
  Navbar,
  NotificationDrawer,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogIcon,
  ConfirmAlertDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  ScrollArea,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  ScrollBar,
  Toaster,
  BlurText,
  TiltCard,
  Aurora,
  Beams,
  GridPattern,
  AnimatedButton,
  FlipCard,
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
  AspectRatio,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselDots,
  CarouselPrevious,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  InputGroup,
  InputGroupAddon,
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
  StepperNav,
  StepperFooter,
  StepperProvider,
  useStepper,
  KanbanBoard,
  useKanban,
  ChangelogList,
  Chart,
  ChartRangeSelector,
  ConsentCapture,
  CookieBanner,
  DataTable,
  DateRangePicker,
  EmptyStatePage,
  GlowBorderCard,
  MentionInput,
  MultiCombobox,
  OtpInput,
  PhoneInput,
  PricingComparison,
  QrScanner,
  RangeSlider,
  RatingInput,
  RichTextEditor,
  ShineBorderCard,
  TagInput,
  Tree,
  WizardFormPage,
} from "@fusorb/facet-components";
import {
  DropzoneDemo,
  ColorPickerDemo,
  QRCodeDemo,
  MarqueeDemo,
  RoadmapDemo,
  FormDemo,
  DataTableDemo,
  DatePickerDemo,
  NumberInputDemo,
  CountryCodeInputDemo,
  LocationPickerDemo,
  DateInputDemo,
  PasswordInputDemo,
  InfiniteScrollDemo,
} from "./ReadyToUseDemos.js";
import { ArcProvider, SignIn, SignUp, Guard, LoginForm, MfaVerifyForm } from "@fusorb/facet-auth";
import { ArcIdClient } from "@fusorb/facet-sdk";
import {
  ConsoleLayout,
  AuthLayout,
  LandingLayout,
  Sidebar,
  Topbar,
  LayoutProvider,
  defaultLayoutPreset,
  fintechLayoutPreset,
} from "@fusorb/facet-layout";

/** No network: bootstrap stays signed out because no token is stored. */
const DEMO_CLIENT = new ArcIdClient({ baseUrl: "https://demo.invalid" });

const IMG =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces";

export interface PreviewOptions {
  variant?: string;
  size?: string;
}

/** Interactive Sheet preview: pick a side, then open. */
function SheetPreview() {
  const [side, setSide] = useState<"left" | "right" | "top" | "bottom">("right");
  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(["left", "right", "top", "bottom"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            aria-pressed={side === s}
            className={`rounded-md border border-border px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
              side === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open from {side}</Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Sheet</SheetTitle>
            <SheetDescription>Slides in from the {side}.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Compact static demo for a component slug (shared by sidebar + pages). */
export function ComponentPreview({ slug, variant = "default", size = "default" }: { slug: string } & PreviewOptions) {
  switch (slug) {
    case "button":
      return <Button variant={variant as never} size={size as never}>Button</Button>;
    case "badge":
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={variant as never}>Default</Badge>
          <Badge icon={<LightIcon name="sparkles" className="size-3" />}>New</Badge>
          <Badge variant="success" iconOnly icon={<LightIcon name="check" className="size-3.5" />} aria-label="Verified" />
        </div>
      );
    case "pill":
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Pill>Default</Pill>
          <Pill color="primary">Primary</Pill>
          <Pill color="success" selected>
            Success
          </Pill>
          <Pill color="destructive" removable onRemove={() => {}}>
            Dismissible
          </Pill>
        </div>
      );
    case "card":
      return (
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Card</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
    case "accordion":
      return (
        <Accordion type="single" collapsible className="w-64">
          <AccordionItem value="a">
            <AccordionTrigger>Item A</AccordionTrigger>
            <AccordionContent>Content A</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Item B</AccordionTrigger>
            <AccordionContent>Content B</AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    case "alert":
      return (
        <div className="flex w-80 flex-col gap-3">
          <Alert>
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>Default alert</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Destructive alert</AlertDescription>
          </Alert>
        </div>
      );
    case "avatar":
      return (
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src={IMG} alt="Jane Archer" />
            <AvatarFallback>JA</AvatarFallback>
          </Avatar>
          <Avatar className="h-10 w-10">
            <AvatarFallback>JA</AvatarFallback>
          </Avatar>
          <Avatar className="h-16 w-16 text-lg">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <UserAvatar
            user={{
              name: "Ada Lovelace",
              email: "ada@fusorb.dev",
              memberships: [{ tenantId: "1", name: "Arcevo" }],
            }}
            items={[
              { label: "Profile", shortcut: `⇧${getModSymbol()}P`, icon: "users" },
              { label: "Settings", shortcut: `${getModSymbol()},`, icon: "settings" },
            ]}
          />
        </div>
      );
    case "avatar-group":
      return (
        <AvatarGroup
          avatars={[
            { src: IMG, alt: "a", fallback: "A" },
            { fallback: "B" },
            { fallback: "C" },
          ]}
        />
      );
    case "breadcrumb":
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
    case "button-group":
      return (
        <ButtonGroup>
          <Button size="sm">Left</Button>
          <Button size="sm">Middle</Button>
          <Button size="sm">Right</Button>
        </ButtonGroup>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <Checkbox id="c1" />
          <Label htmlFor="c1">Accept terms</Label>
        </div>
      );
    case "collapsible":
      return (
        <Collapsible className="w-72">
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
            Collapsible content
          </CollapsibleContent>
        </Collapsible>
      );
    case "combobox":
      return (
        <div className="w-72">
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
    case "input":
      return <Input className="w-72" placeholder="Type here..." />;
    case "input-otp":
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
    case "kbd":
      return (
        <Kbd>
          {getModSymbol()}K
        </Kbd>
      );
    case "label":
      return <Label htmlFor="x">Email</Label>;
    case "progress":
      return <Progress value={60} className="w-72" />;
    case "radio-group":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <RadioGroup defaultValue="a">
              <RadioGroupItem value="a" id="ra" />
            </RadioGroup>
            <Label htmlFor="ra">Option A</Label>
          </div>
        </div>
      );
    case "select":
      return (
        <Select>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Apple</SelectItem>
            <SelectItem value="b">Banana</SelectItem>
          </SelectContent>
        </Select>
      );
    case "separator":
      return (
        <div className="flex w-72 flex-col gap-2">
          <span>Above</span>
          <Separator />
          <span>Below</span>
        </div>
      );
    case "skeleton":
      return (
        <div className="flex w-72 flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );
    case "slider":
      return <Slider defaultValue={[50]} max={100} step={1} className="w-72" />;
    case "spinner":
      return <Spinner />;
    case "switch":
      return (
        <div className="flex items-center gap-2">
          <Switch id="s1" />
          <Label htmlFor="s1">Enable</Label>
        </div>
      );
    case "tabs":
      return (
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Content A</TabsContent>
          <TabsContent value="b">Content B</TabsContent>
        </Tabs>
      );
    case "textarea":
      return <Textarea className="w-72" placeholder="Write something..." />;
    case "toggle":
      return <Toggle aria-label="Bold">B</Toggle>;
    case "toggle-group":
      return (
        <ToggleGroup type="single" defaultValue="a">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      );
    case "table":
      return (
        <Table className="w-80">
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
    case "pagination":
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
    case "empty-state":
      return <EmptyState title="No results" description="Try a different filter." />;
    case "tooltip":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    case "popover":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open</Button>
          </PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );
    case "dropdown-menu":
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
    case "sheet":
      return <SheetPreview />;
    case "dialog":
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
    case "alert-dialog":
      return (
        <div className="flex flex-wrap items-center justify-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent variant="destructive">
              <AlertDialogHeader>
                <div className="flex items-start gap-3 sm:items-center">
                  <AlertDialogIcon className="mt-0.5 shrink-0 sm:mt-0" />
                  <div className="flex flex-col gap-1.5">
                    <AlertDialogTitle>Delete account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone. Your account, data, and memberships will be
                      permanently removed.
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ConfirmAlertDialog
            entityName="facet"
            entityLabel="workspace"
            confirmPhrase="confirm delete"
            actionLabel="Delete workspace"
            trigger={<Button variant="destructive">Delete workspace</Button>}
          />
        </div>
      );
    case "command":
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
    case "hover-card":
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">Hover</Button>
          </HoverCardTrigger>
          <HoverCardContent>Hover card content</HoverCardContent>
        </HoverCard>
      );
    case "scroll-area":
      return (
        <ScrollArea className="h-32 w-72 rounded-md border border-border p-3">
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="py-0.5 text-sm">
              Line {i + 1}
            </p>
          ))}
          <ScrollBar />
        </ScrollArea>
      );
    case "context-menu":
      return (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex h-24 w-72 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
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
    case "menubar":
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
    case "navigation-menu":
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
    case "navbar":
      return (
        <div className="w-full max-w-lg">
          <Navbar
            variant="sticky"
            brand={<span className="font-semibold">facet</span>}
            links={[
              { href: "#", label: "Features" },
              { href: "#", label: "Docs" },
            ]}
          />
        </div>
      );
    case "notification-drawer":
      return <NotificationDrawer />;
    case "sonner":
      return <Toaster richColors position="top-right" />;
    case "dropzone":
      return <DropzoneDemo />;
    case "color-picker":
      return <ColorPickerDemo />;
    case "qrcode":
      return <QRCodeDemo />;
    case "marquee":
      return <MarqueeDemo variant={variant as "loop" | "strip"} />;
    case "roadmap":
      return <RoadmapDemo />;
    case "form":
      return <FormDemo />;
    case "data-table":
      return <DataTableDemo />;
    case "date-picker":
      return <DatePickerDemo />;
    case "number-input":
      return <NumberInputDemo />;
    case "location-picker":
      return <LocationPickerDemo />;
    case "country-code-input":
      return <CountryCodeInputDemo />;
    case "date-input":
      return <DateInputDemo />;
    case "password-input":
      return <PasswordInputDemo />;
    case "mail-input":
      return (
        <div className="max-w-xs">
          <MailInput placeholder="you@example.com" required />
          <p className="mt-2 text-xs text-muted-foreground">
            Type @ to see domain suggestions.
          </p>
        </div>
      );
    case "infinite-scroll":
      return <InfiniteScrollDemo />;
    case "sign-in":
      return (
        <div className="w-full max-w-md">
          <ArcProvider client={DEMO_CLIENT}>
            <SignIn config={{ allowMagicLink: true, allowPasskey: true }} />
          </ArcProvider>
        </div>
      );
    case "sign-up":
      return (
        <div className="w-full max-w-md">
          <ArcProvider client={DEMO_CLIENT}>
            <SignUp config={{ allowPasskey: true, allowMagicLink: true }} />
          </ArcProvider>
        </div>
      );
    case "mfa-dialog":
      return (
        <ArcProvider client={DEMO_CLIENT}>
          <MfaVerifyForm onVerify={async () => {}} onRecovery={() => {}} onCancel={() => {}} />
        </ArcProvider>
      );
    case "guard":
      return (
        <div className="w-full max-w-md">
          <ArcProvider client={DEMO_CLIENT}>
            <Guard fallback={<SignIn />}>
              <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                Signed in content would render here.
              </div>
            </Guard>
          </ArcProvider>
        </div>
      );
    case "login-form":
      return (
        <div className="w-full max-w-md">
          <ArcProvider client={DEMO_CLIENT}>
            <LoginForm onSubmit={async () => null} validate />
          </ArcProvider>
        </div>
      );
    case "console-layout":
      return (
        <div className="h-96 w-full">
          <ConsoleLayout config={defaultLayoutPreset} mode="full">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Your content renders here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the content area inside ConsoleLayout.
                </p>
              </CardContent>
            </Card>
          </ConsoleLayout>
        </div>
      );
    case "auth-layout":
      return (
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
      );
    case "landing-layout":
      return (
        <div className="h-96 w-full overflow-hidden rounded-md border border-border">
          <LandingLayout
            nav={
              <Navbar
                variant="pill"
                brand={<span className="font-semibold">facet</span>}
                links={[
                  { href: "#", label: "Features" },
                  { href: "#", label: "Docs" },
                ]}
              />
            }
            hero={
              <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="font-heading text-4xl font-bold text-foreground">Build faster</h1>
                <p className="max-w-md text-muted-foreground">
                  A glassmorphic hero with a glow CTA, ready for your marketing site.
                </p>
                <div className="flex gap-3">
                  <Button className="glow-indigo">Get started</Button>
                  <Button variant="outline">Learn more</Button>
                </div>
              </div>
            }
            footer={
              <div className="px-8 py-4 text-sm text-muted-foreground">
                © {new Date().getFullYear()} facet
              </div>
            }
          >
            <div className="px-8 py-12">
              <Card>
                <CardHeader>
                  <CardTitle>Feature section</CardTitle>
                  <CardDescription>Your marketing content goes here.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </LandingLayout>
        </div>
      );
    case "sidebar":
      return (
        <div className="h-96 w-full overflow-visible rounded-md border border-border">
          <LayoutProvider>
            <Sidebar config={fintechLayoutPreset} />
          </LayoutProvider>
        </div>
      );
    case "topbar":
      return (
        <div className="w-full overflow-visible rounded-md border border-border">
          <LayoutProvider>
            <Topbar />
          </LayoutProvider>
        </div>
      );
    case "text-animations":
      return (
        <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
          <BlurText text="Blur in, word by word" className="font-heading text-2xl font-bold text-foreground" />
        </div>
      );
    case "micro-interactions":
      return (
        <div className="flex min-h-48 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
          <TiltCard className="w-64 rounded-xl border border-border bg-background p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Move your cursor over me</p>
          </TiltCard>
        </div>
      );
    case "animated":
      return (
        <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
          <Aurora className="absolute inset-0" opacity={0.75} />
          <Beams count={4} className="absolute inset-0" color="rgba(129,140,248,0.35)" />
          <GridPattern className="absolute inset-0" />
          <p className="relative z-10 text-lg font-bold">Aurora + Beams + Grid</p>
        </div>
      );
    case "animated-button":
      return (
        <div className="flex min-h-24 w-full items-center justify-center rounded-lg border border-border bg-background">
          <AnimatedButton animation="sparkle">Get started</AnimatedButton>
        </div>
      );
    case "card-animations":
      return (
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
      );
    case "otp-verification-card":
      return (
        <div className="flex min-h-64 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
          <OtpVerificationCard onVerify={() => {}} />
        </div>
      );
    case "two-factor-setup-panel":
      return (
        <div className="flex min-h-96 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
          <TwoFactorSetupPanel
            otpauthUri="otpauth://totp/Example:ada@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
            secret="JBSWY3DPEHPK3PXP"
            onConfirm={async () => {}}
            recoveryCodes={["1111 2222", "3333 4444", "5555 6666", "7777 8888"]}
          />
        </div>
      );
    case "password-strength-meter":
      return (
        <div className="flex min-h-32 w-full items-center justify-center rounded-lg border border-border bg-background p-6">
          <PasswordStrengthMeter value="P@ssw0rd!123" className="w-64" />
        </div>
      );
    case "api-key-manager":
      return (
        <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
          <ApiKeyManager
            keys={[
              { id: "1", name: "Staging server", last4: "3f2a", prefix: "facet_live", scopes: ["read"], createdAt: "2026-08-01T00:00:00Z" },
            ]}
            onCreate={async () => ({ secret: "facet_live_abc123" })}
            onRevoke={() => {}}
          />
        </div>
      );
    case "invite-team-form":
      return (
        <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
          <InviteTeamForm onInvite={async () => {}} />
        </div>
      );
    case "account-settings-panel":
      return (
        <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
          <AccountSettingsPanel
            sections={[
              { id: "profile", label: "Profile", icon: "user" },
              { id: "security", label: "Security", icon: "shield" },
            ]}
            content={{
              profile: <p className="text-sm text-muted-foreground">Ada Lovelace</p>,
              security: <p className="text-sm text-muted-foreground">Two-factor enabled</p>,
            }}
          />
        </div>
      );
    case "security-section-card":
      return (
        <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
          <SecuritySectionCard
            features={[
              { id: "mfa", title: "Two-factor authentication", description: "Protect your account with an authenticator app", icon: "lock" },
              { id: "passkeys", title: "Passkeys", description: "Passwordless sign-in with WebAuthn", icon: "key" },
              { id: "sessions", title: "Sessions", description: "View and revoke active sessions", icon: "monitor" },
            ]}
          />
        </div>
      );
    case "announcement-bar":
      return (
        <div className="w-full rounded-lg border border-border bg-background">
          <AnnouncementBar storageKey="facet-docs-announcement">New: facet 1.7 is here</AnnouncementBar>
        </div>
      );
    case "cookie-consent":
      return (
        <div className="relative flex min-h-48 w-full items-end justify-center rounded-lg border border-border bg-background p-6">
          <CookieConsent storageKey="facet-docs-cookie-consent" position="bottom" alwaysShow className="static inset-auto p-0" />
        </div>
      );
    case "testimonial-showcase":
      return (
        <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
          <TestimonialShowcase
            testimonials={[
              { quote: "The auth forms alone saved us weeks.", author: "Ada", role: "CTO, Finly", initials: "A" },
              { quote: "Every surface is composable and themeable.", author: "Grace", role: "Engineer, Nimbus", initials: "G" },
              { quote: "The docs are a joy to explore.", author: "Alan", role: "Founder, Turing Labs", initials: "T" },
            ]}
          />
        </div>
      );
    case "faq-section":
      return (
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
      );
    case "page-header":
      return (
        <div className="w-full rounded-lg border border-border bg-background p-6">
          <PageHeader
            title="Profile settings"
            description="Manage your account details and preferences."
            crumbs={[{ label: "Dashboard", href: "#" }, { label: "Settings" }]}
            actions={<Button size="sm">Save changes</Button>}
          />
        </div>
      );
    case "stat-card":
      return (
        <div className="flex min-h-32 w-full items-center justify-center gap-4 rounded-lg border border-border bg-background p-6">
          <StatCard label="Monthly revenue" value="$48,290" delta={12.4} hint="vs last month" className="w-56" />
        </div>
      );
    case "activity-feed":
      return (
        <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
          <ActivityFeed
            className="w-full max-w-md"
            items={[
              { id: "1", title: "Ada signed in", description: "From a new device", timestamp: new Date().toISOString(), icon: "log-in" },
              { id: "2", title: "API key created", description: "Staging server", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), icon: "key" },
            ]}
          />
        </div>
      );
    case "aspect-ratio": {
      const ratioMap: Record<string, number> = {
        "16:9": 16 / 9,
        "1:1": 1,
        "4:3": 4 / 3,
        "21:9": 21 / 9,
        "3:4": 3 / 4,
      };
      const ratio = ratioMap[variant] ?? 16 / 9;
      const label = variant === "default" ? "16:9" : variant;
      return (
        <div className="w-full max-w-md">
          <AspectRatio ratio={ratio}>
            <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
              {label}
            </div>
          </AspectRatio>
        </div>
      );
    }
    case "carousel":
      return (
        <Carousel className="w-full max-w-md" opts={{ loop: true }}>
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, i) => (
              <CarouselItem key={i}>
                <div className="flex h-44 w-full items-center justify-center rounded-xl border bg-muted text-3xl font-bold text-muted-foreground/50">
                  {i + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          <CarouselDots />
        </Carousel>
      );
    case "drawer":
      return (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer Title</DrawerTitle>
              <DrawerDescription>
                A vaul-based bottom sheet drawer.
              </DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      );
    case "input-group":
      return (
        <div className="w-full max-w-xs space-y-3">
          <InputGroup>
            <InputGroupAddon>
              <span className="text-muted-foreground text-xs font-medium">
                USD
              </span>
            </InputGroupAddon>
            <Input type="text" placeholder="Amount" />
          </InputGroup>
        </div>
      );
    case "resizable": {
      const isVertical = variant === "vertical";
      return (
        <div className="w-full max-w-lg h-64">
          <ResizablePanelGroup
            orientation={isVertical ? "vertical" : "horizontal"}
            className="border"
          >
            <ResizablePanel defaultSize={50}>
              <div
                className={`flex h-full w-full items-center justify-center bg-muted text-sm ${isVertical ? "border-b" : "border-r"}`}
              >
                Panel 1
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className={`flex h-full w-full items-center justify-center border ${isVertical ? "border-t-0" : "border-l-0"} bg-muted text-sm`}>
                Panel 2
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      );
    }
    case "stepper": {
      const stepper = useStepper({
        steps: [
          { id: "account", title: "Account", description: "Pick your workspace" },
          { id: "profile", title: "Profile", description: "Name, email, locale" },
          { id: "verify", title: "Verify", description: "Email + 2FA" },
          { id: "finish", title: "Finish", description: "Review and ship" },
        ],
      });
      return (
        <div className="flex w-full items-start justify-center rounded-lg border border-border bg-background p-6">
          <div className="w-full max-w-2xl">
            <StepperProvider value={stepper}>
              <StepperNav />
              <div className="mt-6 min-h-24 rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                Step content for{" "}
                <span className="font-medium text-foreground">{stepper.current.title}</span>
              </div>
              <StepperFooter />
            </StepperProvider>
          </div>
        </div>
      );
    }
    case "kanban-board": {
      const board = useKanban({
        columns: [
          {
            id: "todo",
            title: "Todo",
            icon: "inbox",
            accent: "#06b6d4",
            cards: [
              { id: "1", title: "Audit SDK coverage", description: "Re-run scripts/audit-sdk-coverage.cjs", tags: ["sdk"], assignee: "Ada" },
              { id: "2", title: "Wire docs engine for changelog", tags: ["docs"] },
              { id: "3", title: "Migrate tokens to electric cyan", tags: ["tokens", "design"] },
            ],
          },
          {
            id: "doing",
            title: "In progress",
            icon: "loader-circle",
            accent: "#a855f7",
            cards: [
              { id: "4", title: "Stepper primitive", description: "Headless useStepper hook + renderers", tags: ["components"], assignee: "Ada" },
              { id: "5", title: "ChangelogList", tags: ["components"] },
            ],
            limit: 5,
          },
          {
            id: "done",
            title: "Done",
            icon: "circle-check",
            accent: "#10b981",
            cards: [
              { id: "6", title: "BillingPage quarterly interval", tags: ["components"], assignee: "Kenny" },
            ],
          },
        ],
      });
      return (
        <div className="w-full overflow-x-auto rounded-lg border border-border bg-background p-4">
          <KanbanBoard board={board} />
        </div>
      );
    }
    case "changelog-list": {
      const releases = [
        {
          version: "1.11.0",
          date: "2026-08-26",
          tag: "release",
          changes: [
            { kind: "added" as const, text: "Stepper primitive (Phase 1 roadmap item)" },
            { kind: "added" as const, text: "KanbanBoard with native HTML5 drag-and-drop" },
            { kind: "added" as const, text: "ChangelogList with filter chips" },
            { kind: "fixed" as const, text: "MFA verify form on the SignIn state machine" },
          ],
        },
        {
          version: "1.10.0",
          date: "2026-08-18",
          tag: "release",
          changes: [
            { kind: "added" as const, text: "AccountSettingsPanel nav component" },
            { kind: "added" as const, text: "SecuritySectionCard grid" },
            { kind: "changed" as const, text: "NotFound component animation API" },
          ],
        },
        {
          version: "1.9.0",
          date: "2026-08-03",
          tag: "release",
          pre: true,
          changes: [
            { kind: "deprecated" as const, text: "Storybook fixtures removed; docs inventory drift gate replaces" },
            { kind: "security" as const, text: "ArcProvider dev-time warning on defaultStorage" },
          ],
        },
      ];
      return (
        <div className="w-full rounded-lg border border-border bg-background p-6">
          <ChangelogList releases={releases} showFilter />
        </div>
      );
    }
    case "chart":
      return (
        <div className="w-full max-w-xl space-y-4 rounded-lg border border-border bg-background p-6">
          <ChartRangeSelector
            presets={[
              { label: "7d", value: "7d" },
              { label: "This month", value: "month" },
              { label: "30d", value: "30d" },
              { label: "90d", value: "90d" },
            ]}
            active="7d"
            onChange={() => {}}
          />
          <Chart
            x={["Mon", "Tue", "Wed", "Thu", "Fri"]}
            series={[
              { id: "sales", label: "Sales", data: [12, 19, 8, 24, 15] },
            ]}
            type="bar"
          />
        </div>
      );
    case "consent-capture":
      return (
        <div className="w-full max-w-lg rounded-lg border border-border bg-background p-6">
          <ConsentCapture
            title="Terms of service"
            body={
              <p className="text-sm leading-relaxed">
                By clicking accept you agree to our Terms of Service and Privacy
                Policy, and consent to the collection and use of your data as
                described therein.
              </p>
            }
            onSubmit={() => {}}
            onReject={() => {}}
          />
        </div>
      );
    case "cookie-banner":
      return (
        <div className="w-full max-w-3xl">
          <CookieBanner onChoose={() => {}} storageKey="facet.cookie-banner-preview" />
        </div>
      );
    case "data-table-page": {
      type Row = { id: string; name: string; email: string; role: string };
      const columns: { key: string; header: string }[] = [
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "role", header: "Role" },
      ];
      const rows: Row[] = [
        { id: "1", name: "Ada Lovelace", email: "ada@fusorb.com", role: "Engineer" },
        { id: "2", name: "Alan Turing", email: "alan@fusorb.com", role: "Designer" },
        { id: "3", name: "Grace Hopper", email: "grace@fusorb.com", role: "Lead" },
      ];
      return (
        <div className="w-full max-w-4xl rounded-lg border border-border bg-background p-6">
          <h3 className="mb-4 text-lg font-semibold">Team members</h3>
          <DataTable columns={columns} data={rows} rowKey="id" density="comfortable" />
        </div>
      );
    }
    case "date-range-picker":
      return (
        <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6">
          <DateRangePicker placeholder="Pick a date range" />
        </div>
      );
    case "empty-state-page":
      return (
        <div className="w-full max-w-xl rounded-lg border border-border bg-background p-6">
          <EmptyStatePage
            icon="inbox"
            title="No projects yet"
            description="Create your first project to get started."
            primaryAction={{ label: "New project", onClick: () => {} }}
            secondaryAction={{ label: "Read the docs", href: "https://arcevo.com" }}
          />
        </div>
      );
    case "glow-border-card":
      return (
        <div className="w-full max-w-sm">
          <GlowBorderCard>
            <div className="p-6">
              <h3 className="font-medium">GlowBorderCard</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A card with a pulsing glow around its border.
              </p>
            </div>
          </GlowBorderCard>
        </div>
      );
    case "mention-input":
      return (
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-6">
          <MentionInput
            value=""
            onChange={() => {}}
            users={[
              { id: "1", name: "Ada Lovelace", handle: "ada" },
              { id: "2", name: "Alan Turing", handle: "alan" },
              { id: "3", name: "Grace Hopper", handle: "grace" },
            ]}
            placeholder="Type a message, use @ to mention someone."
          />
        </div>
      );
    case "multi-combobox":
      return (
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-6">
          <MultiCombobox
            options={[
              { id: "eng", label: "Engineering", description: "Backend & infra" },
              { id: "design", label: "Design", description: "UI/UX" },
              { id: "pm", label: "Product", description: "Roadmap & research" },
            ]}
            value={["eng"]}
            onChange={() => {}}
            placeholder="Pick teams…"
          />
        </div>
      );
    case "otp-input":
      return (
        <div className="w-full max-w-xs rounded-lg border border-border bg-background p-6">
          <OtpInput value="" onChange={() => {}} maxLength={6} />
        </div>
      );
    case "phone-input":
      return (
        <div className="w-full max-w-xs rounded-lg border border-border bg-background p-6">
          <PhoneInput value="" onChange={() => {}} defaultCountryCode="US" />
        </div>
      );
    case "pricing-comparison":
      return (
        <div className="w-full rounded-lg border border-border bg-background p-6">
          <PricingComparison
            title="Simple, honest pricing"
            tiers={[
              { id: "free", name: "Free", price: 0, features: ["Up to 3 projects", "5GB storage"] },
              {
                id: "pro",
                name: "Pro",
                price: 19,
                features: ["Unlimited projects", "100GB storage"],
                highlighted: true,
                badge: "Most popular",
              },
              {
                id: "team",
                name: "Team",
                price: 49,
                features: ["Everything in Pro", "Roles & permissions"],
              },
            ]}
            features={[
              { name: "Projects", values: { free: "3", pro: true, team: true } },
              { name: "Storage", values: { free: "5GB", pro: "100GB", team: "Unlimited" } },
              { name: "Roles", values: { free: false, pro: false, team: true } },
            ]}
          />
        </div>
      );
    case "qr-scanner":
      return (
        <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6">
          <QrScanner onScan={() => {}} autoStart={false} title="Scan a code" />
        </div>
      );
    case "range-slider":
      return (
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-6">
          <RangeSlider value={[20, 80]} onChange={() => {}} min={0} max={100} />
        </div>
      );
    case "rating-input":
      return (
        <div className="w-full max-w-xs rounded-lg border border-border bg-background p-6">
          <RatingInput value={4} onChange={() => {}} label="Rate this component" />
        </div>
      );
    case "rich-text-editor":
      return (
        <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-6">
          <RichTextEditor
            value="<p>Hello world. Try <strong>bold</strong> and <em>italic</em> text.</p>"
            onChange={() => {}}
          />
        </div>
      );
    case "shine-border-card":
      return (
        <div className="w-full max-w-sm">
          <ShineBorderCard>
            <div className="p-6">
              <h3 className="font-medium">ShineBorderCard</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A card with an animated shine along its border.
              </p>
            </div>
          </ShineBorderCard>
        </div>
      );
    case "tag-input":
      return (
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-6">
          <TagInput
            value={["react", "typescript"]}
            onChange={() => {}}
            placeholder="Add a tag…"
            suggestions={["react", "typescript", "nextjs", "tailwind"]}
          />
        </div>
      );
    case "tree":
      return (
        <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6">
          <Tree
            nodes={[
              {
                id: "1",
                label: "Project",
                icon: "folder",
                children: [
                  { id: "1-1", label: "src", icon: "folder" },
                  { id: "1-2", label: "package.json", icon: "file-text" },
                ],
              },
              { id: "2", label: "README.md", icon: "file-text" },
            ]}
            defaultExpandedIds={["1"]}
          />
        </div>
      );
    case "wizard-form-page":
      return (
        <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-6">
          <WizardFormPage
            steps={[
              { id: "account", title: "Account", fields: ["email", "password"] },
              { id: "profile", title: "Profile", fields: ["name"] },
            ]}
            defaultValues={{ email: "", password: "", name: "" }}
            renderField={(name, form) => <Input className="w-full" {...form.register(name)} />}
            onSubmit={() => {}}
          />
        </div>
      );
    default:
      return (
        <div className="text-sm text-muted-foreground">
          Live preview for <code>{slug}</code> is not implemented yet.
        </div>
      );
  }
}
