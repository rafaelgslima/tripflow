import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPasswordForm } from "./index";

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
    const toggleButtons = screen.getAllByText(/show/i);
    expect(toggleButtons).toHaveLength(2);
  });
});
