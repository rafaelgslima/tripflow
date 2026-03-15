import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionTimeoutWarning } from "./index";

describe("SessionTimeoutWarning", () => {
  it("renders warning message", () => {
    render(
      <SessionTimeoutWarning
        remainingSeconds={120}
        onExtendSession={vi.fn()}
        onLogout={vi.fn()}
      />,
    );
    expect(screen.getByText(/session expiring soon/i)).toBeInTheDocument();
  });

  it("displays remaining time in minutes", () => {
    render(
      <SessionTimeoutWarning
        remainingSeconds={120}
        onExtendSession={vi.fn()}
        onLogout={vi.fn()}
      />,
    );
    expect(screen.getByText(/2 minutes/i)).toBeInTheDocument();
  });

  it("calls onExtendSession when extend button clicked", () => {
    const onExtendSession = vi.fn();
    render(
      <SessionTimeoutWarning
        remainingSeconds={120}
        onExtendSession={onExtendSession}
        onLogout={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /extend session/i }));
    expect(onExtendSession).toHaveBeenCalled();
  });

  it("calls onLogout when logout button clicked", () => {
    const onLogout = vi.fn();
    render(
      <SessionTimeoutWarning
        remainingSeconds={120}
        onExtendSession={vi.fn()}
        onLogout={onLogout}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /logout now/i }));
    expect(onLogout).toHaveBeenCalled();
  });
});
