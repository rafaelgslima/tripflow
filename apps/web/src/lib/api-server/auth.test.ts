// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractBearerToken, getAuthenticatedUser } from "./auth";
import { UnauthorizedError } from "./errors";

vi.mock("./supabase", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

import { getSupabaseAdminClient } from "./supabase";

const mockGetUser = vi.fn();
const mockSupabase = { auth: { getUser: mockGetUser } };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSupabaseAdminClient).mockReturnValue(mockSupabase as never);
});

describe("extractBearerToken", () => {
  it("extracts token from a valid Bearer header", () => {
    expect(extractBearerToken("Bearer mytoken123")).toBe("mytoken123");
  });

  it("is case-insensitive for the Bearer scheme", () => {
    expect(extractBearerToken("bearer mytoken")).toBe("mytoken");
    expect(extractBearerToken("BEARER mytoken")).toBe("mytoken");
  });

  it("throws UnauthorizedError when header is undefined", () => {
    expect(() => extractBearerToken(undefined)).toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when scheme is not Bearer", () => {
    expect(() => extractBearerToken("Basic abc123")).toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when token is missing after Bearer", () => {
    expect(() => extractBearerToken("Bearer")).toThrow(UnauthorizedError);
    expect(() => extractBearerToken("Bearer ")).toThrow(UnauthorizedError);
  });
});

describe("getAuthenticatedUser", () => {
  it("returns user when token is valid", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });

    const user = await getAuthenticatedUser("Bearer validtoken");

    expect(user).toEqual({ userId: "user-123", email: "test@example.com" });
    expect(mockGetUser).toHaveBeenCalledWith("validtoken");
  });

  it("returns null email when user has no email", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123", email: undefined } },
      error: null,
    });

    const user = await getAuthenticatedUser("Bearer validtoken");
    expect(user.email).toBeNull();
  });

  it("throws UnauthorizedError when Supabase returns an error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid JWT" },
    });

    await expect(getAuthenticatedUser("Bearer badtoken")).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("throws UnauthorizedError when user is null", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(getAuthenticatedUser("Bearer sometoken")).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("throws UnauthorizedError when Authorization header is missing", async () => {
    await expect(getAuthenticatedUser(undefined)).rejects.toThrow(UnauthorizedError);
  });
});
