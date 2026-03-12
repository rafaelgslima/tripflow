import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useLoginForm } from "./index";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: "/login",
    query: {},
    asPath: "/login",
  }),
}));

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

import { supabase } from "@/lib/supabase";

describe("useLoginForm", () => {
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("initializes with empty email when no remembered email", () => {
      const { result } = renderHook(() => useLoginForm());
      expect(result.current.values.email).toBe("");
    });

    it("initializes with remembered email from localStorage", () => {
      localStorage.setItem(
        "tripflow_remembered_email",
        "remembered@example.com",
      );
      const { result } = renderHook(() => useLoginForm());
      expect(result.current.values.email).toBe("remembered@example.com");
      expect(result.current.values.rememberMe).toBe(true);
    });

    it("initializes with empty password", () => {
      const { result } = renderHook(() => useLoginForm());
      expect(result.current.values.password).toBe("");
    });

    it("initializes with rememberMe as false when no remembered email", () => {
      const { result } = renderHook(() => useLoginForm());
      expect(result.current.values.rememberMe).toBe(false);
    });

    it("initializes with no errors", () => {
      const { result } = renderHook(() => useLoginForm());
      expect(result.current.errors).toEqual({});
    });

    it("initializes with no touched fields", () => {
      const { result } = renderHook(() => useLoginForm());
      expect(result.current.touched).toEqual({
        email: false,
        password: false,
      });
    });

    it("initializes with isSubmitting as false", () => {
      const { result } = renderHook(() => useLoginForm());
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("remember me functionality", () => {
    it("saves email to localStorage when rememberMe is checked", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "user@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange("rememberMe")({
          target: { checked: true },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(localStorage.getItem("tripflow_remembered_email")).toBe(
        "user@example.com",
      );
    });

    it("removes email from localStorage when rememberMe is unchecked", () => {
      localStorage.setItem("tripflow_remembered_email", "user@example.com");
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("rememberMe")({
          target: { checked: false },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(localStorage.getItem("tripflow_remembered_email")).toBeNull();
    });

    it("updates localStorage when email changes and rememberMe is checked", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("rememberMe")({
          target: { checked: true },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange("email")({
          target: { value: "new@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(localStorage.getItem("tripflow_remembered_email")).toBe(
        "new@example.com",
      );
    });
  });

  describe("handleChange", () => {
    it("updates email value", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "test@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.email).toBe("test@example.com");
    });

    it("updates password value", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("password")({
          target: { value: "password123" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.password).toBe("password123");
    });

    it("updates rememberMe value", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("rememberMe")({
          target: { checked: true },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.rememberMe).toBe(true);
    });
  });

  describe("handleBlur", () => {
    it("marks email as touched", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleBlur("email")();
      });

      expect(result.current.touched.email).toBe(true);
    });

    it("marks password as touched", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleBlur("password")();
      });

      expect(result.current.touched.password).toBe(true);
    });

    it("validates email on blur", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "invalid-email" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("email")();
      });

      expect(result.current.errors.email).toBe(
        "Please enter a valid email address",
      );
    });

    it("clears email error when valid", () => {
      const { result } = renderHook(() => useLoginForm());

      // Set invalid email first
      act(() => {
        result.current.handleChange("email")({
          target: { value: "invalid" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("email")();
      });

      expect(result.current.errors.email).toBeTruthy();

      // Now set valid email
      act(() => {
        result.current.handleChange("email")({
          target: { value: "valid@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("email")();
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe("validation", () => {
    it("shows error for empty email", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleBlur("email")();
      });

      expect(result.current.errors.email).toBe("Email is required");
    });

    it("shows error for invalid email format", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "not-an-email" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("email")();
      });

      expect(result.current.errors.email).toBe(
        "Please enter a valid email address",
      );
    });

    it("accepts valid email", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "user@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleBlur("email")();
      });

      expect(result.current.errors.email).toBeUndefined();
    });

    it("shows error for empty password", () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleBlur("password")();
      });

      expect(result.current.errors.password).toBe("Password is required");
    });
  });

  describe("Supabase integration", () => {
    it("displays error when email is not confirmed", async () => {
      // Mock Supabase to return email not confirmed error
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: "Email not confirmed",
          name: "AuthError",
          status: 400,
        },
      } as any);

      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "unconfirmed@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange("password")({
          target: { value: "ValidPass123" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.errors.general).toBe(
        "Please confirm your email address before logging in. Check your inbox for the confirmation link.",
      );
    });

    it("displays error for invalid credentials", async () => {
      // Mock Supabase to return invalid credentials error
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          message: "Invalid login credentials",
          name: "AuthError",
          status: 400,
        },
      } as any);

      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "wrong@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange("password")({
          target: { value: "wrongpassword" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.errors.general).toBe(
        "Invalid email or password. Please try again.",
      );
    });

    it("sets isSuccess to true on successful login", async () => {
      // Mock Supabase to return successful login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: { id: "123", email: "valid@example.com" },
          session: { access_token: "token123" },
        },
        error: null,
      } as any);

      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleChange("email")({
          target: { value: "valid@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleChange("password")({
          target: { value: "ValidPass123" },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.errors.general).toBeUndefined();
    });
  });
});
