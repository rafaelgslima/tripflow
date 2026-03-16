import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTravelPlans } from "./index";
import { createTravelPlan, fetchTravelPlans } from "@/lib/api/travelPlans";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/api/travelPlans", () => ({
  createTravelPlan: vi.fn(),
  fetchTravelPlans: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe("useTravelPlans", () => {
  const mockCreateTravelPlan = vi.mocked(createTravelPlan);
  const mockFetchTravelPlans = vi.mocked(fetchTravelPlans);
  const mockGetSession = vi.mocked(supabase.auth.getSession);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a travel plan and appends it to local state", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    } as never);

    mockCreateTravelPlan.mockResolvedValue({
      id: "plan-1",
      owner_user_id: "user-1",
      destination_city: "Paris",
      start_date: "2026-05-01",
      end_date: "2026-05-05",
      created_at: "2026-03-16T00:00:00.000Z",
      updated_at: "2026-03-16T00:00:00.000Z",
    });

    const { result } = renderHook(() => useTravelPlans());

    mockFetchTravelPlans.mockResolvedValue([] as never);
    await act(async () => {
      await result.current.loadTravelPlans();
    });

    await act(async () => {
      await result.current.createPlan(
        "Paris",
        new Date("2026-05-01"),
        new Date("2026-05-05"),
      );
    });

    expect(mockCreateTravelPlan).toHaveBeenCalledWith(
      {
        destination_city: "Paris",
        start_date: "2026-05-01",
        end_date: "2026-05-05",
      },
      "token-123",
    );

    await waitFor(() => {
      expect(result.current.travelPlans).toHaveLength(1);
    });
    expect(result.current.travelPlans[0]).toMatchObject({
      id: "plan-1",
      destination: "Paris",
    });
  });

  it("sets an error when there is no active session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    const { result } = renderHook(() => useTravelPlans());

    await act(async () => {
      await result.current.loadTravelPlans();
    });

    await act(async () => {
      await expect(
        result.current.createPlan(
          "Paris",
          new Date("2026-05-01"),
          new Date("2026-05-05"),
        ),
      ).rejects.toThrow("Session not found");
    });

    await waitFor(() => {
      expect(result.current.createError).toBe(
        "Unable to create travel plan. Please try again.",
      );
    });
  });

  it("loads travel plans from API", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-abc" } },
      error: null,
    } as never);
    mockFetchTravelPlans.mockResolvedValue([
      {
        id: "plan-10",
        owner_user_id: "user-1",
        destination_city: "Lisbon",
        start_date: "2026-04-01",
        end_date: "2026-04-05",
        created_at: "2026-03-16T00:00:00.000Z",
        updated_at: "2026-03-16T00:00:00.000Z",
      },
    ] as never);

    const { result } = renderHook(() => useTravelPlans());

    await act(async () => {
      await result.current.loadTravelPlans();
    });

    expect(result.current.travelPlans).toHaveLength(1);
    expect(result.current.travelPlans[0]).toMatchObject({
      destination: "Lisbon",
    });
  });

  it("sets loadError when fetching travel plans fails", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-bad" } },
      error: null,
    } as never);
    mockFetchTravelPlans.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useTravelPlans());

    await act(async () => {
      await result.current.loadTravelPlans();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.loadError).toBe("Travel plans couldn't be retrieved.");
  });
});
