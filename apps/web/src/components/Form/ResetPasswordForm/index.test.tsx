import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPasswordForm } from "./index";

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    query: {},
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

describe("ResetPasswordForm", () => {
  it("renders password fields", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ResetPasswordForm />);
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeInTheDocument();
  });

  it("renders show/hide password toggles", () => {
    render(<ResetPasswordForm />);
    const toggleButtons = screen.getAllByRole("button", {
      name: /show|hide/i,
    });
    expect(toggleButtons).toHaveLength(2);
  });
});
