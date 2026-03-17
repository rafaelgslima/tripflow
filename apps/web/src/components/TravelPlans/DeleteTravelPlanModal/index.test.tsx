import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteTravelPlanModal } from "./index";

describe("DeleteTravelPlanModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  it("renders nothing when isOpen is false", () => {
    render(<DeleteTravelPlanModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByRole("dialog", { name: /delete travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the modal when isOpen is true", () => {
    render(<DeleteTravelPlanModal {...defaultProps} />);

    expect(
      screen.getByRole("dialog", { name: /delete travel plan/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /delete travel plan/i }),
    ).toBeInTheDocument();
  });

  it("renders the warning text about permanent deletion", () => {
    render(<DeleteTravelPlanModal {...defaultProps} />);

    expect(screen.getByText(/permanent/i)).toBeInTheDocument();
  });

  it("renders the Cancel and Delete buttons", () => {
    render(<DeleteTravelPlanModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
  });

  it("renders the close icon button", () => {
    render(<DeleteTravelPlanModal {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /close modal/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose when the close icon button is clicked", () => {
    const onClose = vi.fn();
    render(<DeleteTravelPlanModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the Cancel button is clicked", () => {
    const onClose = vi.fn();
    render(<DeleteTravelPlanModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<DeleteTravelPlanModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(
      screen.getByTestId("delete-travel-plan-backdrop"),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when the Delete button is clicked", () => {
    const onConfirm = vi.fn();
    render(<DeleteTravelPlanModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
