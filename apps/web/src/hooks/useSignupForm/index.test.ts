import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSignupForm } from "./index";

// Mock Supabase client before importing
vi.mock("@/lib/supabase");

// Import after mocking
const { supabase } = await import("@/lib/supabase");
const mockSignUp = supabase.auth.signUp as ReturnType<typeof vi.fn>;

describe("useSignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty values and no errors", () => {
    const { result } = renderHook(() => useSignupForm());

    expect(result.current.values).toEqual({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update field value when handleChange is called", () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.values.name).toBe("John Doe Silva");
  });

  it("should mark field as touched when handleBlur is called", () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.handleBlur("email");
    });

    expect(result.current.touched.email).toBe(true);
  });

  it("should validate field on blur", () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.handleChange("email", "invalid-email");
      result.current.handleBlur("email");
    });

    expect(result.current.errors.email).toBe(
      "Please enter a valid email address",
    );
  });

  it("should clear error when field becomes valid", () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.handleChange("email", "invalid-email");
      result.current.handleBlur("email");
    });

    expect(result.current.errors.email).toBeTruthy();

    act(() => {
      result.current.handleChange("email", "valid@example.com");
      result.current.handleBlur("email");
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it("should validate all fields on submit", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.name).toBe("Name is required");
    expect(result.current.errors.email).toBe("Email is required");
    expect(result.current.errors.password).toBe("Password is required");
  });

  it("should not submit if validation fails", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "invalid-email");
      await result.current.handleSubmit();
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors.email).toBeTruthy();
  });

  it("should validate password match", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password456!");
      result.current.handleBlur("confirmPassword");
    });

    expect(result.current.errors.confirmPassword).toBe(
      "Passwords do not match",
    );
  });

  it("should mark all fields as touched on submit attempt", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.password).toBe(true);
    expect(result.current.touched.confirmPassword).toBe(true);
  });

  it("should call onSubmit callback when validation passes", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "user-123" }, session: null },
      error: null,
    });

    let submittedData: any = null;
    const onSubmit = (data: any) => {
      submittedData = data;
    };

    const { result } = renderHook(() => useSignupForm(onSubmit));

    await act(async () => {
      result.current.handleChange("name", "John Doe");
    });

    await act(async () => {
      result.current.handleChange("email", "john@example.com");
    });

    await act(async () => {
      result.current.handleChange("password", "Password123!");
    });

    await act(async () => {
      result.current.handleChange("confirmPassword", "Password123!");
    });

    await act(async () => {
      result.current.handleChange("termsAccepted", true);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submittedData).toEqual({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      termsAccepted: true,
    });
  });

  it("should reset isSubmitting after submit completes", async () => {
    const onSubmit = (): Promise<void> =>
      new Promise((resolve) => setTimeout(resolve, 100));
    const { result } = renderHook(() => useSignupForm(onSubmit));

    await act(async () => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "john@example.com");
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password123!");
      result.current.handleChange("termsAccepted", true);
      await result.current.handleSubmit();
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it("should create user with Supabase Auth on successful form submission", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-123",
          email: "john@example.com",
        },
        session: null,
      },
      error: null,
    });

    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "john@example.com");
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password123!");
      result.current.handleChange("termsAccepted", true);
      await result.current.handleSubmit();
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "john@example.com",
      password: "Password123!",
      options: {
        data: {
          name: "John Doe",
        },
      },
    });
    expect(result.current.errors.general).toBeUndefined();
  });

  it("should set error when Supabase Auth returns an error", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "User already registered",
      },
    });

    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "john@example.com");
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password123!");
      result.current.handleChange("termsAccepted", true);
      await result.current.handleSubmit();
    });

    expect(result.current.errors.general).toBe("User already registered");
  });

  it("should handle network errors gracefully", async () => {
    mockSignUp.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "john@example.com");
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password123!");
      result.current.handleChange("termsAccepted", true);
      await result.current.handleSubmit();
    });

    expect(result.current.errors.general).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });
});
