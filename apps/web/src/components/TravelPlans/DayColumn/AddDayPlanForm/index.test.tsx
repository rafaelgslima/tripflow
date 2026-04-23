import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddDayPlanForm } from "./index";

describe("AddDayPlanForm", () => {
  it("should render input and buttons", () => {
    render(<AddDayPlanForm onCancel={() => {}} onConfirm={() => {}} />);

    expect(
      screen.getByPlaceholderText(/what's the plan\?/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save/i }),
    ).toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<AddDayPlanForm onCancel={onCancel} onConfirm={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm with description when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<AddDayPlanForm onCancel={() => {}} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText(/what's the plan\?/i);
    fireEvent.change(input, { target: { value: "Visit Museum" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onConfirm).toHaveBeenCalledWith("Visit Museum", null);
  });

  it("should clear input after confirm", () => {
    const onConfirm = vi.fn();
    render(<AddDayPlanForm onCancel={() => {}} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText(
      /what's the plan\?/i,
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Visit Museum" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(input.value).toBe("");
  });

  it("should clear input after cancel", () => {
    const onCancel = vi.fn();
    render(<AddDayPlanForm onCancel={onCancel} onConfirm={() => {}} />);

    const input = screen.getByPlaceholderText(
      /what's the plan\?/i,
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Visit Museum" } });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(input.value).toBe("");
  });
});
