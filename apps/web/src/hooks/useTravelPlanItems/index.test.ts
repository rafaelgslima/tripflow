import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTravelPlanItems } from "./index";
import {
  createDayPlan,
  deleteDayPlan,
  fetchDayPlans,
  moveItemToDay,
  reorderDayPlans,
  toggleDayPlanDone,
  updateDayPlan,
} from "@/lib/api/dayPlans";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/api/dayPlans", () => ({
  fetchDayPlans: vi.fn(),
  createDayPlan: vi.fn(),
  updateDayPlan: vi.fn(),
  deleteDayPlan: vi.fn(),
  reorderDayPlans: vi.fn(),
  toggleDayPlanDone: vi.fn(),
  moveItemToDay: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

const TOKEN = "token-123";
const PLAN_ID = "plan-1";
const DAY1 = "2026-03-20";
const DAY2 = "2026-03-21";

const makeApiItem = (id: string, description: string, time: string | null = null) => ({
  id,
  travel_plan_id: PLAN_ID,
  date: DAY1,
  time,
  description,
  is_done: false,
  created_by_user_id: "user-1",
  created_at: "2026-03-16T00:00:00.000Z",
  updated_at: "2026-03-16T00:00:00.000Z",
});

describe("useTravelPlanItems", () => {
  const mockFetchDayPlans = vi.mocked(fetchDayPlans);
  const mockCreateDayPlan = vi.mocked(createDayPlan);
  const mockUpdateDayPlan = vi.mocked(updateDayPlan);
  const mockDeleteDayPlan = vi.mocked(deleteDayPlan);
  const mockReorderDayPlans = vi.mocked(reorderDayPlans);
  const mockToggleDayPlanDone = vi.mocked(toggleDayPlanDone);
  const mockMoveItemToDay = vi.mocked(moveItemToDay);

  beforeEach(() => {
    vi.resetAllMocks();
    (supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: { access_token: TOKEN } },
      error: null,
    });
    mockReorderDayPlans.mockResolvedValue(undefined);
  });

  describe("loadDay", () => {
    it("loads items for a day from the API", async () => {
      mockFetchDayPlans.mockResolvedValue([makeApiItem("item-1", "Breakfast")]);
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));

      await act(async () => { await result.current.loadDay(DAY1); });

      expect(mockFetchDayPlans).toHaveBeenCalledWith(PLAN_ID, DAY1, TOKEN);
      expect(result.current.getDay(DAY1).items).toHaveLength(1);
      expect(result.current.getDay(DAY1).items[0].description).toBe("Breakfast");
      expect(result.current.getDay(DAY1).isLoading).toBe(false);
    });

    it("sets loadError when fetch fails", async () => {
      mockFetchDayPlans.mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));

      await act(async () => { await result.current.loadDay(DAY1); });

      expect(result.current.getDay(DAY1).loadError).toBeTruthy();
      expect(result.current.getDay(DAY1).isLoading).toBe(false);
    });
  });

  describe("createItem", () => {
    it("appends a new item to the day's list", async () => {
      mockFetchDayPlans.mockResolvedValue([]);
      mockCreateDayPlan.mockResolvedValue(makeApiItem("item-1", "Lunch"));
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => { await result.current.loadDay(DAY1); });

      await act(async () => { await result.current.createItem(DAY1, "Lunch", null); });

      expect(result.current.getDay(DAY1).items).toHaveLength(1);
      expect(result.current.getDay(DAY1).items[0].description).toBe("Lunch");
    });

    it("sorts and reorders after create when time is set", async () => {
      const existingItem = makeApiItem("item-1", "Late Lunch", "14:00");
      mockFetchDayPlans.mockResolvedValue([existingItem]);
      mockCreateDayPlan.mockResolvedValue({ ...makeApiItem("item-2", "Early Breakfast", "07:00"), time: "07:00" });
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => { await result.current.loadDay(DAY1); });

      await act(async () => { await result.current.createItem(DAY1, "Early Breakfast", "07:00"); });

      const items = result.current.getDay(DAY1).items;
      expect(items[0].description).toBe("Early Breakfast");
      expect(items[1].description).toBe("Late Lunch");
      expect(mockReorderDayPlans).toHaveBeenCalled();
    });

    it("sets createError when API fails", async () => {
      mockFetchDayPlans.mockResolvedValue([]);
      mockCreateDayPlan.mockRejectedValue(new Error("Server error"));
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => { await result.current.loadDay(DAY1); });

      await act(async () => {
        await result.current.createItem(DAY1, "Lunch", null).catch(() => {});
      });

      expect(result.current.getDay(DAY1).createError).toBeTruthy();
    });
  });

  describe("deleteItem", () => {
    it("removes the item from the day's list", async () => {
      mockFetchDayPlans.mockResolvedValue([makeApiItem("item-1", "Breakfast")]);
      mockDeleteDayPlan.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => { await result.current.loadDay(DAY1); });

      await act(async () => { await result.current.deleteItem(DAY1, "item-1"); });

      expect(result.current.getDay(DAY1).items).toHaveLength(0);
    });
  });

  describe("toggleDone", () => {
    it("optimistically toggles isDone", async () => {
      mockFetchDayPlans.mockResolvedValue([makeApiItem("item-1", "Breakfast")]);
      mockToggleDayPlanDone.mockResolvedValue(makeApiItem("item-1", "Breakfast") as never);
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => { await result.current.loadDay(DAY1); });

      act(() => { void result.current.toggleDone(DAY1, "item-1", true); });

      expect(result.current.getDay(DAY1).items[0].isDone).toBe(true);
    });

    it("rolls back on failure", async () => {
      mockFetchDayPlans.mockResolvedValue([makeApiItem("item-1", "Breakfast")]);
      mockToggleDayPlanDone.mockRejectedValue(new Error("fail"));
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => { await result.current.loadDay(DAY1); });

      await act(async () => { await result.current.toggleDone(DAY1, "item-1", true); });

      await waitFor(() => {
        expect(result.current.getDay(DAY1).items[0].isDone).toBe(false);
      });
    });
  });

  describe("moveItemBetweenDays", () => {
    const item1 = makeApiItem("item-1", "Morning run", "08:00");
    const item2 = { ...makeApiItem("item-2", "Afternoon tour", "14:00"), date: DAY2, time: "14:00" };

    beforeEach(() => {
      mockFetchDayPlans
        .mockResolvedValueOnce([item1])   // loadDay(DAY1)
        .mockResolvedValueOnce([item2]);  // loadDay(DAY2)
      mockMoveItemToDay.mockResolvedValue({ ...item1, date: DAY2 } as never);
    });

    it("moves item from source day to target day", async () => {
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => {
        await result.current.loadDay(DAY1);
        await result.current.loadDay(DAY2);
      });

      await act(async () => {
        await result.current.moveItemBetweenDays("item-1", DAY1, DAY2);
      });

      expect(result.current.getDay(DAY1).items).toHaveLength(0);
      expect(result.current.getDay(DAY2).items).toHaveLength(2);
    });

    it("preserves original time of the moved item", async () => {
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => {
        await result.current.loadDay(DAY1);
        await result.current.loadDay(DAY2);
      });

      await act(async () => {
        await result.current.moveItemBetweenDays("item-1", DAY1, DAY2);
      });

      expect(mockMoveItemToDay).toHaveBeenCalledWith(
        PLAN_ID, DAY1, "item-1",
        { target_day: DAY2, time: "08:00" },
        TOKEN,
      );
      // target item's time must not be updated
      expect(mockUpdateDayPlan).not.toHaveBeenCalled();
    });

    it("places the moved item in sorted time position in the target day", async () => {
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => {
        await result.current.loadDay(DAY1);
        await result.current.loadDay(DAY2);
      });

      await act(async () => {
        await result.current.moveItemBetweenDays("item-1", DAY1, DAY2);
      });

      // item-1 has time 08:00, item-2 has 14:00 → item-1 should be first in DAY2
      const toItems = result.current.getDay(DAY2).items;
      expect(toItems[0].id).toBe("item-1");
      expect(toItems[1].id).toBe("item-2");
    });

    it("rolls back optimistic update on API failure", async () => {
      mockMoveItemToDay.mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => {
        await result.current.loadDay(DAY1);
        await result.current.loadDay(DAY2);
      });

      await act(async () => {
        await result.current.moveItemBetweenDays("item-1", DAY1, DAY2);
      });

      await waitFor(() => {
        expect(result.current.getDay(DAY1).items).toHaveLength(1);
        expect(result.current.getDay(DAY1).items[0].id).toBe("item-1");
        expect(result.current.getDay(DAY2).items).toHaveLength(1);
        expect(result.current.getDay(DAY2).items[0].id).toBe("item-2");
      });
    });

    it("skips fromDay reorder when source day becomes empty", async () => {
      const { result } = renderHook(() => useTravelPlanItems({ travelPlanId: PLAN_ID }));
      await act(async () => {
        await result.current.loadDay(DAY1);
        await result.current.loadDay(DAY2);
      });

      await act(async () => {
        await result.current.moveItemBetweenDays("item-1", DAY1, DAY2);
      });

      // reorderDayPlans called once for toDay only, not for empty fromDay
      const reorderCalls = mockReorderDayPlans.mock.calls;
      expect(reorderCalls.filter((c) => c[1] === DAY1)).toHaveLength(0);
      expect(reorderCalls.filter((c) => c[1] === DAY2)).toHaveLength(1);
    });
  });
});
