import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AspectRatio } from "./ui/aspect-ratio.js";
import {
  Carousel,
  CarouselContent,
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
  useResizable,
  useResizableLayout,
} from "./ui/resizable.js";
import type {
  ResizableImperativeHandle,
  ResizableLayoutResult,
} from "./ui/resizable.js";

describe("New component imports", () => {
  it("all five new components load without errors", () => {
    expect(AspectRatio).toBeDefined();
    expect(Carousel).toBeDefined();
    expect(Drawer).toBeDefined();
    expect(InputGroup).toBeDefined();
    expect(ResizablePanelGroup).toBeDefined();
  });
});

describe("AspectRatio", () => {
  it("renders children", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <span data-testid="ar-content">content</span>
      </AspectRatio>,
    );
    expect(screen.getByTestId("ar-content")).toBeInTheDocument();
  });
});

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
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
  });
});

describe("Drawer", () => {
  it("renders trigger (closed by default)", () => {
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
    expect(
      await screen.findByText("Drawer title", {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });
});

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

  it("renders vertical orientation with row-resize cursor", () => {
    const { container } = render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle withHandle orientation="vertical" />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("Panel 1")).toBeInTheDocument();
    expect(screen.getByText("Panel 2")).toBeInTheDocument();
    const handle = container.querySelector('[class*="cursor-row-resize"]');
    expect(handle).toBeInTheDocument();
  });

  it("infers handle orientation from parent group (vertical)", () => {
    const { container } = render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>,
    );
    // Handle should auto-inherit vertical orientation: row-resize cursor + full-width strip
    const handle = container.querySelector('[class*="cursor-row-resize"]');
    expect(handle).toBeInTheDocument();
    expect(handle!.className).toMatch(/w-full/);
    // Grip icon should be GripHorizontal for vertical orientation
    expect(handle!.querySelector("svg")).toBeInTheDocument();
  });

  it("infers handle orientation from parent group (horizontal)", () => {
    const { container } = render(
      <ResizablePanelGroup>
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>,
    );
    // Handle should default to horizontal: col-resize cursor + full-height strip
    const handle = container.querySelector('[class*="cursor-col-resize"]');
    expect(handle).toBeInTheDocument();
    expect(handle!.className).toMatch(/h-full/);
  });

  it("explicit handle orientation overrides group orientation", () => {
    const { container } = render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel>Panel 1</ResizablePanel>
        <ResizableHandle withHandle orientation="horizontal" />
        <ResizablePanel>Panel 2</ResizablePanel>
      </ResizablePanelGroup>,
    );
    // Explicit orientation="horizontal" overrides the vertical group
    const handle = container.querySelector('[class*="cursor-col-resize"]');
    expect(handle).toBeInTheDocument();
    expect(handle!.className).toMatch(/h-full/);
  });

  it("vertical collapsible group infers handle orientation (no explicit orientation)", () => {
    const { container } = render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel collapsible collapsedSize={0} defaultSize={20}>
          Collapsed
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>Main</ResizablePanel>
      </ResizablePanelGroup>,
    );
    // Handle should auto-inherit vertical orientation, NOT look like horizontal
    const handle = container.querySelector('[class*="cursor-row-resize"]');
    expect(handle).toBeInTheDocument();
    expect(handle!.className).toMatch(/w-full/);
  });

  it("accepts numeric defaultSize without crashing (normalized to %)", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={50}>Panel 1</ResizablePanel>
        <ResizablePanel defaultSize={50}>Panel 2</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("Panel 1")).toBeInTheDocument();
    expect(screen.getByText("Panel 2")).toBeInTheDocument();
  });

  it("passes string defaultSize through verbatim", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="33%">Panel A</ResizablePanel>
        <ResizablePanel defaultSize="67%">Panel B</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.getByText("Panel B")).toBeInTheDocument();
  });

  it("renders collapsible panel with collapsedSize", () => {
    render(
      <ResizablePanelGroup>
        <ResizablePanel collapsible collapsedSize={0} defaultSize={20}>
          Collapsed
        </ResizablePanel>
        <ResizablePanel defaultSize={80}>Main</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(screen.getByText("Collapsed")).toBeInTheDocument();
    expect(screen.getByText("Main")).toBeInTheDocument();
  });

  it("renders handle with grip icon when withHandle is set", () => {
    const { container } = render(
      <ResizablePanelGroup>
        <ResizablePanel />
        <ResizableHandle withHandle />
        <ResizablePanel />
      </ResizablePanelGroup>,
    );
    const handle = container.querySelector('[class*="relative"]');
    expect(handle).toBeInTheDocument();
    expect(handle!.querySelector("svg")).toBeInTheDocument();
  });

  it("renders handle without grip icon when withHandle is not set", () => {
    const { container } = render(
      <ResizablePanelGroup>
        <ResizablePanel />
        <ResizableHandle />
        <ResizablePanel />
      </ResizablePanelGroup>,
    );
    const handle = container.querySelector('[class*="relative"]');
    expect(handle).toBeInTheDocument();
    expect(handle!.querySelector("svg")).toBeNull();
  });

  it("merges custom className with base layout classes", () => {
    const { container } = render(
      <ResizablePanelGroup className="my-custom-class">
        <ResizablePanel />
      </ResizablePanelGroup>,
    );
    expect(container.querySelector(".my-custom-class")).toBeInTheDocument();
    expect(container.querySelector(".flex")).toBeInTheDocument();
  });

  it("useResizable returns imperative handle methods", () => {
    let hook: ResizableImperativeHandle | null = null;
    function TestResizable() {
      hook = useResizable();
      return (
        <ResizablePanelGroup groupRef={hook!.groupRef}>
          <ResizablePanel panelRef={hook!.panelRef} defaultSize={50}>
            content
          </ResizablePanel>
        </ResizablePanelGroup>
      );
    }
    render(<TestResizable />);
    expect(hook).not.toBeNull();
    expect(hook!.groupRef).toBeDefined();
    expect(hook!.panelRef).toBeDefined();
    expect(typeof hook!.getLayout).toBe("function");
    expect(typeof hook!.setLayout).toBe("function");
    expect(typeof hook!.collapse).toBe("function");
    expect(typeof hook!.expand).toBe("function");
    expect(typeof hook!.isCollapsed).toBe("function");
    expect(typeof hook!.resize).toBe("function");
    expect(typeof hook!.getSize).toBe("function");
  });

  it("useResizableLayout returns persistence hooks", () => {
    let hook: ResizableLayoutResult | null = null;
    function TestLayout() {
      hook = useResizableLayout("test-storage-key");
      return (
        <ResizablePanelGroup
          defaultLayout={hook!.defaultLayout}
          onLayoutChanged={hook!.onLayoutChanged}
        >
          <ResizablePanel>content</ResizablePanel>
        </ResizablePanelGroup>
      );
    }
    render(<TestLayout />);
    expect(hook).not.toBeNull();
    expect(typeof hook!.onLayoutChange).toBe("function");
    expect(typeof hook!.onLayoutChanged).toBe("function");
  });
});
