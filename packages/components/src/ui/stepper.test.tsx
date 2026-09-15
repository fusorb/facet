import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  useStepper,
  StepperProvider,
  StepperNav,
  StepperPanel,
  StepperFooter,
} from "./stepper.js";

const STEPS = [
  { id: "one", title: "Account" },
  { id: "two", title: "Profile" },
  { id: "three", title: "Confirm" },
];

describe("Stepper", () => {
  it("starts on the first navigable step", () => {
    let api!: ReturnType<typeof useStepper>;
    function Probe() {
      api = useStepper({ steps: STEPS });
      return null;
    }
    render(<Probe />);
    expect(api.currentId).toBe("one");
    expect(api.isFirst).toBe(true);
    expect(api.isLast).toBe(false);
  });

  it("advances one step with next() and stops at the last", async () => {
    let api!: ReturnType<typeof useStepper>;
    function Probe() {
      api = useStepper({ steps: STEPS });
      return null;
    }
    render(<Probe />);
    await act(async () => {
      await api.next();
    });
    expect(api.currentId).toBe("two");
    await act(async () => {
      await api.next();
    });
    expect(api.currentId).toBe("three");
    expect(api.isLast).toBe(true);
    const ok = await api.next();
    expect(ok).toBe(false);
    expect(api.currentId).toBe("three");
  });

  it("skips disabled steps in navigation", async () => {
    let api!: ReturnType<typeof useStepper>;
    function Probe() {
      api = useStepper({
        steps: [
          { id: "one", title: "Account" },
          { id: "two", title: "Skip me", disabled: true },
          { id: "three", title: "Profile" },
        ],
      });
      return null;
    }
    render(<Probe />);
    await act(async () => {
      await api.next();
    });
    expect(api.currentId).toBe("three");
  });

  it("rejects next() when validate returns false", async () => {
    let api!: ReturnType<typeof useStepper>;
    function Probe() {
      api = useStepper({
        steps: [
          { id: "one", title: "A", validate: () => false },
          { id: "two", title: "B" },
        ],
      });
      return null;
    }
    render(<Probe />);
    let ok: boolean | undefined;
    await act(async () => {
      ok = await api.next();
    });
    expect(ok).toBe(false);
    expect(api.currentId).toBe("one");
  });

  it("respects controlled mode via activeStepId + onActiveChange", () => {
    const onChange = vi.fn();
    let api!: ReturnType<typeof useStepper>;
    function Probe() {
      api = useStepper({
        steps: STEPS,
        mode: "controlled",
        activeStepId: "two",
        onActiveChange: onChange,
      });
      return null;
    }
    render(<Probe />);
    expect(api.currentId).toBe("two");
    act(() => {
      api.go("three");
    });
    expect(onChange).toHaveBeenCalledWith("three");
  });

  it("calls onStepChange on every transition", async () => {
    const onStepChange = vi.fn();
    let api!: ReturnType<typeof useStepper>;
    function Probe() {
      api = useStepper({ steps: STEPS, onStepChange });
      return null;
    }
    render(<Probe />);
    await act(async () => {
      await api.next();
    });
    expect(onStepChange).toHaveBeenCalledWith("two", "one");
  });

  it("loops when loop=true", async () => {
    let api!: ReturnType<typeof useStepper>;
    function Probe() {
      api = useStepper({ steps: STEPS, loop: true });
      return null;
    }
    render(<Probe />);
    await act(async () => {
      await api.next();
    });
    await act(async () => {
      await api.next();
    });
    expect(api.currentId).toBe("three");
    await act(async () => {
      await api.next();
    });
    expect(api.currentId).toBe("one");
  });

  it("StepperFooter renders Back and Next buttons", async () => {
    function Demo() {
      const api = useStepper({ steps: STEPS });
      return (
        <StepperProvider value={api}>
          <StepperNav />
          <StepperPanel>
            {(step) => <span data-testid="active">{step.title}</span>}
          </StepperPanel>
          <StepperFooter />
        </StepperProvider>
      );
    }
    render(<Demo />);
    expect(screen.getByTestId("active")).toHaveTextContent("Account");
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });
});
