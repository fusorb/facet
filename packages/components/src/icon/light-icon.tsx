/**
 * @fusorb/facet-components/light - minimal icon surface
 *
 * A slim Icon for the `/light` entry: resolves the built-in semantic +
 * brand icons WITHOUT importing the full 1763-icon lucide map. Use this
 * in eager app shells that only need common icons (settings, search,
 * check, moon, sun, ...). For arbitrary lucide icons use the main
 * barrel's <Icon> or the tree-shakeable @fusorb/facet-components/icons.
 */

import * as React from "react";
import {
  X,
  Building2,
  Trash2,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Check,
  Moon,
  Sun,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Users,
  CreditCard,
  LayoutDashboard,
  FileText,
  CircleQuestionMark,
  LayoutGrid,
  List,
  TriangleAlert,
  Copy,
  ChevronsUpDown,
  ChevronsUp,
  ChevronsDown,
  Compass,
  Layers,
  Palette,
  KeyRound,
  User,
  Upload,
  QrCode,
  PanelLeft,
  LayoutPanelLeft,
  Mail,
  MessageSquare,
  MessageCircle,
  Boxes,
  ShieldCheck,
  Zap,
  Terminal,
  Puzzle,
  Lock,
  Ruler,
  FingerprintPattern,
  AlertCircle,
  ExternalLink,
  Globe,
  Store,
  type LucideIcon,
} from "lucide-react";
import { brandIcons } from "./brand-icons.js";
import { toKebab, type IconComponent } from "./registry.js";

/* ── Semantic lucide keys (subset, resolved directly) ─────── */

/** The common semantic icons, mapped to their lucide components. */
const SEMANTIC_LUCIDE: Record<string, LucideIcon> = {
  settings: Settings,
  logout: LogOut,
  "chevron-down": ChevronDown,
  search: Search,
  check: Check,
  moon: Moon,
  sun: Sun,
  bell: Bell,
  menu: Menu,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  sparkles: Sparkles,
  "book-open": BookOpen,
  users: Users,
  "credit-card": CreditCard,
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  document: FileText,
  "circle-question-mark": CircleQuestionMark,
  "layout-grid": LayoutGrid,
  grid: LayoutGrid,
  list: List,
  "triangle-alert": TriangleAlert,
  copy: Copy,
  "chevrons-up-down": ChevronsUpDown,
  "chevrons-up": ChevronsUp,
  "chevrons-down": ChevronsDown,
  compass: Compass,
  layers: Layers,
  palette: Palette,
  "key-round": KeyRound,
  user: User,
  upload: Upload,
  "qr-code": QrCode,
  "panel-left": PanelLeft,
  "layout-panel-left": LayoutPanelLeft,
  mail: Mail,
  "message-square": MessageSquare,
  "message-circle": MessageCircle,
  boxes: Boxes,
  "shield-check": ShieldCheck,
  zap: Zap,
  terminal: Terminal,
  puzzle: Puzzle,
  lock: Lock,
  ruler: Ruler,
  "fingerprint-pattern": FingerprintPattern,
  "alert-circle": AlertCircle,
  "external-link": ExternalLink,
  "globe": Globe,
  "store": Store,
};

const DIRECT: Record<string, IconComponent> = {
  close: X,
  building: Building2,
  trash: Trash2,
};

const LIGHT_ICONS: Record<string, IconComponent> = {
  ...SEMANTIC_LUCIDE,
  ...DIRECT,
  ...brandIcons,
};

/* ── Light Icon ────────────────────────────────────────────── */

export interface LightIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  size?: number | string;
}

/** Renders a semantic/brand icon synchronously (no full lucide map). */
export function LightIcon({ name, className, size, ...props }: LightIconProps) {
  const kebab = toKebab(name);
  const Component = LIGHT_ICONS[kebab] ?? LIGHT_ICONS[name];
  if (!Component) return null;
  return <Component className={className} size={size} {...props} />;
}
