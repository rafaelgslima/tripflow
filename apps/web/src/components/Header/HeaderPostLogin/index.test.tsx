import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { HeaderPostLogin } from "./index";

const { mockPush, mockSignOut } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock("next/router", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signOut: mockSignOut,
    },
  },
}));

vi.mock("@/hooks/useSessionTimeoutWarning", () => ({
  useSessionTimeoutWarning: vi.fn(() => ({
    showWarning: false,
    remainingSeconds: 0,
    handleExtendSession: vi.fn(),
    handleLogoutNow: vi.fn(),
  })),
}));

describe("HeaderPostLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the TripFlow logo", () => {
    render(<HeaderPostLogin />);

    expect(screen.getByRole("link", { name: /tripflow/i })).toBeInTheDocument();
  });

  it("renders Home, Profile and Log out actions", () => {
    render(<HeaderPostLogin />);

    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("opens mobile menu when hamburger icon is clicked", () => {
    render(<HeaderPostLogin />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    const dialog = screen.getByRole("dialog", {
      name: /mobile navigation menu/i,
    });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: "Home" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: "Profile" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();
  });

  it("logs out and redirects to root", async () => {
    mockSignOut.mockResolvedValue(undefined);
    render(<HeaderPostLogin />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
