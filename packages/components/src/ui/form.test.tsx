import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form, FormField, FormMessage, useForm } from "./form.js";
import { Input } from "./input.js";

interface Values {
  email: string;
  note: string;
}

function TestForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useForm<Values>({
    defaultValues: { email: "", note: "" },
  });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField name="email" label="Email" required>
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField name="note" label="Note" description="Optional">
        <Input />
      </FormField>
      <button type="submit">Submit</button>
    </Form>
  );
}

describe("Form", () => {
  it("renders labels, descriptions, and required indicator", () => {
    render(<TestForm onSubmit={() => {}} />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
    // Required marker is a span with asterisk inside the label.
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("submits the current values", async () => {
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await userEvent.type(
      screen.getByPlaceholderText("you@example.com"),
      "a@b.com",
    );
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.com", note: "" });
  });

  it("binds the input id and name to the field", () => {
    render(<TestForm onSubmit={() => {}} />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("id", "email");
    expect(emailInput).toHaveAttribute("name", "email");
  });
});

function ValidatedForm() {
  const form = useForm<{ name: string }>();
  return (
    <Form form={form} onSubmit={() => {}}>
      <FormField name="name" label="Name">
        <Input />
      </FormField>
      <FormMessage force>This field has an error</FormMessage>
      <button type="submit">Go</button>
    </Form>
  );
}

describe("FormMessage", () => {
  it("renders force text even without an error", () => {
    render(<ValidatedForm />);
    expect(screen.getByText("This field has an error")).toBeInTheDocument();
  });
});
