import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ShareTravelPlanButton } from "./index";

describe("ShareTravelPlanButton", () => {
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
    expect(screen.getByLabelText(/friend email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close modal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /after sharing the plan with a friend, the friend will be able to view and edit the plan/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i }),
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

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/the plan was shared with the friend/i),
    ).not.toBeInTheDocument();
  });

  it("shows a success message after confirming", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );

    fireEvent.change(screen.getByLabelText(/friend email/i), {
      target: { value: "friend@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(
      screen.getByText(
        /the plan was shared with the friend and now the friend should confirm it via email to be able to see the plan in their account/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /confirm/i })).toBeDisabled();
  });

  it("shows an error message after confirming when mocked send fails", () => {
    render(<ShareTravelPlanButton travelPlanId="plan-1" />);

    fireEvent.click(
      screen.getByRole("button", { name: /share this plan with a friend/i }),
    );

    fireEvent.change(screen.getByLabelText(/friend email/i), {
      target: { value: "fail@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(
      screen.getByText(
        /there was an error sending the invitation\. try again later\./i,
      ),
    ).toBeInTheDocument();
  });
});
