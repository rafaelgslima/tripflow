import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ShareTravelPlanModal } from "./index";

describe("ShareTravelPlanModal", () => {
  it("does not render when closed", () => {
    render(
      <ShareTravelPlanModal
        isOpen={false}
        friendEmail=""
        friendEmailError={null}
        message={null}
        isConfirmDisabled={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onFriendEmailChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("dialog", { name: /share travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("renders input and actions when open", () => {
    render(
      <ShareTravelPlanModal
        isOpen={true}
        friendEmail=""
        friendEmailError={null}
        message={null}
        isConfirmDisabled={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onFriendEmailChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: /share travel plan/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/friend email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close modal/i }),
    ).toBeInTheDocument();
  });

  it("calls onFriendEmailChange when typing", () => {
    const onFriendEmailChange = vi.fn();
    render(
      <ShareTravelPlanModal
        isOpen={true}
        friendEmail=""
        friendEmailError={null}
        message={null}
        isConfirmDisabled={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onFriendEmailChange={onFriendEmailChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/friend email/i), {
      target: { value: "friend@example.com" },
    });

    expect(onFriendEmailChange).toHaveBeenCalledWith("friend@example.com");
  });

  it("calls onClose from close button and backdrop", () => {
    const onClose = vi.fn();
    render(
      <ShareTravelPlanModal
        isOpen={true}
        friendEmail=""
        friendEmailError={null}
        message={null}
        isConfirmDisabled={false}
        onClose={onClose}
        onConfirm={vi.fn()}
        onFriendEmailChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    fireEvent.click(screen.getByTestId("share-travel-plan-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("calls onConfirm and supports disabled state", () => {
    const onConfirm = vi.fn();
    render(
      <ShareTravelPlanModal
        isOpen={true}
        friendEmail=""
        friendEmailError={null}
        message={null}
        isConfirmDisabled={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        onFriendEmailChange={vi.fn()}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("renders error state UI", () => {
    render(
      <ShareTravelPlanModal
        isOpen={true}
        friendEmail=""
        friendEmailError="Email is required"
        message={{ type: "error", text: "Try again later" }}
        isConfirmDisabled={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onFriendEmailChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/try again later/i)).toBeInTheDocument();
  });
});
