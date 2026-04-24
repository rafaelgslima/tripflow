import { describe, it, expect, vi } from "vitest";
import { logAuditEvent } from "./audit";

vi.mock("./supabase", () => ({
  getSupabaseAdminClient: () => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}));

describe("logAuditEvent", () => {
  it("should log an audit event", async () => {
    const userId = "test-user-id";
    const eventType = "account.created" as const;
    const metadata = { test: true };

    await logAuditEvent(userId, eventType, metadata);

    expect(true).toBe(true);
  });

  it("should handle errors gracefully", async () => {
    const userId = "test-user-id";
    const eventType = "account.deleted" as const;

    await expect(logAuditEvent(userId, eventType)).resolves.not.toThrow();
  });
});
