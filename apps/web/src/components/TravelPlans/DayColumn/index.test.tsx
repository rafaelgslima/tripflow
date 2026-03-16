import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import {
  createDayPlan,
  fetchDayPlans,
  updateDayPlan,
} from "@/lib/api/dayPlans";
import { DayColumn } from "./index";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/api/dayPlans", () => ({
  fetchDayPlans: vi.fn(),
  createDayPlan: vi.fn(),
  updateDayPlan: vi.fn(),
}));

describe("DayColumn", () => {
  const mockDate = new Date("2026-03-20");
  const mockFetchDayPlans = vi.mocked(fetchDayPlans);

  beforeEach(() => {
    vi.clearAllMocks();
    (
      supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: {
        session: {
          access_token: "token",
        },
      },
    });
    mockFetchDayPlans.mockResolvedValue([]);
  });

  const waitForInitialLoad = async () => {
    await waitFor(() => {
      expect(mockFetchDayPlans).toHaveBeenCalled();
    });
  };

  it("should render day column with date and day number", async () => {
    render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

    await waitForInitialLoad();

    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText(/Fri/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 20/)).toBeInTheDocument();
  });

  it("should render add plan button", async () => {
    render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

    await waitForInitialLoad();

    expect(
      screen.getByRole("button", { name: /add plan/i }),
    ).toBeInTheDocument();
  });

  it("should render as accordion on mobile", async () => {
    render(
      <DayColumn
        date={mockDate}
        dayNumber={1}
        travelPlanId="plan-1"
        isMobile={true}
      />,
    );

    await waitForInitialLoad();

    const accordionButton = screen.getByRole("button", {
      name: /day 1/i,
    });
    expect(accordionButton).toBeInTheDocument();
  });

  it("should toggle accordion content on mobile", async () => {
    render(
      <DayColumn
        date={mockDate}
        dayNumber={1}
        travelPlanId="plan-1"
        isMobile={true}
      />,
    );

    await waitForInitialLoad();

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
    it("should show input and buttons when Add Plan is clicked", async () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

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

    it("should cancel adding a plan and return to initial state", async () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

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

    it("should save a new itinerary item when confirmed", async () => {
      (createDayPlan as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "item-1",
        travel_plan_id: "plan-1",
        date: "2026-03-20",
        time: null,
        description: "Visit Museum",
        created_by_user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      // Should display the saved item
      await waitFor(() => {
        expect(screen.getByText("Visit Museum")).toBeInTheDocument();
      });
      // Should hide the input form
      expect(
        screen.queryByPlaceholderText(/what's the plan\?/i),
      ).not.toBeInTheDocument();
      // Should show Add Plan button again for adding more items
      expect(
        screen.getByRole("button", { name: /add plan/i }),
      ).toBeInTheDocument();
    });

    it("should not save an empty itinerary item", async () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      // Should still show the input (not saved)
      expect(
        screen.getByPlaceholderText(/what's the plan\?/i),
      ).toBeInTheDocument();
    });

    it("should allow adding multiple itinerary items", async () => {
      (createDayPlan as unknown as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          id: "item-1",
          travel_plan_id: "plan-1",
          date: "2026-03-20",
          time: null,
          description: "Visit Museum",
          created_by_user_id: "user-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          id: "item-2",
          travel_plan_id: "plan-1",
          date: "2026-03-20",
          time: null,
          description: "Lunch at Restaurant",
          created_by_user_id: "user-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

      // Add first item
      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Visit Museum")).toBeInTheDocument();
      });

      // Add second item
      const addButton2 = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton2);

      const input2 = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input2, { target: { value: "Lunch at Restaurant" } });

      const confirmButton2 = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton2);

      // Should display both items
      await waitFor(() => {
        expect(screen.getByText("Visit Museum")).toBeInTheDocument();
        expect(screen.getByText("Lunch at Restaurant")).toBeInTheDocument();
      });
    });

    it("should display No plans yet when no items exist and not adding", async () => {
      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

      await waitFor(() => {
        expect(screen.getByText(/no plans yet/i)).toBeInTheDocument();
      });
    });

    it("should hide No plans yet when items exist", async () => {
      (createDayPlan as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "item-1",
        travel_plan_id: "plan-1",
        date: "2026-03-20",
        time: null,
        description: "Visit Museum",
        created_by_user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

      // Add an item
      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText("Visit Museum")).toBeInTheDocument();
      });

      // Should not show "No plans yet"
      expect(screen.queryByText(/no plans yet/i)).not.toBeInTheDocument();
    });

    it("should render saved item card for click and long-press interactions", async () => {
      (createDayPlan as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "item-1",
        travel_plan_id: "plan-1",
        date: "2026-03-20",
        time: null,
        description: "Visit Museum",
        created_by_user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

      await waitForInitialLoad();

      const addButton = screen.getByRole("button", { name: /add plan/i });
      fireEvent.click(addButton);

      const input = screen.getByPlaceholderText(/what's the plan\?/i);
      fireEvent.change(input, { target: { value: "Visit Museum" } });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/plan visit museum/i)).toBeInTheDocument();
      });
    });
  });

  it("updates an itinerary item when edited", async () => {
    mockFetchDayPlans.mockResolvedValue([
      {
        id: "item-1",
        travel_plan_id: "plan-1",
        date: "2026-03-20",
        time: null,
        description: "Breakfast",
        created_by_user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    (updateDayPlan as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "item-1",
      travel_plan_id: "plan-1",
      date: "2026-03-20",
      time: null,
      description: "Brunch",
      created_by_user_id: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<DayColumn date={mockDate} dayNumber={1} travelPlanId="plan-1" />);

    await waitFor(() => {
      expect(screen.getByText("Breakfast")).toBeInTheDocument();
    });

    const item = screen.getByLabelText("Plan Breakfast");
    fireEvent.pointerDown(item);
    fireEvent.pointerUp(item);

    const input = await screen.findByPlaceholderText(/what's the plan\?/i);
    fireEvent.change(input, { target: { value: "Brunch" } });

    const updateButton = screen.getByRole("button", { name: /update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(updateDayPlan).toHaveBeenCalledWith(
        "plan-1",
        "2026-03-20",
        "item-1",
        { description: "Brunch" },
        "token",
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Brunch")).toBeInTheDocument();
    });
  });
});
