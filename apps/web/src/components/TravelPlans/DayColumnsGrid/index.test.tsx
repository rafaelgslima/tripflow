import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import {
  fetchDayPlans,
  moveItemToDay,
  reorderDayPlans,
  updateDayPlan,
} from "@/lib/api/dayPlans";
import { DayColumnsGrid } from "./index";

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

vi.mock("@/lib/api/dayPlans", () => ({
  fetchDayPlans: vi.fn(),
  createDayPlan: vi.fn(),
  updateDayPlan: vi.fn(),
  deleteDayPlan: vi.fn(),
  reorderDayPlans: vi.fn(),
  toggleDayPlanDone: vi.fn(),
  moveItemToDay: vi.fn(),
}));

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@dnd-kit/core")>();
  return { ...mod };
});

const days = [new Date("2026-03-20"), new Date("2026-03-21")];

describe("DayColumnsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: { access_token: "token" } },
      error: null,
    });
    vi.mocked(fetchDayPlans).mockResolvedValue([]);
    vi.mocked(reorderDayPlans).mockResolvedValue(undefined);
    vi.mocked(updateDayPlan).mockResolvedValue({} as never);
    vi.mocked(moveItemToDay).mockResolvedValue({} as never);
  });

  it("renders a column for each day", async () => {
    render(<DayColumnsGrid travelPlanId="plan-1" days={days} isMobile={false} />);

    await waitFor(() => {
      expect(screen.getByText("Day 1")).toBeInTheDocument();
      expect(screen.getByText("Day 2")).toBeInTheDocument();
    });
  });

  it("loads items for all days on mount", async () => {
    render(<DayColumnsGrid travelPlanId="plan-1" days={days} isMobile={false} />);

    await waitFor(() => {
      expect(vi.mocked(fetchDayPlans)).toHaveBeenCalledWith("plan-1", "2026-03-20", "token");
      expect(vi.mocked(fetchDayPlans)).toHaveBeenCalledWith("plan-1", "2026-03-21", "token");
    });
  });

  it("renders mobile layout when isMobile is true", async () => {
    render(<DayColumnsGrid travelPlanId="plan-1" days={days} isMobile={true} />);

    await waitFor(() => {
      expect(screen.getByText("Day 1")).toBeInTheDocument();
    });
  });

  it("displays items loaded for a day", async () => {
    vi.mocked(fetchDayPlans)
      .mockResolvedValueOnce([
        {
          id: "item-1",
          travel_plan_id: "plan-1",
          date: "2026-03-20",
          time: null,
          description: "Morning hike",
          is_done: false,
          created_by_user_id: "user-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .mockResolvedValueOnce([]);

    render(<DayColumnsGrid travelPlanId="plan-1" days={days} isMobile={false} />);

    await waitFor(() => {
      expect(screen.getByText("Morning hike")).toBeInTheDocument();
    });
  });
});
