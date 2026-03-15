import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderPostLogin } from "./index";

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe("HeaderPostLogin", () => {
  it("renders the welcome message", () => {
    render(<HeaderPostLogin />);
    expect(screen.getByText("Welcome to TripFlow")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(<HeaderPostLogin />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("displays user name when provided", () => {
    render(<HeaderPostLogin userName="John Doe" />);
    expect(screen.getByText(/Hi, John Doe!/i)).toBeInTheDocument();
  });

  it("does not display greeting when user name is not provided", () => {
    render(<HeaderPostLogin />);
    expect(screen.queryByText(/Hi,/i)).not.toBeInTheDocument();
  });
});
