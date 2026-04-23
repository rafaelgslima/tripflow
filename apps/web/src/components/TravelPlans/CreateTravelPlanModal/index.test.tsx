import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CreateTravelPlanModal } from "./index";

describe("CreateTravelPlanModal", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(
      <CreateTravelPlanModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.queryByText("Create New Trip Plan")).not.toBeInTheDocument();
  });

  it("should render modal when isOpen is true", () => {
    render(
      <CreateTravelPlanModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    expect(screen.getByText("Create New Trip Plan")).toBeInTheDocument();
    expect(screen.getByLabelText(/destination city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", () => {
    render(
      <CreateTravelPlanModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should reset fields when reset button is clicked", () => {
    render(
      <CreateTravelPlanModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const destinationInput = screen.getByLabelText(
      /destination city/i,
    ) as HTMLInputElement;
    fireEvent.change(destinationInput, { target: { value: "Paris" } });

    expect(destinationInput.value).toBe("Paris");

    const resetButton = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetButton);

    expect(destinationInput.value).toBe("");
  });

  it("should show validation error when destination is empty on confirm", () => {
    render(
      <CreateTravelPlanModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(screen.getByText(/destination is required/i)).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should show validation error when dates are not selected", () => {
    render(
      <CreateTravelPlanModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const destinationInput = screen.getByLabelText(/destination city/i);
    fireEvent.change(destinationInput, { target: { value: "Paris" } });

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should show validation error when end date is before start date", () => {
    render(
      <CreateTravelPlanModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const destinationInput = screen.getByLabelText(/destination city/i);
    fireEvent.change(destinationInput, { target: { value: "Paris" } });

    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: "2026-03-20" } });

    const endDateInput = screen.getByLabelText(/end date/i);
    fireEvent.change(endDateInput, { target: { value: "2026-03-15" } });

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(
      screen.getByText(/end date must be after start date/i),
    ).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should call onConfirm with valid data", () => {
    render(
      <CreateTravelPlanModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    );

    const destinationInput = screen.getByLabelText(/destination city/i);
    fireEvent.change(destinationInput, { target: { value: "Paris" } });

    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: "2026-03-20" } });

    const endDateInput = screen.getByLabelText(/end date/i);
    fireEvent.change(endDateInput, { target: { value: "2026-03-25" } });

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(
      "Paris",
      new Date("2026-03-20"),
      new Date("2026-03-25"),
    );
  });
});
