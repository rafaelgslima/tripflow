import { render, screen, fireEvent } from "@testing-library/react";
import { DayColumn } from "./index";

describe("DayColumn", () => {
  const mockDate = new Date("2026-03-20");

  it("should render day column with date and day number", () => {
    render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText(/Thu/)).toBeInTheDocument();
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
    ).not.toBeVisible();

    // Click to expand
    fireEvent.click(accordionButton);

    // Content should be visible
    expect(screen.getByRole("button", { name: /add plan/i })).toBeVisible();
  });
});
