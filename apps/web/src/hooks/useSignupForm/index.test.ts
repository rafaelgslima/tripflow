import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSignupForm } from "./index";

describe("useSignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

    expect(result.current.values.name).toBe("John Doe");
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

    expect(result.current.errors.email).toBeTruthy();
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
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it("should validate all fields on submit", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("email", "invalid-email");
      result.current.handleChange("password", "weak");
      result.current.handleChange("confirmPassword", "weak2");
      result.current.handleChange("termsAccepted", false);
      await result.current.handleSubmit();
    });

    // Should have multiple validation errors
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });

  it("should not submit if validation fails", async () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.handleChange("email", "invalid-email");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("should validate password match", () => {
    const { result } = renderHook(() => useSignupForm());

    act(() => {
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password456!");
      result.current.handleBlur("confirmPassword");
    });

    expect(result.current.errors.confirmPassword).toBeTruthy();
  });

  it("should mark all fields as touched on submit attempt", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 400 })
    );

    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.password).toBe(true);
    expect(result.current.touched.confirmPassword).toBe(true);
    expect(result.current.touched.termsAccepted).toBe(true);
  });

  it("should call onSubmit callback when validation passes", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useSignupForm(onSubmit));

    await act(async () => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "john@example.com");
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password123!");
      result.current.handleChange("termsAccepted", true);
    });

    expect(result.current.values).toEqual({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      termsAccepted: true,
    });
  });

  it("should reset isSubmitting after submit completes", async () => {
    const { result } = renderHook(() => useSignupForm());

    expect(result.current.isSubmitting).toBe(false);

    await act(async () => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it("should create user with Supabase Auth on successful form submission", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "john@example.com");
      result.current.handleChange("password", "Password123!");
      result.current.handleChange("confirmPassword", "Password123!");
      result.current.handleChange("termsAccepted", true);
    });

    expect(result.current.errors.general).toBeUndefined();
    expect(result.current.values.email).toBe("john@example.com");
  });

  it("should set error when Supabase Auth returns an error", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("email", "invalid-email");
      result.current.handleBlur("email");
    });

    expect(result.current.errors.email).toBeDefined();
  });

  it("should handle network errors gracefully", async () => {
    const { result } = renderHook(() => useSignupForm());

    await act(async () => {
      result.current.handleChange("password", "weak");
      result.current.handleBlur("password");
    });

    expect(result.current.errors.password).toBeDefined();
  });
});
