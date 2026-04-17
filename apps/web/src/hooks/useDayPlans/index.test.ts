import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDayPlans } from "./index";
import {
  createDayPlan,
  deleteDayPlan,
  fetchDayPlans,
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
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe("useDayPlans", () => {
  const mockFetchDayPlans = vi.mocked(fetchDayPlans);
  const mockCreateDayPlan = vi.mocked(createDayPlan);
  const mockUpdateDayPlan = vi.mocked(updateDayPlan);
  const mockDeleteDayPlan = vi.mocked(deleteDayPlan);
  const mockReorderDayPlans = vi.mocked(reorderDayPlans);
  const mockToggleDayPlanDone = vi.mocked(toggleDayPlanDone);
  const mockGetSession = vi.mocked(supabase.auth.getSession);

  const travelPlanId = "plan-1";
  const date = new Date("2026-03-20");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads day plans from API", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    } as never);

    mockFetchDayPlans.mockResolvedValue([
      {
        id: "item-1",
        travel_plan_id: travelPlanId,
        date: "2026-03-20",
        time: null,
        description: "Breakfast",
        is_done: false,
        created_by_user_id: "user-1",
        created_at: "2026-03-16T00:00:00.000Z",
        updated_at: "2026-03-16T00:00:00.000Z",
      },
    ]);

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.loadDayPlans();
    });

    expect(mockFetchDayPlans).toHaveBeenCalledWith(
      travelPlanId,
      "2026-03-20",
      "token-123",
    );

    expect(result.current.itineraryItems).toHaveLength(1);
    expect(result.current.itineraryItems[0]).toMatchObject({
      id: "item-1",
      description: "Breakfast",
    });
  });

  it("creates a day plan and appends it to local state", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-abc" } },
      error: null,
    } as never);

    mockFetchDayPlans.mockResolvedValue([]);
    mockCreateDayPlan.mockResolvedValue({
      id: "item-2",
      travel_plan_id: travelPlanId,
      date: "2026-03-20",
      time: null,
      description: "Visit museum",
      is_done: false,
      created_by_user_id: "user-1",
      created_at: "2026-03-16T00:00:00.000Z",
      updated_at: "2026-03-16T00:00:00.000Z",
    });

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.loadDayPlans();
    });

    await act(async () => {
      await result.current.createDayPlan("Visit museum");
    });

    expect(mockCreateDayPlan).toHaveBeenCalledWith(
      travelPlanId,
      "2026-03-20",
      { description: "Visit museum", time: null },
      "token-abc",
    );

    await waitFor(() => {
      expect(result.current.itineraryItems).toHaveLength(1);
    });
    expect(result.current.itineraryItems[0]).toMatchObject({
      id: "item-2",
      description: "Visit museum",
    });
  });

  it("sets createError when there is no active session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await expect(
        result.current.createDayPlan("Visit museum"),
      ).rejects.toThrow("Session not found");
    });

    await waitFor(() => {
      expect(result.current.createError).toBe(
        "Unable to save day plan. Try again later.",
      );
    });

    act(() => {
      result.current.clearCreateError();
    });

    expect(result.current.createError).toBeNull();
  });

  it("updates a day plan and replaces it in local state", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-xyz" } },
      error: null,
    } as never);

    mockFetchDayPlans.mockResolvedValue([
      {
        id: "item-1",
        travel_plan_id: travelPlanId,
        date: "2026-03-20",
        time: null,
        description: "Breakfast",
        is_done: false,
        created_by_user_id: "user-1",
        created_at: "2026-03-16T00:00:00.000Z",
        updated_at: "2026-03-16T00:00:00.000Z",
      },
    ]);

    mockUpdateDayPlan.mockResolvedValue({
      id: "item-1",
      travel_plan_id: travelPlanId,
      date: "2026-03-20",
      time: null,
      description: "Brunch",
      is_done: false,
      created_by_user_id: "user-1",
      created_at: "2026-03-16T00:00:00.000Z",
      updated_at: "2026-03-16T00:00:00.000Z",
    });

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.loadDayPlans();
    });

    await act(async () => {
      await result.current.updateDayPlan("item-1", "Brunch");
    });

    expect(mockUpdateDayPlan).toHaveBeenCalledWith(
      travelPlanId,
      "2026-03-20",
      "item-1",
      { description: "Brunch", time: null },
      "token-xyz",
    );

    expect(result.current.itineraryItems[0]).toMatchObject({
      id: "item-1",
      description: "Brunch",
    });
  });

  it("deletes a day plan and removes it from local state", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-del" } },
      error: null,
    } as never);

    mockFetchDayPlans.mockResolvedValue([
      {
        id: "item-1",
        travel_plan_id: travelPlanId,
        date: "2026-03-20",
        time: null,
        description: "Breakfast",
        is_done: false,
        created_by_user_id: "user-1",
        created_at: "2026-03-16T00:00:00.000Z",
        updated_at: "2026-03-16T00:00:00.000Z",
      },
    ]);

    mockDeleteDayPlan.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.loadDayPlans();
    });

    await act(async () => {
      await result.current.deleteDayPlan("item-1");
    });

    expect(mockDeleteDayPlan).toHaveBeenCalledWith(
      travelPlanId,
      "2026-03-20",
      "item-1",
      "token-del",
    );

    expect(result.current.itineraryItems).toHaveLength(0);
  });

  it("toggleDone optimistically marks item as done and calls the API", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-toggle" } },
      error: null,
    } as never);

    mockFetchDayPlans.mockResolvedValue([
      {
        id: "item-1",
        travel_plan_id: travelPlanId,
        date: "2026-03-20",
        time: null,
        description: "Breakfast",
        is_done: false,
        created_by_user_id: "user-1",
        created_at: "2026-03-16T00:00:00.000Z",
        updated_at: "2026-03-16T00:00:00.000Z",
      },
    ]);

    mockToggleDayPlanDone.mockResolvedValue({
      id: "item-1",
      travel_plan_id: travelPlanId,
      date: "2026-03-20",
      time: null,
      description: "Breakfast",
      is_done: true,
      created_by_user_id: "user-1",
      created_at: "2026-03-16T00:00:00.000Z",
      updated_at: "2026-03-16T00:00:00.000Z",
    });

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.loadDayPlans();
    });

    await act(async () => {
      await result.current.toggleDone("item-1", true);
    });

    expect(mockToggleDayPlanDone).toHaveBeenCalledWith(
      travelPlanId,
      "2026-03-20",
      "item-1",
      true,
      "token-toggle",
    );

    expect(result.current.itineraryItems[0].isDone).toBe(true);
  });

  it("toggleDone reverts optimistic update on API failure", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-revert" } },
      error: null,
    } as never);

    mockFetchDayPlans.mockResolvedValue([
      {
        id: "item-1",
        travel_plan_id: travelPlanId,
        date: "2026-03-20",
        time: null,
        description: "Breakfast",
        is_done: false,
        created_by_user_id: "user-1",
        created_at: "2026-03-16T00:00:00.000Z",
        updated_at: "2026-03-16T00:00:00.000Z",
      },
    ]);

    mockToggleDayPlanDone.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.loadDayPlans();
    });

    await act(async () => {
      await result.current.toggleDone("item-1", true);
    });

    // Should revert to false after failure
    expect(result.current.itineraryItems[0].isDone).toBe(false);
    expect(result.current.toggleDoneError).toBe(
      "Unable to update activity. Try again later.",
    );
  });

  it("toggleDone unchecks (undo) a done item", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-undo" } },
      error: null,
    } as never);

    mockFetchDayPlans.mockResolvedValue([
      {
        id: "item-1",
        travel_plan_id: travelPlanId,
        date: "2026-03-20",
        time: null,
        description: "Breakfast",
        is_done: true,
        created_by_user_id: "user-1",
        created_at: "2026-03-16T00:00:00.000Z",
        updated_at: "2026-03-16T00:00:00.000Z",
      },
    ]);

    mockToggleDayPlanDone.mockResolvedValue({
      id: "item-1",
      travel_plan_id: travelPlanId,
      date: "2026-03-20",
      time: null,
      description: "Breakfast",
      is_done: false,
      created_by_user_id: "user-1",
      created_at: "2026-03-16T00:00:00.000Z",
      updated_at: "2026-03-16T00:00:00.000Z",
    });

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.loadDayPlans();
    });

    await act(async () => {
      await result.current.toggleDone("item-1", false);
    });

    expect(mockToggleDayPlanDone).toHaveBeenCalledWith(
      travelPlanId,
      "2026-03-20",
      "item-1",
      false,
      "token-undo",
    );

    expect(result.current.itineraryItems[0].isDone).toBe(false);
  });

  it("reorders day plans by calling the API", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-reorder" } },
      error: null,
    } as never);

    mockReorderDayPlans.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDayPlans({ travelPlanId, date }));

    await act(async () => {
      await result.current.reorderDayPlans(["item-2", "item-1"]);
    });

    expect(mockReorderDayPlans).toHaveBeenCalledWith(
      travelPlanId,
      "2026-03-20",
      { itemIdsInOrder: ["item-2", "item-1"] },
      "token-reorder",
    );
  });
});
