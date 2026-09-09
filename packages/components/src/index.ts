/**
 * @arcevo/facet-components: Styled shadcn-equivalent UI components
 *
 * These are Layer 2 components: Radix primitives + Alpha Palette styling.
 * No business logic, just polished, accessible UI.
 *
 * Usage:
 *   import { Button, Card, Input } from "@arcevo/facet-components";
 *   import "@arcevo/facet-components/tokens.css";
 */

export { cn, isMac, getModSymbol } from "./utils.js";

/* ── Icon registry ──────────────────────────────────────────── */
export { IconProvider, Icon, registerIcon, resetIconRegistry, getIcon, toKebab } from "./icon/index.js";
export type {
  IconComponent,
  IconName,
  SemanticIconName,
  LucideIconName,
  IconOverrides,
  IconProps,
  IconProviderProps,
} from "./icon/index.js";

/* ── Brand icons (inline SVG, independent of lucide) ─────────── */
export {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  FacebookIcon,
  TiktokIcon,
  WhatsappIcon,
  XIcon,
  TwitterIcon,
  YoutubeIcon,
  SlackIcon,
  DiscordIcon,
  TelegramIcon,
  FigmaIcon,
  SpotifyIcon,
} from "./icon/brand-icons.js";

/* ── Theme system ────────────────────────────────────────────── */
export { ThemeProvider, useTheme, ThemeToggle } from "./theme/index.js";
export type { Theme, ThemeProviderProps, ThemeToggleProps } from "./theme/index.js";

export { type ButtonProps, Button, buttonVariants } from "./ui/button.js";

export { type InputProps, Input } from "./ui/input.js";

export { InputGroup, InputGroupAddon } from "./ui/input-group.js";

export { Label } from "./ui/label.js";

export { type BadgeProps, Badge, badgeVariants } from "./ui/badge.js";

export {
  type PillProps,
  type PillVariant,
  type PillColor,
  type PillRadius,
  type PillSize,
  type PillIndicator,
  type PillGroupProps,
  type PillTriggerProps,
  Pill,
  PillGroup,
  PillTrigger,
  pillVariants,
} from "./ui/pill.js";

export { type AlertProps, Alert, AlertTitle, AlertDescription, alertVariants } from "./ui/alert.js";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  ConfirmAlertDialog,
  AlertDialogIcon,
} from "./ui/alert-dialog.js";
export type {
  ConfirmAlertDialogProps,
  AlertDialogProps,
  AlertDialogContentProps,
  AlertDialogActionProps,
} from "./ui/alert-dialog.js";

export { RadioGroup, RadioGroupItem } from "./ui/radio-group.js";

export { type ToggleProps, Toggle, toggleVariants } from "./ui/toggle.js";

export { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group.js";

export {
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
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from "./ui/menubar.js";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from "./ui/context-menu.js";

export { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card.js";

export { type KbdProps, Kbd } from "./ui/kbd.js";

export { type SpinnerProps, Spinner, spinnerVariants } from "./ui/spinner.js";

export { type EmptyStateProps, EmptyState } from "./ui/empty-state.js";

export { type ButtonGroupProps, ButtonGroup } from "./ui/button-group.js";

export { type AvatarGroupProps, AvatarGroup } from "./ui/avatar-group.js";

export { type ComboboxProps, type ComboboxOption, Combobox } from "./ui/combobox.js";

export {
  type CardProps,
  Card,
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardFlipBack,
} from "./ui/card.js";

export { AspectRatio } from "./ui/aspect-ratio.js";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselDots,
  CarouselPrevious,
  type CarouselApi,
  type CarouselProps,
} from "./ui/carousel.js";

export {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
  useResizable,
  useResizableLayout,
  type ResizablePanelGroupProps,
  type ResizablePanelProps,
  type ResizableHandleProps,
  type ResizableImperativeHandle,
  type ResizableLayoutResult,
} from "./ui/resizable.js";

export { Separator } from "./ui/separator.js";

export { Skeleton } from "./ui/skeleton.js";

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, getInitials } from "./ui/avatar.js";
export type {
  UserAvatarProps,
  UserAvatarUser,
  UserAvatarMenuItem,
} from "./ui/avatar.js";

export { Checkbox } from "./ui/checkbox.js";

export { Switch } from "./ui/switch.js";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogOverlayVariants,
  dialogContentVariants,
} from "./ui/dialog.js";
export type { DialogOverlayProps, DialogContentProps } from "./ui/dialog.js";

export {
  Drawer,
  DrawerTrigger,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./ui/drawer.js";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectSearch,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./ui/select.js";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./ui/popover.js";

export { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs.js";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip.js";

export { Slider } from "./ui/slider.js";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./ui/dropdown-menu.js";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet.js";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./ui/table.js";

export { Textarea } from "./ui/textarea.js";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./ui/breadcrumb.js";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./ui/pagination.js";

export { Progress } from "./ui/progress.js";

export { ScrollArea, ScrollBar } from "./ui/scroll-area.js";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "./ui/input-otp.js";

export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible.js";

export { Toaster } from "./ui/sonner.js";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionItemVariants,
} from "./ui/accordion.js";
export type { AccordionItemProps } from "./ui/accordion.js";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu.js";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./ui/command.js";

export { Navbar, navbarVariants } from "./ui/navbar.js";
export type {
  NavbarProps,
  NavLink,
  NavChildLink,
  NavbarRouter,
  NavbarRouterLinkProps,
} from "./ui/navbar.js";

export { NotificationDrawer } from "./ui/notification-drawer.js";
export type {
  Notification as DrawerNotification,
  NotificationDrawerCopy,
  NotificationDrawerProps,
  NotificationType,
} from "./ui/notification-drawer.js";

/* ── Ready-to-use components ─────────────────────────────────── */
export { type DropzoneProps, Dropzone } from "./ui/dropzone.js";

export {
  type ColorPickerProps,
  ColorPicker,
  normalizeHex,
  isValidHex,
} from "./ui/color-picker.js";

export { type QRCodeProps, QRCode } from "./ui/qrcode.js";

export { type InfiniteScrollProps, InfiniteScroll } from "./ui/infinite-scroll.js";

export { type MarqueeProps, type MarqueeVariant, Marquee } from "./ui/marquee.js";

export {
  type RoadmapItem,
  type RoadmapProps,
  type RoadmapStatus,
  Roadmap,
} from "./ui/roadmap.js";

export {
  Form,
  FormField,
  FormMessage,
  useFormFieldState,
  FormProvider,
  useForm,
  useFormContext,
  Controller,
} from "./ui/form.js";
export type {
  FormProps,
  FormFieldProps,
  FormMessageProps,
  FieldValues,
  UseFormProps,
  Path,
  FieldPath,
  FieldPathValue,
} from "./ui/form.js";

/* ── Data & input composables ───────────────────────────────── */
export {
  type DataTableColumn,
  type DataTableExporter,
  type DataTableDensity,
  type DataTableCopy,
  type DataTableProps,
  DataTable,
} from "./ui/data-table.js";

export {
  type DatePickerProps,
  DatePicker,
  isSameDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  addDays,
  toIsoDate,
  parseIsoDate,
  formatDate,
} from "./ui/date-picker.js";

export { type NumberInputProps, type Currency, NumberInput, CURRENCIES } from "./ui/number-input.js";

export { type DateInputProps, DateInput, validateIsoDate } from "./ui/date-input.js";

export { type PasswordInputProps, PasswordInput } from "./ui/password-input.js";

export { type MailInputProps, MailInput } from "./ui/mail-input.js";

export {
  type CountryCode,
  type CountryRegion,
  type CountryCodeValue,
  type CountryCodeInputProps,
  COMMON_COUNTRY_CODES,
  ISO_COUNTRY_CODES,
  COUNTRY_REGION_LABELS,
  getCountryCode,
  getCountryName,
  filterCountryCodes,
  CountryCodeInput,
} from "./ui/country-code-input.js";

export {
  type Country,
  type Region,
  type Locality,
  type LocationValue,
  type LocationPickerProps,
  DEFAULT_COUNTRIES,
  DEFAULT_REGIONS,
  DEFAULT_LOCALITIES,
  getRegionLabel,
  getLocalityLabel,
  CountryInput,
  StateInput,
  LGAInput,
  LocationPicker,
} from "./ui/location-picker.js";

/* ── Animated surfaces & ready-to-use pages ────────────────── */
export {
  type SpotlightProps,
  Spotlight,
  type AuroraProps,
  Aurora,
  type BeamsProps,
  Beams,
  type GridPatternProps,
  GridPattern,
  type SparkleButtonProps,
  SparkleButton,
} from "./ui/animated.js";

export {
  type TypewriterTextProps,
  TypewriterText,
} from "./ui/typewriter-text.js";

export {
  type BlurTextProps,
  BlurText,
  type WaveTextProps,
  WaveText,
  type FlipTextProps,
  FlipText,
  type SplitTextProps,
  SplitText,
  type FadeUpTextProps,
  FadeUpText,
  type ShimmerTextProps,
  ShimmerText,
  type GradientTextProps,
  GradientText,
  type LetterSpacingTextProps,
  LetterSpacingText,
  type CountUpTextProps,
  CountUpText,
  type DissolveTextProps,
  DissolveText,
} from "./ui/text-animations.js";

export {
  type TiltCardProps,
  TiltCard,
  type GlowCardProps,
  GlowCard,
  type RippleButtonProps,
  RippleButton,
  type MagneticButtonProps,
  MagneticButton,
  type ShineButtonProps,
  ShineButton,
  type ScrollRevealProps,
  ScrollReveal,
  type DissolveButtonProps,
  DissolveButton,
} from "./ui/micro-interactions.js";

export {
  type AnimatedButtonVariant,
  type AnimatedButtonProps,
  type AnimatedButtonRenderProps,
  AnimatedButton,
} from "./ui/animated-button.js";

export {
  type FooterLink,
  type FooterColumn,
  type FooterSocial,
  type FooterNewsletter,
  type FooterStep,
  type FooterProps,
  Footer,
} from "./ui/footer.js";

export {
  type BillingInterval,
  type BillingPlanCta,
  type BillingPlan,
  type BillingPageConfig,
  planPriceLabel,
  planPriceForInterval,
  planInterval,
  intervalLabel,
  intervalMonths,
} from "./ui/billing-types.js";

export {
  type BillingPageProps,
  BillingPage,
  type BillingPageTableProps,
  BillingPageTable,
  type BillingPageFreemiumProps,
  BillingPageFreemium,
} from "./ui/billing-page.js";

export {
  type FeedbackChannel,
  type FeedbackPageCopy,
  FeedbackPage,
} from "./ui/feedback-page.js";

export {
  type NotFoundProps,
  NotFound,
  type NotFoundAnimation,
} from "./ui/not-found.js";

/* ── Animations: card effects ─────────────────────────────── */
export {
  type FlipCardProps,
  FlipCard,
  type SpotlightCardProps,
  SpotlightCard,
  type BorderBeamCardProps,
  BorderBeamCard,
  type ShineCardProps,
  ShineCard,
  type GradientBorderCardProps,
  GradientBorderCard,
  type RevealCardProps,
  RevealCard,
  type HoverScaleCardProps,
  HoverScaleCard,
  type MagneticCardProps,
  MagneticCard,
  type DissolveCardProps,
  DissolveCard,
} from "./ui/card-animations.js";

/* ── Ready-to-use: auth & security ────────────────────────── */
export {
  type OtpVerificationCardProps,
  OtpVerificationCard,
} from "./ui/otp-verification-card.js";
export {
  type TwoFactorSetupPanelProps,
  TwoFactorSetupPanel,
} from "./ui/two-factor-setup-panel.js";
export {
  type PasswordStrengthLevel,
  type PasswordStrengthMeterProps,
  PasswordStrengthMeter,
  scorePassword,
  levelFromScore,
  PASSWORD_RULES,
} from "./ui/password-strength-meter.js";
export {
  type ApiKey,
  type ApiKeyManagerProps,
  ApiKeyManager,
} from "./ui/api-key-manager.js";
export {
  type Invitee,
  type InviteTeamFormProps,
  InviteTeamForm,
} from "./ui/invite-team-form.js";

/* ── Ready-to-use: settings & security surface ────────────── */
export {
  type SettingsSection,
  type AccountSettingsPanelProps,
  AccountSettingsPanel,
} from "./ui/account-settings-panel.js";
export {
  type SecurityFeature,
  type SecuritySectionCardProps,
  SecuritySectionCard,
} from "./ui/security-section-card.js";

/* ── Ready-to-use: marketing ──────────────────────────────── */
export {
  type AnnouncementBarProps,
  AnnouncementBar,
} from "./ui/announcement-bar.js";
export {
  type CookieChoice,
  type CookieConsentProps,
  CookieConsent,
} from "./ui/cookie-consent.js";
export {
  type Testimonial,
  type TestimonialShowcaseProps,
  type TestimonialShowcaseCopy,
  TestimonialShowcase,
} from "./ui/testimonial-showcase.js";
export {
  type FaqItem,
  type FaqSectionProps,
  FaqSection,
} from "./ui/faq-section.js";

/* ── Ready-to-use: dashboard ──────────────────────────────── */
export {
  type PageHeaderCrumb,
  type PageHeaderProps,
  PageHeader,
} from "./ui/page-header.js";
export {
  type StatDeltaDirection,
  type StatCardProps,
  StatCard,
} from "./ui/stat-card.js";
export {
  type ActivityItem,
  type ActivityFeedProps,
  ActivityFeed,
  relativeTime,
  dayLabel,
} from "./ui/activity-feed.js";

/* ── Headless-first primitives ─────────────────────────────── */
export {
  type StepperStepDef,
  type StepperDirection,
  type StepperVariant,
  type UseStepperOptions,
  type StepperApi,
  type StepperNavProps,
  type StepperPanelProps,
  type StepperFooterProps,
  type StepperProps,
  useStepper,
  StepperProvider,
  StepperNav,
  StepperPanel,
  StepperFooter,
  Stepper,
} from "./ui/stepper.js";

/* ── Ready-to-use: project & tracking ─────────────────────── */
export {
   type KanbanCardDef,
  type KanbanColumnDef,
  type UseKanbanOptions,
  type KanbanApi,
  type KanbanCardAction,
  type KanbanCardProps,
  type KanbanColumnProps,
  type KanbanBoardProps,
  useKanban,
  KanbanCard,
  KanbanColumn,
  KanbanBoard,
} from "./ui/kanban-board.js";

export {
  type ChangelogChangeKind,
  type ChangelogChange,
  type ChangelogRelease,
  type ChangelogListCopy,
  type ChangelogListProps,
  ChangelogList,
} from "./ui/changelog-list.js";
export { type ChangelogRelease as FacetChangelogRelease } from "./ui/changelog-list.js";
export { facetChangelog } from "./data/changelog.js";

export {
  type WizardFormStep,
  type WizardFormPageProps,
  WizardFormPage,
} from "./ui/wizard-form-page.js";

export {
  type DateRangePreset,
  type DateRange,
  type DateRangePickerProps,
  DateRangePicker,
} from "./ui/date-range-picker.js";

export {
  type ChartSeries,
  type ChartSeriesType,
  type ChartType,
  type CurveType,
  type ChartLegendPosition,
  type ChartTooltipProps,
  type ChartProps,
  Chart,
} from "./ui/chart.js";

export {
  type EmptyStatePageCTA,
  type EmptyStatePageProps,
  EmptyStatePage,
} from "./ui/empty-state-page.js";

export {
  type QrScannerStatus,
  type QrScannerProps,
  QrScanner,
} from "./ui/qr-scanner.js";

export {
  type ConsentCaptureProps,
  ConsentCapture,
} from "./ui/consent-capture.js";

export {
  type PricingTier,
  type PricingFeature,
  type PricingComparisonProps,
  PricingComparison,
} from "./ui/pricing-comparison.js";

export {
  type TreeNode,
  type TreeProps,
  Tree,
} from "./ui/tree.js";

export {
  type MultiComboboxOption,
  type MultiComboboxProps,
  MultiCombobox,
} from "./ui/multi-combobox.js";

export {
  type TagInputProps,
  TagInput,
} from "./ui/tag-input.js";

export {
  type RangeSliderProps,
  RangeSlider,
} from "./ui/range-slider.js";

export {
  type RatingInputProps,
  RatingInput,
} from "./ui/rating-input.js";

export {
  type CookieBannerProps,
  CookieBanner,
} from "./ui/cookie-banner.js";

export {
  type OtpInputProps,
  OtpInput,
} from "./ui/otp-input.js";

export {
  type RichTextEditorProps,
  type RichTextEditorCopy,
  RichTextEditor,
} from "./ui/rich-text-editor.js";

export {
  type PhoneCountry,
  type PhoneInputProps,
  PhoneInput,
} from "./ui/phone-input.js";

export {
  type MentionUser,
  type MentionInputProps,
  MentionInput,
} from "./ui/mention-input.js";

export {
  type ShineBorderCardProps,
  ShineBorderCard,
} from "./ui/shine-border-card.js";

export {
  type GlowBorderCardProps,
  GlowBorderCard,
} from "./ui/glow-border-card.js";
