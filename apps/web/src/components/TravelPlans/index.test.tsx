import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TravelPlans } from "./index";

const useTravelPlansMock = vi.fn();

vi.mock("@/hooks/useTravelPlans", () => ({
  useTravelPlans: () => useTravelPlansMock(),
}));

describe("TravelPlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component with title and create button", () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: null,
      loadTravelPlans: vi.fn().mockResolvedValue(undefined),
      createPlan: vi.fn(),
      createError: null,
      isCreating: false,
    });

    render(<TravelPlans />);

    expect(screen.getByText("Plan Your Dream Adventures")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create and organize your travel itineraries in one place",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create new trip plan/i }),
    ).toBeInTheDocument();
  });

  it("should open modal when create button is clicked", () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: null,
      loadTravelPlans: vi.fn().mockResolvedValue(undefined),
      createPlan: vi.fn(),
      createError: null,
      isCreating: false,
    });

    render(<TravelPlans />);

    const createButton = screen.getByRole("button", {
      name: /create new trip plan/i,
    });
    fireEvent.click(createButton);

    expect(
      screen.getByRole("heading", { name: /create new trip plan/i }),
    ).toBeInTheDocument();
  });

  it("should not show travel plans list initially", async () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: null,
      loadTravelPlans: vi.fn().mockResolvedValue(undefined),
      createPlan: vi.fn(),
      createError: null,
      isCreating: false,
    });

    render(<TravelPlans />);

    await waitFor(() => {
      expect(screen.queryByTestId("travel-plans-list")).not.toBeInTheDocument();
    });
  });

  it("should show loading state while fetching travel plans", () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: true,
      loadError: null,
      loadTravelPlans: vi.fn().mockResolvedValue(undefined),
      createPlan: vi.fn(),
      createError: null,
      isCreating: false,
    });

    render(<TravelPlans />);

    expect(screen.getByTestId("travel-plans-loading")).toBeInTheDocument();
    expect(screen.getByText(/loading travel plans/i)).toBeInTheDocument();
  });

  it("should show load error when travel plans cannot be retrieved", async () => {
    useTravelPlansMock.mockReturnValue({
      travelPlans: [],
      isLoading: false,
      loadError: "Travel plans couldn't be retrieved.",
      loadTravelPlans: vi.fn().mockResolvedValue(undefined),
      createPlan: vi.fn(),
      createError: null,
      isCreating: false,
    });

    render(<TravelPlans />);

    await waitFor(() => {
      expect(screen.getByTestId("travel-plans-load-error")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Travel plans couldn't be retrieved."),
    ).toBeInTheDocument();
  });
});
