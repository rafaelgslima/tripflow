import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useForgotPasswordForm } from "./index";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

import { supabase } from "@/lib/supabase";

describe("useForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("initializes with empty email", () => {
      const { result } = renderHook(() => useForgotPasswordForm());
      expect(result.current.values.email).toBe("");
    });

    it("initializes with no errors", () => {
      const { result } = renderHook(() => useForgotPasswordForm());
      expect(result.current.errors).toEqual({});
    });

    it("initializes with email not touched", () => {
      const { result } = renderHook(() => useForgotPasswordForm());
      expect(result.current.touched.email).toBe(false);
    });

    it("initializes with isSubmitting as false", () => {
      const { result } = renderHook(() => useForgotPasswordForm());
      expect(result.current.isSubmitting).toBe(false);
    });

    it("initializes with isSuccess as false", () => {
      const { result } = renderHook(() => useForgotPasswordForm());
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe("handleChange", () => {
    it("updates email value", () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "test@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.email).toBe("test@example.com");
    });

    it("clears email error when typing", () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      // Set error by triggering blur with empty email
      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.errors.email).toBeTruthy();

      // Type to clear error
      act(() => {
        result.current.handleChange({
          target: { value: "test@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe("handleBlur", () => {
    it("marks email as touched", () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.touched.email).toBe(true);
    });

    it("validates email on blur", () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "invalid-email" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.errors.email).toBe(
        "Please enter a valid email address",
      );
    });

    it("clears error for valid email", () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "valid@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe("validation", () => {
    it("shows error for empty email", () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.errors.email).toBe("Email is required");
    });

    it("shows error for invalid email format", () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "not-an-email" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.errors.email).toBe(
        "Please enter a valid email address",
      );
    });
  });

  describe("Supabase integration", () => {
    it("sends password reset email successfully", async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any);

      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "user@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining("/reset-password"),
        }),
      );
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.errors.general).toBeUndefined();
    });

    it("displays error when email sending fails", async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: {
          message: "Failed to send email",
          name: "AuthError",
          status: 400,
        },
      } as any);

      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "user@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.errors.general).toBe(
        "Failed to send reset email. Please try again.",
      );
      expect(result.current.isSuccess).toBe(false);
    });

    it("does not submit with invalid email", async () => {
      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "invalid" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
      expect(result.current.errors.email).toBeTruthy();
    });

    it("resets isSubmitting after submission completes", async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any);

      const { result } = renderHook(() => useForgotPasswordForm());

      act(() => {
        result.current.handleChange({
          target: { value: "user@example.com" },
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
