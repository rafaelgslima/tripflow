import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createTravelPlanShareInvite } from "@/lib/api/travelPlans";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
import { ShareTravelPlanButton } from "./index";

vi.mock("@/lib/api/travelPlans", () => ({
  createTravelPlanShareInvite: vi.fn(),
}));

vi.mock("@/utils/getSupabaseAccessToken", () => ({
  getSupabaseAccessToken: vi.fn(),
}));

describe("ShareTravelPlanButton", () => {
  const mockGetToken = vi.mocked(getSupabaseAccessToken);
  const mockCreateShare = vi.mocked(createTravelPlanShareInvite);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the share button", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    expect(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    ).toBeInTheDocument();
  });

  it("opens a modal with an email input", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );

    expect(
      screen.getByRole("dialog", { name: /share travel plan/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/friend.*email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close modal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /after sharing, your friend will be able to view and edit this plan/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send invite/i }),
    ).toBeInTheDocument();
  });

  it("closes the modal on cancel", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.queryByRole("dialog", { name: /share travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("closes the modal on close button click", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));

    expect(
      screen.queryByRole("dialog", { name: /share travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("closes the modal when clicking outside", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );
    fireEvent.click(screen.getByTestId("share-travel-plan-backdrop"));

    expect(
      screen.queryByRole("dialog", { name: /share travel plan/i }),
    ).not.toBeInTheDocument();
  });

  it("validates the email before sending", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );

    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/the plan was shared with the friend/i),
    ).not.toBeInTheDocument();
  });

  it("shows a success message after confirming", async () => {
    mockGetToken.mockResolvedValue("token-123");
    mockCreateShare.mockResolvedValue({
      travel_plan_id: "plan-1",
      invited_email: "friend@example.com",
      status: "pending",
    } as never);

    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );

    fireEvent.change(screen.getByLabelText(/friend.*email/i), {
      target: { value: "friend@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /the plan was shared with the friend and now the friend should confirm it via email to be able to see the plan in their account/i,
        ),
      ).toBeInTheDocument();
    });

    expect(mockCreateShare).toHaveBeenCalledWith(
      "plan-1",
      { invited_email: "friend@example.com" },
      "token-123",
    );

    expect(screen.getByRole("button", { name: /send invite/i })).toBeDisabled();
  });

  it("shows an error message after confirming when send fails", async () => {
    mockGetToken.mockResolvedValue("token-123");
    mockCreateShare.mockRejectedValue(new Error("network"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );

    fireEvent.change(screen.getByLabelText(/friend.*email/i), {
      target: { value: "fail@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /there was an error sending the invitation\. try again later\./i,
        ),
      ).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("shows an error message when there is no session", async () => {
    mockGetToken.mockResolvedValue(null);

    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );

    fireEvent.change(screen.getByLabelText(/friend.*email/i), {
      target: { value: "friend@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send invite/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /there was an error sending the invitation\. try again later\./i,
        ),
      ).toBeInTheDocument();
    });
  });
});
