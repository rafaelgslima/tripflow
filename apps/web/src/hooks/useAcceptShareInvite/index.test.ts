import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAcceptShareInvite } from "./index";
import { acceptTravelPlanShareInvite } from "@/lib/api/travelPlans";
import { supabase } from "@/lib/supabase";

const mockRouterReplace = vi.fn().mockResolvedValue(undefined);

vi.mock("next/router", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock("@/lib/api/travelPlans", () => ({
  acceptTravelPlanShareInvite: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe("useAcceptShareInvite", () => {
  const mockAccept = vi.mocked(acceptTravelPlanShareInvite);
  const mockGetSession = vi.mocked(supabase.auth.getSession);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in idle status when token is null", () => {
    const { result } = renderHook(() => useAcceptShareInvite(null));
    expect(result.current.status).toBe("idle");
    expect(result.current.errorMessage).toBeNull();
  });

  it("redirects to login when no session exists", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    renderHook(() => useAcceptShareInvite("valid-token"));

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login?next="),
      );
    });
  });

  it("sets status to success after accepting invite", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-abc" } },
      error: null,
    } as never);
    mockAccept.mockResolvedValue({
      travel_plan_id: "plan-1",
      status: "accepted",
    });

    const { result } = renderHook(() => useAcceptShareInvite("valid-token"));

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(mockAccept).toHaveBeenCalledWith(
      { token: "valid-token" },
      "token-abc",
    );
  });

  it("redirects to /home after successful acceptance", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-abc" } },
      error: null,
    } as never);
    mockAccept.mockResolvedValue({
      travel_plan_id: "plan-1",
      status: "accepted",
    });

    renderHook(() => useAcceptShareInvite("valid-token"));

    await waitFor(() =>
      expect(mockRouterReplace).not.toHaveBeenCalledWith("/home"),
    );

    vi.runAllTimers();

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("sets status to error and captures the API message on failure", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-abc" } },
      error: null,
    } as never);
    mockAccept.mockRejectedValue({
      response: {
        data: { message: "This invite was sent to friend@example.com." },
      },
    });

    const { result } = renderHook(() => useAcceptShareInvite("valid-token"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.errorMessage).toBe(
      "This invite was sent to friend@example.com.",
    );
  });

  it("sets a null errorMessage when the API error has no message field", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-abc" } },
      error: null,
    } as never);
    mockAccept.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAcceptShareInvite("valid-token"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.errorMessage).toBeNull();
  });
});
