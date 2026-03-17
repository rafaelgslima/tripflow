import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteTravelPlanButton } from "./index";

describe("DeleteTravelPlanButton", () => {
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  it("renders the delete icon button", () => {
    render(<DeleteTravelPlanButton travelPlanId="plan-1" onDelete={mockOnDelete} />);

    expect(
      screen.getByRole("button", { name: /delete this travel plan/i }),
    ).toBeInTheDocument();
  });

  it("does not show the modal initially", () => {
    render(<DeleteTravelPlanButton travelPlanId="plan-1" onDelete={mockOnDelete} />);

    expect(
      screen.queryByRole("dialog", { name: /delete travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("opens the modal when the delete button is clicked", () => {
    render(<DeleteTravelPlanButton travelPlanId="plan-1" onDelete={mockOnDelete} />);

    fireEvent.click(
      screen.getByRole("button", { name: /delete this travel plan/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /delete travel plan/i }),
    ).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", () => {
    render(<DeleteTravelPlanButton travelPlanId="plan-1" onDelete={mockOnDelete} />);

    fireEvent.click(
      screen.getByRole("button", { name: /delete this travel plan/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(
      screen.queryByRole("dialog", { name: /delete travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("closes the modal when the close icon is clicked", () => {
    render(<DeleteTravelPlanButton travelPlanId="plan-1" onDelete={mockOnDelete} />);

    fireEvent.click(
      screen.getByRole("button", { name: /delete this travel plan/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));

    expect(
      screen.queryByRole("dialog", { name: /delete travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onDelete with the travelPlanId and closes the modal when Delete is confirmed", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<DeleteTravelPlanButton travelPlanId="plan-1" onDelete={onDelete} />);

    fireEvent.click(
      screen.getByRole("button", { name: /delete this travel plan/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(onDelete).toHaveBeenCalledWith("plan-1");

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /delete travel plan/i }),
      ).not.toBeInTheDocument();
    });
  });
});
