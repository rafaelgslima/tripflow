import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { getSupabaseAccessToken } from "./index";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe("getSupabaseAccessToken", () => {
  const mockGetSession = vi.mocked(supabase.auth.getSession);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns access token when session exists", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    } as never);

    await expect(getSupabaseAccessToken()).resolves.toBe("token-123");
  });

  it("returns null when session missing", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    await expect(getSupabaseAccessToken()).resolves.toBeNull();
  });
});
