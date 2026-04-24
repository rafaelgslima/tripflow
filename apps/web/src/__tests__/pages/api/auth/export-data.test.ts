import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/auth/export-data";

vi.mock("@/lib/api-server/auth");
vi.mock("@/lib/api-server/supabase");
vi.mock("@/lib/api-server/audit");

import { getAuthenticatedUser } from "@/lib/api-server/auth";
import { getSupabaseAdminClient } from "@/lib/api-server/supabase";
import { logAuditEvent } from "@/lib/api-server/audit";

describe("GET /api/auth/export-data", () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let resJson: vi.Mock;
  let resSetHeader: vi.Mock;
  let resStatus: vi.Mock;

  beforeEach(() => {
    resJson = vi.fn().mockReturnThis();
    resSetHeader = vi.fn().mockReturnThis();
    resStatus = vi.fn().mockReturnThis();

    res = {
      status: resStatus,
      setHeader: resSetHeader,
      json: resJson,
    };

    req = {
      method: "GET",
      headers: { authorization: "Bearer test-token" },
    };
  });

  it("should return 405 for non-GET requests", async () => {
    req.method = "POST";
    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(resStatus).toHaveBeenCalledWith(405);
  });

  it("should handle auth errors gracefully", async () => {
    vi.mocked(getAuthenticatedUser).mockRejectedValueOnce(
      new Error("Unauthorized")
    );

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(resStatus).toHaveBeenCalled();
  });

  it("should export user data when authenticated", async () => {
    const userId = "test-user-id";
    const userEmail = "test@example.com";

    vi.mocked(getAuthenticatedUser).mockResolvedValueOnce({
      userId,
      email: userEmail,
    });

    vi.mocked(getSupabaseAdminClient).mockReturnValueOnce({
      from: vi.fn((table) => {
        if (table === "profile") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi
              .fn()
              .mockResolvedValueOnce({
                data: { user_id: userId, name: "Test User" },
                error: null,
              }),
          };
        }
        if (table === "travel_plan") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
          };
        }
        if (table === "travel_plan_share") {
          return {
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
          };
        }
        if (table === "audit_log") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi
              .fn()
              .mockResolvedValueOnce({ data: [], error: null }),
          };
        }
        if (table === "itinerary_item") {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
          };
        }
      }),
    } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(resStatus).toHaveBeenCalledWith(200);
    expect(resSetHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      expect.stringContaining("tripflow-data-export.json")
    );
    expect(resJson).toHaveBeenCalledWith(
      expect.objectContaining({
        exported_at: expect.any(String),
        profile: expect.any(Object),
        travel_plans: expect.any(Array),
        shares_sent: expect.any(Array),
        shares_received: expect.any(Array),
        audit_log: expect.any(Array),
      })
    );
    expect(logAuditEvent).toHaveBeenCalledWith(userId, "data.exported");
  });
});
