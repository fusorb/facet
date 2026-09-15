import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.js";
import { Navbar, type NavLink } from "./ui/navbar.js";
import {
  NotificationDrawer,
  type Notification,
} from "./ui/notification-drawer.js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion.js";
import { Dialog, DialogContent } from "./ui/dialog.js";
import {
  BlurText,
  GradientText,
  SplitText,
  CountUpText,
  WaveText,
} from "./ui/text-animations.js";
import {
  RippleButton,
  MagneticButton,
  ScrollReveal,
  TiltCard,
} from "./ui/micro-interactions.js";
import { AnimatedButton } from "./ui/animated-button.js";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert.js";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog.js";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group.js";
import { Toggle } from "./ui/toggle.js";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group.js";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "./ui/menubar.js";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "./ui/context-menu.js";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "./ui/hover-card.js";
import { Kbd } from "./ui/kbd.js";
import { Spinner } from "./ui/spinner.js";
import { EmptyState } from "./ui/empty-state.js";
import { ButtonGroup } from "./ui/button-group.js";
import { AvatarGroup } from "./ui/avatar-group.js";
import { Combobox } from "./ui/combobox.js";
import {
  scorePassword,
  levelFromScore,
  type PasswordStrengthLevel,
} from "./ui/password-strength-meter.js";
import { PasswordStrengthMeter } from "./ui/password-strength-meter.js";
import { relativeTime, dayLabel } from "./ui/activity-feed.js";
import { FlipCard } from "./ui/card-animations.js";
import { AnnouncementBar } from "./ui/announcement-bar.js";
import { StatCard } from "./ui/stat-card.js";
import { AspectRatio } from "./ui/aspect-ratio.js";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel.js";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer.js";
import { InputGroup, InputGroupAddon } from "./ui/input-group.js";
import { Input } from "./ui/input.js";
import {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
} from "./ui/resizable.js";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("applies variant + size classes", () => {
    const { container } = render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const btn = container.querySelector("button");
    expect(btn).toHaveClass("bg-destructive");
    expect(btn).toHaveClass("h-10");
    expect(btn).toHaveClass("cursor-pointer");
  });

  it("is disabled when disabled prop set", () => {
    render(<Button disabled>Off</Button>);
    expect(screen.getByRole("button", { name: /off/i })).toBeDisabled();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button", { name: /click/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Badge", () => {
  it("renders label", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { container } = render(<Badge variant="secondary">Tag</Badge>);
    expect(container.querySelector("div")).toHaveClass("bg-secondary");
  });

  it("renders an optional leading icon", () => {
    const { container } = render(
      <Badge icon={<span data-testid="icon">*</span>}>New</Badge>,
    );
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(container.querySelector("[data-testid=icon]")).toBeInTheDocument();
  });

  it("renders icon-only when iconOnly is set", () => {
    const { container } = render(
      <Badge iconOnly icon={<span data-testid="icon">*</span>} />,
    );
    expect(container.querySelector("[data-testid=icon]")).toBeInTheDocument();
    expect(container.querySelector("div")).toHaveClass("size-6");
  });
});

describe("Card", () => {
  it("composes header, title, content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage settings</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Manage settings")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it.each(["outline", "elevated", "interactive"] as const)(
    "applies %s variant classes",
    (variant) => {
      const { container } = render(<Card variant={variant}>Body</Card>);
      const card = container.querySelector("div");
      expect(card).toHaveClass("rounded-xl");
      if (variant === "outline") expect(card).toHaveClass("shadow-none");
      if (variant === "elevated") expect(card).toHaveClass("shadow-md");
      if (variant === "interactive") expect(card).toHaveClass("cursor-pointer");
    },
  );
});

describe("Accordion", () => {
  it("renders trigger and expands content", async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent>Answer</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText("Question")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Question"));
    expect(await screen.findByText("Answer")).toBeInTheDocument();
  });

  it("applies the separated variant classes to the item", () => {
    const { container } = render(
      <Accordion type="single">
        <AccordionItem variant="separated" value="item-1">
          <AccordionTrigger>Q</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    // The AccordionItem renders an <h3> (Header) inside the item div.
    const header = container.querySelector("h3");
    const item = header?.parentElement;
    expect(item?.className).toContain("bg-card");
    expect(item?.className).toContain("rounded-lg");
  });

  it("spaces separated items apart within a single accordion", () => {
    const { container } = render(
      <Accordion type="single">
        <AccordionItem variant="separated" value="item-1">
          <AccordionTrigger>First</AccordionTrigger>
        </AccordionItem>
        <AccordionItem variant="separated" value="item-2">
          <AccordionTrigger>Second</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    const headers = container.querySelectorAll("h3");
    const items = Array.from(headers, (h) => h.parentElement);
    expect(items[1]?.className).toContain("mt-2");
  });

  it("applies nested indent and guide-line classes to the item", () => {
    const { container } = render(
      <Accordion type="single">
        <AccordionItem variant="nested" value="item-1">
          <AccordionTrigger>Child</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    const header = container.querySelector("h3");
    const item = header?.parentElement;
    expect(item?.className).toContain("ml-3");
    expect(item?.className).toContain("pl-3");
    expect(item?.className).toContain("border-l");
  });
});

describe("Dialog", () => {
  it("renders content inside a dialog with a dim overlay by default", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );
    const content = await screen.findByText("Content");
    expect(content).toBeInTheDocument();
    const dialog = content.closest("[role=dialog]");
    // Default dialog uses the frost surface for a readable, blurred card.
    expect(dialog?.className).toContain("frost");
    // The overlay is rendered by Radix into the portal; the dim variant applies bg-black/80.
    expect(document.querySelector(".bg-black\\/80")).not.toBeNull();
  });

  it("applies the compact variant class to content", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent variant="compact" aria-describedby={undefined}>
          <p>Small</p>
        </DialogContent>
      </Dialog>,
    );
    const content = await screen.findByText("Small");
    const dialog = content.closest("[role=dialog]");
    expect(dialog?.className).toContain("max-w-md");
  });
});

describe("Navbar", () => {
  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings", badge: "New" },
  ];

  it("renders brand and desktop links", () => {
    render(<Navbar brand={<span>Acme</span>} links={links} />);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders badge on links", () => {
    render(<Navbar links={links} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("calls onNavigate and prevents default", async () => {
    const onNavigate = vi.fn();
    render(<Navbar links={links} onNavigate={onNavigate} />);

    const link = screen.getByRole("link", { name: /dashboard/i });
    await userEvent.click(link);

    expect(onNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("toggles the mobile menu", async () => {
    render(<Navbar brand="Acme" links={links} />);

    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    // Desktop links are rendered but hidden; mobile menu starts closed
    expect(screen.getAllByText("Settings").length).toBe(1);

    await userEvent.click(toggle);
    // Mobile menu adds a duplicate of the links
    expect(screen.getAllByText("Settings").length).toBe(2);

    await userEvent.click(toggle);
    expect(screen.getAllByText("Settings").length).toBe(1);
  });

  it("switches the toggle label + icon to X when the menu is open", async () => {
    render(<Navbar brand="Acme" links={links} />);

    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-label", "Toggle menu");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-label", "Close menu");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-label", "Toggle menu");
  });

  it("closes the mobile menu when clicking outside the navbar", async () => {
    render(<Navbar brand="Acme" links={links} />);

    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    await userEvent.click(toggle);
    expect(screen.getAllByText("Settings").length).toBe(2);

    // Click outside the navbar (on document.body)
    await userEvent.click(document.body);
    expect(
      screen.queryByRole("button", { name: /close menu/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("Settings").length).toBe(1);
  });

  it("renders sub-links in a dropdown trigger", async () => {
    const onNavigate = vi.fn();
    render(
      <Navbar
        links={[
          {
            href: "/product",
            label: "Product",
            children: [{ href: "/product/pricing", label: "Pricing" }],
          },
        ]}
        onNavigate={onNavigate}
      />,
    );

    // The parent link becomes a dropdown trigger button
    const trigger = screen.getByRole("button", { name: /product/i });
    expect(trigger).toBeInTheDocument();

    // Sub-link renders inside the dropdown once opened
    await userEvent.click(trigger);
    const subLink = await screen.findByText("Pricing");
    expect(subLink).toBeInTheDocument();

    await userEvent.click(subLink);
    expect(onNavigate).toHaveBeenCalledWith("/product/pricing");
  });

  it("applies a flush glass header when variant is pill", () => {
    const { container } = render(
      <Navbar variant="pill" brand="Acme" links={links} />,
    );
    const nav = container.querySelector("nav");
    // Full-width glass header at rest; the surface only intensifies once
    // stuck (data-stuck), keeping the bar part of the body.
    expect(nav).toHaveClass("sticky");
    expect(nav).toHaveClass("border-border/40");
    expect(nav).toHaveClass("bg-background/60");
    expect(nav).toHaveClass("backdrop-blur-xl");
  });

  it("supports a custom mobileBreakpoint", () => {
    const { container } = render(
      <Navbar brand="Acme" links={links} mobileBreakpoint="lg" />,
    );
    const nav = container.querySelector("nav");
    const tray = container.querySelector("nav > div:nth-of-type(2)");
    const hamburger = container.querySelector(
      "nav > div:nth-of-type(3) > button",
    );
    // Desktop links wait for lg; hamburger hides at lg
    expect(tray).toHaveClass("lg:flex");
    expect(hamburger).toHaveClass("lg:hidden");
    // Default is md for other consumers
    expect(nav).not.toHaveClass("md:flex");
  });

  it("renders a flat link tray for pill links", () => {
    const { container } = render(
      <Navbar variant="pill" brand="Acme" links={links} />,
    );
    const tray = container.querySelector("nav > div:nth-of-type(2)");
    expect(tray).toHaveClass("gap-1");
    expect(tray).not.toHaveClass("rounded-full");
    expect(tray).not.toHaveClass("bg-muted/40");
  });

  it("marks a hash link active when the hash matches", () => {
    const anchorLinks: NavLink[] = [
      { href: "#features", label: "Features" },
      { href: "#demo", label: "Demo" },
    ];
    window.location.hash = "#demo";
    render(<Navbar brand="Acme" links={anchorLinks} />);

    const features = screen.getByRole("link", { name: /features/i });
    const demo = screen.getByRole("link", { name: /demo/i });
    expect(features).not.toHaveAttribute("aria-current", "page");
    expect(demo).toHaveAttribute("aria-current", "page");
  });

  it("renders pill with actions, badges, and sub-links together", async () => {
    const onNavigate = vi.fn();
    render(
      <Navbar
        variant="pill"
        brand="Acme"
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/inbox", label: "Inbox", badge: 5 },
          {
            href: "/product",
            label: "Product",
            children: [
              { href: "/product/pricing", label: "Pricing" },
              { href: "/product/changelog", label: "Changelog" },
            ],
          },
        ]}
        actions={<button type="button">Sign in</button>}
        onNavigate={onNavigate}
      />,
    );

    // Actions render in the pill bar
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();

    // Badge renders next to the label
    expect(screen.getByText("5")).toBeInTheDocument();

    // Sub-links open a dropdown from the pill trigger
    const product = screen.getByRole("button", { name: /product/i });
    await userEvent.click(product);
    expect(await screen.findByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Changelog")).toBeInTheDocument();
  });
});

describe("NotificationDrawer", () => {
  const notifications: Notification[] = [
    {
      id: "1",
      title: "New sign-in",
      description: "From Lagos",
      read: false,
      type: "warning",
    },
    { id: "2", title: "Payment received", read: true, type: "success" },
  ];

  it("renders bell with unread count", () => {
    render(<NotificationDrawer notifications={notifications} />);
    expect(screen.getByText("1")).toBeInTheDocument(); // unread badge
  });

  it("opens drawer and lists notifications", async () => {
    render(<NotificationDrawer notifications={notifications} />);
    await userEvent.click(screen.getByRole("button"));

    expect(await screen.findByText("New sign-in")).toBeInTheDocument();
    expect(screen.getByText("Payment received")).toBeInTheDocument();
  });

  it("marks all read via callback", async () => {
    const onMarkAllRead = vi.fn();
    render(
      <NotificationDrawer
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(await screen.findByText(/mark all/i));

    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("reveals a selection checkbox on hover and bulk-acts via onMarkReadMany", async () => {
    const onMarkReadMany = vi.fn();
    render(
      <NotificationDrawer
        notifications={notifications}
        onMarkReadMany={onMarkReadMany}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    const checkbox = await screen.findByRole("checkbox", {
      name: /select new sign-in/i,
    });
    await userEvent.click(checkbox);

    // Bulk bar appears with the count.
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /mark read/i }));
    expect(onMarkReadMany).toHaveBeenCalledWith(["1"]);
  });

  it("falls back to per-item onDelete when no bulk callback is wired", async () => {
    const onDelete = vi.fn();
    render(
      <NotificationDrawer notifications={notifications} onDelete={onDelete} />,
    );

    await userEvent.click(screen.getByRole("button"));
    const checkbox = await screen.findByRole("checkbox", {
      name: /select new sign-in/i,
    });
    await userEvent.click(checkbox);

    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(onDelete).toHaveBeenCalledWith(notifications[0]);
  });

  it("clears selection when the drawer closes", async () => {
    render(
      <NotificationDrawer
        notifications={notifications}
        onMarkReadMany={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    const checkbox = await screen.findByRole("checkbox", {
      name: /select new sign-in/i,
    });
    await userEvent.click(checkbox);
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    // Close via the X (SheetClose button).
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    await userEvent.click(screen.getByRole("button")); // reopen
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("renders title and description", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something to note</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something to note")).toBeInTheDocument();
  });

  it("applies role=alert", () => {
    const { container } = render(<Alert>Info</Alert>);
    expect(container.querySelector("[role=alert]")).toBeInTheDocument();
  });

  it("applies destructive variant classes", () => {
    const { container } = render(<Alert variant="destructive">Danger</Alert>);
    const alert = container.querySelector("[role=alert]");
    expect(alert?.className).toContain("border-destructive/50");
    expect(alert?.className).toContain("text-destructive");
  });
});

describe("AlertDialog", () => {
  it("opens on trigger click and shows title + description", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm delete</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(await screen.findByText("Confirm delete")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("fires Action callback and closes", async () => {
    const onAction = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    await userEvent.click(
      await screen.findByRole("button", { name: /confirm/i }),
    );
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("Cancel closes the dialog", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    await userEvent.click(
      await screen.findByRole("button", { name: /cancel/i }),
    );
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });
});

describe("RadioGroup", () => {
  it("renders items and fires onValueChange on select", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(2);
    await userEvent.click(radios[1]!);
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
});

describe("Toggle", () => {
  it("toggles aria-pressed and fires onPressedChange", async () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);
    const toggle = screen.getByRole("button", { name: /bold/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });
});

describe("ToggleGroup", () => {
  it("fires onValueChange for single selection", async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole("radio", { name: /a/i }));
    expect(onValueChange).toHaveBeenCalledWith("a");
  });

  it("fires onValueChange for multiple selection", async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="multiple" onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: /a/i }));
    await userEvent.click(screen.getByRole("button", { name: /b/i }));
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
    expect(onValueChange).toHaveBeenCalledWith(["a", "b"]);
  });
});

describe("Menubar", () => {
  it("opens a menu on trigger click and renders an item", async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    await userEvent.click(screen.getByRole("menuitem", { name: /file/i }));
    expect(await screen.findByText("New")).toBeInTheDocument();
  });
});

describe("ContextMenu", () => {
  it("opens on right-click and renders an item", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click me</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const trigger = screen.getByText("Right click me");
    fireEvent.contextMenu(trigger);
    expect(await screen.findByText("Copy")).toBeInTheDocument();
  });
});

describe("HoverCard", () => {
  it("renders trigger and content on hover", async () => {
    render(
      <HoverCard>
        <HoverCardTrigger>@jane</HoverCardTrigger>
        <HoverCardContent>Jane Doe</HoverCardContent>
      </HoverCard>,
    );
    expect(screen.getByText("@jane")).toBeInTheDocument();
    await userEvent.hover(screen.getByText("@jane"));
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
  });
});

describe("Kbd", () => {
  it("renders a kbd element with font-mono", () => {
    const { container } = render(<Kbd>Ctrl</Kbd>);
    const kbd = container.querySelector("kbd");
    expect(kbd).toBeInTheDocument();
    expect(kbd?.className).toContain("font-mono");
  });
});

describe("Spinner", () => {
  it("renders with animate-spin and default size", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector("[role=status]");
    expect(spinner?.className).toContain("animate-spin");
    expect(spinner?.className).toContain("size-6");
  });

  it("applies size + variant classes", () => {
    const { container } = render(<Spinner size="sm" variant="primary" />);
    const spinner = container.querySelector("[role=status]");
    expect(spinner?.className).toContain("size-4");
    expect(spinner?.className).toContain("text-primary");
  });
});

describe("EmptyState", () => {
  it("renders icon, title, description, and action", () => {
    const { container } = render(
      <EmptyState
        icon={<span data-testid="empty-icon">*</span>}
        title="No results"
        description="Try adjusting your search."
        action={<Button>Reset</Button>}
      />,
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(
      container.querySelector("[data-testid=empty-icon]"),
    ).toBeInTheDocument();
  });
});

describe("ButtonGroup", () => {
  it("renders children", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("button", { name: /one/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /two/i })).toBeInTheDocument();
  });

  it("applies joined container classes", () => {
    const { container } = render(<ButtonGroup joined>X</ButtonGroup>);
    const group = container.querySelector("div");
    expect(group?.className).toContain("rounded-md");
    expect(group?.className).toContain("border-border");
  });
});

describe("AvatarGroup", () => {
  it("renders stacked avatars with fallbacks", () => {
    render(
      <AvatarGroup
        avatars={[
          { fallback: "A" },
          { fallback: "B" },
          { fallback: "C" },
          { fallback: "D" },
          { fallback: "E" },
        ]}
      />,
    );
    // max defaults to 4, so 4 shown + 1 overflow
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("E")).not.toBeInTheDocument();
  });
});

describe("Combobox", () => {
  const options = [
    { value: "ng", label: "Nigeria" },
    { value: "ke", label: "Kenya" },
    { value: "za", label: "South Africa" },
  ];

  it("opens and shows options, then selects one", async () => {
    const onValueChange = vi.fn();
    render(
      <Combobox
        options={options}
        onValueChange={onValueChange}
        placeholder="Select country"
      />,
    );
    await userEvent.click(screen.getByRole("combobox"));
    expect(await screen.findByText("Nigeria")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Nigeria"));
    expect(onValueChange).toHaveBeenCalledWith("ng");
  });

  it("shows the selected value as the trigger label", () => {
    render(<Combobox options={options} value="ke" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Kenya");
  });
});

/* ── Text animations ────────────────────────────────────────── */

describe("text animations", () => {
  it("BlurText renders the text split into characters", () => {
    const { container } = render(<BlurText text="hello" />);
    expect(container.querySelectorAll("span > span").length).toBe(5);
    expect(container.textContent).toContain("hello");
  });

  it("WaveText renders each character in an inline-block span", () => {
    const { container } = render(<WaveText text="wave" />);
    expect(container.querySelectorAll("span > span").length).toBe(4);
  });

  it("SplitText splits into words", () => {
    const { container } = render(<SplitText text="two words" />);
    expect(container.querySelectorAll("span > span").length).toBe(2);
  });

  it("GradientText renders the text and applies a gradient", () => {
    const { container } = render(<GradientText text="gradient" />);
    expect(container.textContent).toContain("gradient");
    const span = container.querySelector("span");
    expect(span?.style.backgroundImage).toContain("linear-gradient");
  });

  it("CountUpText starts at from and counts toward to", () => {
    render(<CountUpText to={100} from={0} />);
    // SSR-safe: renders the target server-side, then animates on mount.
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});

/* ── Micro-interactions ─────────────────────────────────────── */

describe("micro-interactions", () => {
  it("RippleButton renders children and fires onClick", () => {
    const onClick = vi.fn();
    render(<RippleButton onClick={onClick}>Click</RippleButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("MagneticButton renders and accepts a className", () => {
    const { container } = render(
      <MagneticButton className="mag-btn">Pull</MagneticButton>,
    );
    const btn = container.querySelector("button");
    expect(btn).toHaveClass("mag-btn");
    expect(btn).toHaveTextContent("Pull");
  });

  it("TiltCard renders children inside a wrapper", () => {
    const { container } = render(<TiltCard>Card body</TiltCard>);
    expect(container.textContent).toContain("Card body");
  });

  it("ScrollReveal renders children (visible after observer or fallback)", () => {
    const { container } = render(<ScrollReveal>Revealed</ScrollReveal>);
    expect(container.textContent).toContain("Revealed");
  });
});

/* ── AnimatedButton ────────────────────────────────────────── */

describe("AnimatedButton", () => {
  it("renders a button and fires onClick", () => {
    const onClick = vi.fn();
    render(<AnimatedButton onClick={onClick}>Go</AnimatedButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards type=submit", () => {
    const { container } = render(
      <AnimatedButton type="submit">Submit</AnimatedButton>,
    );
    expect(container.querySelector("button")).toHaveAttribute("type", "submit");
  });

  it("renders a custom button via renderButton", () => {
    const { container } = render(
      <AnimatedButton
        renderButton={(props) => (
          <button data-custom="1" {...props}>
            Custom
          </button>
        )}
      >
        Custom
      </AnimatedButton>,
    );
    expect(container.querySelector("[data-custom]")).toBeTruthy();
  });
});

/* ── PasswordStrengthMeter ─────────────────────────────────── */

describe("scorePassword", () => {
  it("returns 0 for empty input", () => {
    expect(scorePassword("")).toBe(0);
  });

  it("scores length, case, digit, and symbol", () => {
    expect(scorePassword("P@ssw0rd!123")).toBeGreaterThanOrEqual(4);
  });

  it("rewards length tiers", () => {
    expect(scorePassword("abcdefgh")).toBeGreaterThanOrEqual(1);
    expect(scorePassword("abcdefghijklmnop")).toBeGreaterThanOrEqual(2);
  });

  it("maps scores to levels", () => {
    expect(levelFromScore(0)).toBe("empty" satisfies PasswordStrengthLevel);
    expect(levelFromScore(1)).toBe("weak");
    expect(levelFromScore(2)).toBe("weak");
    expect(levelFromScore(3)).toBe("fair");
    expect(levelFromScore(4)).toBe("good");
    expect(levelFromScore(5)).toBe("strong");
    expect(levelFromScore(6)).toBe("strong");
  });
});

describe("PasswordStrengthMeter", () => {
  it("renders no checklist for an empty value", () => {
    const { container } = render(<PasswordStrengthMeter value="" />);
    expect(container.querySelectorAll("li").length).toBe(0);
  });

  it("renders a checklist once there is input", () => {
    const { container } = render(<PasswordStrengthMeter value="abc" />);
    expect(container.querySelectorAll("li").length).toBeGreaterThan(0);
  });
});

/* ── ActivityFeed helpers ──────────────────────────────────── */

describe("relativeTime", () => {
  const now = new Date("2026-08-16T12:00:00Z");
  it("formats just now / minutes / hours / days", () => {
    expect(relativeTime("2026-08-16T11:59:00Z", now)).toBe("just now");
    expect(relativeTime("2026-08-16T11:00:00Z", now)).toBe("60m ago");
    expect(relativeTime("2026-08-16T10:00:00Z", now)).toBe("2h ago");
    expect(relativeTime("2026-08-14T10:00:00Z", now)).toBe("2d ago");
  });
});

describe("dayLabel", () => {
  const now = new Date("2026-08-16T12:00:00Z");
  it("labels today, yesterday, and older dates", () => {
    expect(dayLabel("2026-08-16T10:00:00Z", now)).toBe("Today");
    expect(dayLabel("2026-08-15T10:00:00Z", now)).toBe("Yesterday");
    expect(dayLabel("2026-08-01T10:00:00Z", now)).toContain("Aug");
  });
});

/* ── FlipCard ──────────────────────────────────────────────── */

describe("FlipCard", () => {
  it("renders front and back content", () => {
    const { container } = render(
      <FlipCard front={<p>Front</p>} back={<p>Back</p>} />,
    );
    expect(container.textContent).toContain("Front");
    expect(container.textContent).toContain("Back");
  });
});

/* ── AnnouncementBar ───────────────────────────────────────── */

describe("AnnouncementBar", () => {
  it("renders children and a dismiss button", () => {
    const { container } = render(
      <AnnouncementBar storageKey="facet-test-announcement-1">
        Hello
      </AnnouncementBar>,
    );
    expect(container.textContent).toContain("Hello");
    expect(screen.getByLabelText("Dismiss announcement")).toBeInTheDocument();
  });

  it("dismisses on close click", () => {
    const { container } = render(
      <AnnouncementBar storageKey="facet-test-announcement-2">
        Hello
      </AnnouncementBar>,
    );
    fireEvent.click(screen.getByLabelText("Dismiss announcement"));
    expect(container.textContent).not.toContain("Hello");
  });
});

/* ── StatCard ──────────────────────────────────────────────── */

describe("StatCard", () => {
  it("renders label and value", () => {
    const { container } = render(<StatCard label="Revenue" value="$100" />);
    expect(container.textContent).toContain("Revenue");
    expect(container.textContent).toContain("$100");
  });

  it("formats positive and negative deltas", () => {
    const { container } = render(<StatCard label="R" value="1" delta={12.4} />);
    expect(container.textContent).toContain("+12.4%");
    const { container: c2 } = render(
      <StatCard label="C" value="1" delta={-0.4} />,
    );
    expect(c2.textContent).toContain("-0.4%");
  });
});

/* ── AspectRatio ── */

describe("AspectRatio", () => {
  it("renders children", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <span data-testid="content">Content</span>
      </AspectRatio>,
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});

/* ── Carousel ── */

describe("Carousel", () => {
  it("renders items and navigation buttons", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
    // Two nav buttons (prev + next)
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("renders dots indicator and allows click navigation", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselDots />
      </Carousel>,
    );
    const dots = container.querySelectorAll('[aria-label^="Go to slide"]');
    expect(dots).toHaveLength(2);
    await user.click(dots[1]!);
  });
});

/* ── Drawer ── */

describe("Drawer", () => {
  it("renders trigger; content is closed by default", () => {
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer title</DrawerTitle>
          <DrawerDescription>Drawer description</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("button", { name: /open/i })).toBeInTheDocument();
    expect(screen.queryByText("Drawer title")).not.toBeInTheDocument();
  });

  it("opens drawer on trigger click", async () => {
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(await screen.findByText("Drawer title")).toBeInTheDocument();
  });
});

/* ── InputGroup ── */

describe("InputGroup", () => {
  it("renders input with prepend and append addons", () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <span data-testid="icon">icon</span>
        </InputGroupAddon>
        <Input placeholder="Search..." />
        <InputGroupAddon>
          <span data-testid="action">Go</span>
        </InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getAllByTestId("icon")).toHaveLength(1);
    expect(screen.getAllByTestId("action")).toHaveLength(1);
  });
});

/* ── Resizable ── */

describe("Resizable", () => {
  it("renders a panel group with panels and handle", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("Panel 1")).toBeInTheDocument();
    expect(screen.getByText("Panel 2")).toBeInTheDocument();
  });
});
