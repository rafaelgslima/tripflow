import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PastTrips } from "./index";
import type { TravelPlan } from "../TravelPlans/types";

// Mock the hook
const useTravelPlansMock = vi.fn();
vi.mock("@/hooks/useTravelPlans", () => ({
  useTravelPlans: () => useTravelPlansMock(),
}));

// Mock TravelPlansList
vi.mock("../TravelPlans/TravelPlansList", () => ({
  TravelPlansList: ({ readOnly }: { readOnly?: boolean }) => (
    <div data-testid="travel-plans-list" data-readonly={String(readOnly)} />
  ),
}));

// Mock Loading
vi.mock("@/components/Loading/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

describe("PastTrips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page heading 'Past trips'", async () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: null,
      loadTravelPlans: vi.fn(),
    });

    render(<PastTrips />);
    expect(screen.getByText("Past trips")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: null,
      loadTravelPlans: vi.fn(),
    });

    render(<PastTrips />);
    expect(screen.getByText("A record of your completed adventures")).toBeInTheDocument();
  });

  it("shows loading spinner while fetching", () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: true,
      loadError: null,
      loadTravelPlans: vi.fn(),
    });

    render(<PastTrips />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByText("Loading your past trips…")).toBeInTheDocument();
  });

  it("shows load error when fetch fails", () => {
    const errorMessage = "Failed to load trips";
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: errorMessage,
      loadTravelPlans: vi.fn(),
    });

    render(<PastTrips />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("shows empty state when no plans", () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: null,
      loadTravelPlans: vi.fn(),
    });

    render(<PastTrips />);
    expect(screen.getByText("Your archive is empty")).toBeInTheDocument();
    expect(screen.getByText(/When a trip ends, it becomes part of your travel history/)).toBeInTheDocument();
  });

  it("renders TravelPlansList with readOnly=true when plans exist", () => {
    const mockPlans: TravelPlan[] = [
      {
        id: "1",
        destination: "Paris",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-05"),
        createdAt: new Date(),
      },
    ];

    useTravelPlansMock.mockReturnValue({
      travelPlans: mockPlans,
      isLoading: false,
      loadError: null,
      loadTravelPlans: vi.fn(),
    });

    render(<PastTrips />);
    const list = screen.getByTestId("travel-plans-list");
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute("data-readonly", "true");
  });
});
