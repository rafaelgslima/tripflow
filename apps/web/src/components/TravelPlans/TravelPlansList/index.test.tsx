import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { TravelPlansList } from "./index";
import type { TravelPlan } from "@/components/TravelPlans/types";

vi.mock("../DayColumn", () => ({
  DayColumn: () => <div data-testid="day-column" />,
}));

describe("TravelPlansList", () => {
  const mockOnDeletePlan = vi.fn().mockResolvedValue(undefined);

  const mockPlans: TravelPlan[] = [
    {
      id: "1",
      destination: "Paris",
      startDate: new Date("2026-03-20"),
      endDate: new Date("2026-03-23"),
      createdAt: new Date(),
    },
    {
      id: "2",
      destination: "Tokyo",
      startDate: new Date("2026-04-10"),
      endDate: new Date("2026-04-15"),
      createdAt: new Date(),
    },
  ];

  it("should render list of travel plans", () => {
    render(<TravelPlansList plans={mockPlans} onDeletePlan={mockOnDeletePlan} />);

    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
  });

  it("should render plan with correct date format", () => {
    render(<TravelPlansList plans={mockPlans} onDeletePlan={mockOnDeletePlan} />);

    expect(screen.getByText(/Mar 20 - Mar 23, 2026/)).toBeInTheDocument();
  });

  it("should render day columns for each plan", () => {
    render(<TravelPlansList plans={mockPlans} onDeletePlan={mockOnDeletePlan} />);

    // Paris has 4 days (20, 21, 22, 23)
    const parisSection = screen
      .getByText("Paris")
      .closest("div")?.parentElement;
    expect(parisSection).toBeInTheDocument();
  });

  it("should render share button for each plan", () => {
    render(<TravelPlansList plans={mockPlans} onDeletePlan={mockOnDeletePlan} />);

    const buttons = screen.getAllByRole("button", {
      name: /share this plan with a friend/i,
    });
    expect(buttons).toHaveLength(2);
  });
});
