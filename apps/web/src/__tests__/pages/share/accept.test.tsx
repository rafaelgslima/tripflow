import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AcceptShareInvitePage from "@/pages/share/accept";
import { acceptTravelPlanShareInvite } from "@/lib/api/travelPlans";
import { supabase } from "@/lib/supabase";

const replace = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: { token: "token-abc" },
    replace,
  }),
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

describe("AcceptShareInvitePage", () => {
  const mockGetSession = vi.mocked(supabase.auth.getSession);
  const mockAccept = vi.mocked(acceptTravelPlanShareInvite);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login when session missing", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    render(<AcceptShareInvitePage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        expect.stringMatching(/^\/login\?next=/),
      );
    });
  });

  it("accepts invite and redirects home", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    } as never);

    mockAccept.mockResolvedValue({
      travel_plan_id: "plan-1",
      status: "accepted",
    } as never);

    render(<AcceptShareInvitePage />);

    await waitFor(() => {
      expect(mockAccept).toHaveBeenCalledWith(
        { token: "token-abc" },
        "token-123",
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/invitation accepted.*redirecting/i),
      ).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(replace).toHaveBeenCalledWith("/home");
      },
      { timeout: 2000 },
    );
  });
});
