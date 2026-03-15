import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { HeaderPostLogin } from "./index";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/router", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock Supabase
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  },
}));

// Mock session timeout hook
vi.mock("@/hooks/useSessionTimeout", () => ({
  useSessionTimeout: vi.fn(() => ({
    resetTimer: vi.fn(),
  })),
}));

describe("HeaderPostLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            email: "test@example.com",
            user_metadata: { name: "Test User" },
          },
        },
      },
    });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
  });

  it("renders the welcome message when authenticated", async () => {
    render(<HeaderPostLogin>{() => <div>Content</div>}</HeaderPostLogin>);
    await waitFor(() => {
      expect(screen.getByText("Welcome to TripFlow")).toBeInTheDocument();
    });
  });

  it("renders user name when available", async () => {
    render(<HeaderPostLogin>{() => <div>Content</div>}</HeaderPostLogin>);
    await waitFor(() => {
      expect(screen.getByText(/Hi, Test User!/i)).toBeInTheDocument();
    });
  });

  it("renders children with user data", async () => {
    render(
      <HeaderPostLogin>
        {(user) => <div>Email: {user.email}</div>}
      </HeaderPostLogin>,
    );
    await waitFor(() => {
      expect(screen.getByText("Email: test@example.com")).toBeInTheDocument();
    });
  });

  it("redirects to login when not authenticated", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    render(<HeaderPostLogin>{() => <div>Content</div>}</HeaderPostLogin>);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
