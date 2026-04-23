import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useEditProfileForm } from "./index";

vi.mock("@/utils/getSupabaseAccessToken", () => ({
  getSupabaseAccessToken: vi.fn().mockResolvedValue("mock-token"),
}));

globalThis.fetch = vi.fn() as any;

describe("useEditProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty name and no errors", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    expect(result.current.values.name).toBe("John Doe");
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update name on change", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "Jane Doe");
    });

    expect(result.current.values.name).toBe("Jane Doe");
  });

  it("should validate name on blur", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "J");
    });

    act(() => {
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBe("Name must be at least 2 characters long");
    expect(result.current.touched.name).toBe(true);
  });

  it("should reject name longer than 100 characters", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "a".repeat(101));
    });

    act(() => {
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBe("Name must be less than 100 characters");
  });

  it("should reject empty name", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "");
    });

    act(() => {
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should clear error on valid input", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "J");
    });

    act(() => {
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.handleChange("name", "Jane Doe");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should submit valid form", async () => {
    const mockFetch = globalThis.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: "Jane Doe" }),
    } as Response);

    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "Jane Doe");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-token",
      },
      body: JSON.stringify({ name: "Jane Doe" }),
    });
  });

  it("should handle submission errors", async () => {
    const mockFetch = globalThis.fetch as any;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid name" }),
    } as Response);

    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "Jane Doe");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.errors.general).toBeDefined();
      expect(result.current.isSuccess).toBe(false);
    });
  });

  it("should prevent submission with validation errors", async () => {
    const mockFetch = globalThis.fetch as any;

    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "J");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.touched.name).toBe(true);
  });
});
