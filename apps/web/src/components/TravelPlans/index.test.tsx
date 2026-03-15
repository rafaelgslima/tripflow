import { render, screen, fireEvent } from "@testing-library/react";
import { TravelPlans } from "./index";

describe("TravelPlans", () => {
  it("should render the component with title and create button", () => {
    render(<TravelPlans />);

    expect(screen.getByText("Plan Your Dream Adventures")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create and organize your travel itineraries in one place",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create new trip plan/i }),
    ).toBeInTheDocument();
  });

  it("should open modal when create button is clicked", () => {
    render(<TravelPlans />);

    const createButton = screen.getByRole("button", {
      name: /create new trip plan/i,
    });
    fireEvent.click(createButton);

    expect(screen.getByText("Create New Trip Plan")).toBeInTheDocument();
  });

  it("should not show travel plans list initially", () => {
    render(<TravelPlans />);

    expect(screen.queryByTestId("travel-plans-list")).not.toBeInTheDocument();
  });
});
