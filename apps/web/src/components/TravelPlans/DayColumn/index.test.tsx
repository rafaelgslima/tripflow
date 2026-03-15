import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DayColumn } from "./index";

describe("DayColumn", () => {
  const mockDate = new Date("2026-03-20");

  it("should render day column with date and day number", () => {
    render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText(/Fri/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 20/)).toBeInTheDocument();
  });

  it("should render add plan button", () => {
    render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

    expect(
      screen.getByRole("button", { name: /add plan/i }),
    ).toBeInTheDocument();
  });

  it("should render as accordion on mobile", () => {
    render(
      <DayColumn
        date={mockDate}
        dayNumber={1}
        travelPlanId="plan-1"
        isMobile={true}
      />,
    );

    const accordionButton = screen.getByRole("button", {
      name: /day 1/i,
    });
    expect(accordionButton).toBeInTheDocument();
  });

  it("should toggle accordion content on mobile", () => {
    render(
      <DayColumn
        date={mockDate}
        dayNumber={1}
        travelPlanId="plan-1"
        isMobile={true}
      />,
    );

    const accordionButton = screen.getByRole("button", {
      name: /day 1/i,
    });

    // Content should be hidden initially
    expect(
      screen.queryByRole("button", { name: /add plan/i }),
    ).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(accordionButton);

    // Content should be visible
    expect(screen.getByRole("button", { name: /add plan/i })).toBeVisible();
  });

  describe("Adding itinerary items", () => {
    it("should show input and buttons when Add Plan is clicked", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      // Should show input
      expect(
        screen.getByPlaceholderText(/what's the plan\?/i),
      ).toBeInTheDocument();
      // Should show cancel and confirm buttons
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm/i }),
      ).toBeInTheDocument();
      // Should hide the Add Plan button
      expect(
        screen.queryByRole("button", { name: /add plan/i }),
      ).not.toBeInTheDocument();
    });

    it("should cancel adding a plan and return to initial state", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Should hide input and buttons
      expect(
        screen.queryByPlaceholderText(/what's the plan\?/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /cancel/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /confirm/i }),
      ).not.toBeInTheDocument();
      // Should show Add Plan button again
      expect(
        screen.getByRole("button", { name: /add plan/i }),
      ).toBeInTheDocument();
    });

    it("should save a new itinerary item when confirmed", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      // Should display the saved item
      expect(screen.getByText("Visit Museum")).toBeInTheDocument();
      // Should hide the input form
      expect(
        screen.queryByPlaceholderText(/what's the plan\?/i),
      ).not.toBeInTheDocument();
      // Should show Add Plan button again for adding more items
      expect(
        screen.getByRole("button", { name: /add plan/i }),
      ).toBeInTheDocument();
    });

    it("should not save an empty itinerary item", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      // Should still show the input (not saved)
      expect(
        screen.getByPlaceholderText(/what's the plan\?/i),
      ).toBeInTheDocument();
    });

    it("should allow adding multiple itinerary items", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      // Add first item
      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      // Add second item
      const addButton2 = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton2);

      const input2 = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input2, { target: { value: "Lunch at Restaurant" } });

      const confirmButton2 = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton2);

      // Should display both items
      expect(screen.getByText("Visit Museum")).toBeInTheDocument();
      expect(screen.getByText("Lunch at Restaurant")).toBeInTheDocument();
    });

    it("should display No plans yet when no items exist and not adding", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      expect(screen.getByText(/no plans yet/i)).toBeInTheDocument();
    });

    it("should hide No plans yet when items exist", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      // Add an item
      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      // Should not show "No plans yet"
      expect(screen.queryByText(/no plans yet/i)).not.toBeInTheDocument();
    });

    it("should render saved item card for click and long-press interactions", () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      expect(screen.getByLabelText(/plan visit museum/i)).toBeInTheDocument();
    });
  });
});
