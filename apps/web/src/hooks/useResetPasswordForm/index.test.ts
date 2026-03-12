import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useResetPasswordForm } from "./index";

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    pathname: "/reset-password",
    query: {},
    asPath: "/reset-password",
  })),
}));

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

describe("useResetPasswordForm", () => {
  const mockRouterPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush,
      pathname: "/reset-password",
      query: {},
      asPath: "/reset-password",
    } as any);
  });

  describe("initial state", () => {
    it("initializes with empty password fields", () => {
      const { result } = renderHook(() => useResetPasswordForm());
      expect(result.current.values.password).toBe("");
      expect(result.current.values.confirmPassword).toBe("");
    });

    it("initializes with no errors", () => {
      const { result } = renderHook(() => useResetPasswordForm());
      expect(result.current.errors).toEqual({});
    });

    it("initializes with fields not touched", () => {
      const { result } = renderHook(() => useResetPasswordForm());
      expect(result.current.touched.password).toBe(false);
      expect(result.current.touched.confirmPassword).toBe(false);
    });

    it("initializes with isSubmitting as false", () => {
      const { result } = renderHook(() => useResetPasswordForm());
      expect(result.current.isSubmitting).toBe(false);
    });

    it("initializes with isSuccess as false", () => {
      const { result } = renderHook(() => useResetPasswordForm());
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe("handleChange", () => {
    it("updates password value", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.password).toBe("NewPass123!");
    });

    it("updates confirmPassword value", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "confirmPassword", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.confirmPassword).toBe("NewPass123!");
    });

    it("clears field error when typing", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      // Trigger error by blurring empty field
      act(() => {
        result.current.handleBlur("password");
      });

      expect(result.current.errors.password).toBeTruthy();

      // Type to clear error
      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.password).toBeUndefined();
    });
  });

  describe("handleBlur", () => {
    it("marks password as touched", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleBlur("password");
      });

      expect(result.current.touched.password).toBe(true);
    });

    it("marks confirmPassword as touched", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleBlur("confirmPassword");
      });

      expect(result.current.touched.confirmPassword).toBe(true);
    });
  });

  describe("validation", () => {
    it("shows error for empty password", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleBlur("password");
      });

      expect(result.current.errors.password).toBe("Password is required");
    });

    it("shows error for weak password", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "weak" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("password");
      });

      expect(result.current.errors.password).toBeTruthy();
    });

    it("shows error when passwords do not match", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "confirmPassword", value: "Different123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("confirmPassword");
      });

      expect(result.current.errors.confirmPassword).toBe(
        "Passwords do not match",
      );
    });

    it("clears error when passwords match", () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "confirmPassword", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("confirmPassword");
      });

      expect(result.current.errors.confirmPassword).toBeUndefined();
    });
  });

  describe("Supabase integration", () => {
    it("updates password successfully", async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: { id: "123" } },
        error: null,
      } as any);

      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "confirmPassword", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: "NewPass123!",
      });
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.errors.general).toBeUndefined();

      // Wait for the redirect timeout
      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(mockRouterPush).toHaveBeenCalledWith("/login");
    });

    it("displays error when password update fails", async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: null },
        error: {
          message: "Invalid token",
          name: "AuthError",
          status: 400,
        },
      } as any);

      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "confirmPassword", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.errors.general).toBe(
        "Failed to reset password. Please try again or request a new reset link.",
      );
      expect(result.current.isSuccess).toBe(false);
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it("does not submit with validation errors", async () => {
      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "weak" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(supabase.auth.updateUser).not.toHaveBeenCalled();
      expect(result.current.errors.password).toBeTruthy();
    });

    it("resets isSubmitting after submission completes", async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: { id: "123" } },
        error: null,
      } as any);

      const { result } = renderHook(() => useResetPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { name: "password", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange({
          target: { name: "confirmPassword", value: "NewPass123!" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
