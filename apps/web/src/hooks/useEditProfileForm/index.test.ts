import { renderHook, act, waitFor } from "@testing-library/react";
import { useEditProfileForm } from "./index";

global.fetch = jest.fn();

describe("useEditProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBe("Name must be at least 2 characters long");
    expect(result.current.touched.name).toBe(true);
  });

  it("should reject name longer than 100 characters", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "a".repeat(101));
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBe("Name must be less than 100 characters");
  });

  it("should reject empty name", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "");
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should clear error on valid input", () => {
    const { result } = renderHook(() => useEditProfileForm("John Doe"));

    act(() => {
      result.current.handleChange("name", "J");
      result.current.handleBlur("name");
    });

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.handleChange("name", "Jane Doe");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should submit valid form", async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jane Doe" }),
    });
  });

  it("should handle submission errors", async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
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
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

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
