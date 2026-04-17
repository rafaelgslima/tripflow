import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { DayColumn } from "./index";
import type { DayColumnProps } from "./types";
import type { ItineraryItem } from "@/types/itinerary";

// DayColumn now requires a DndContext ancestor for useDroppable
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@dnd-kit/core")>();
  return { ...mod };
});

const mockDate = new Date("2026-03-20");

function makeItem(id: string, description: string, time: string | null = null): ItineraryItem {
  return { id, description, time, isDone: false, createdAt: new Date() };
}

function makeProps(overrides: Partial<DayColumnProps> = {}): DayColumnProps {
  return {
    date: mockDate,
    dayNumber: 1,
    items: [],
    isLoading: false,
    loadError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    onClearCreateError: vi.fn(),
    onClearUpdateError: vi.fn(),
    onClearDeleteError: vi.fn(),
    onCreateItem: vi.fn().mockResolvedValue(undefined),
    onUpdateItem: vi.fn().mockResolvedValue(undefined),
    onDeleteItem: vi.fn().mockResolvedValue(undefined),
    onToggleDone: vi.fn(),
    ...overrides,
  };
}

// Wrap with DndContext so useDroppable works in tests
import { DndContext } from "@dnd-kit/core";
function renderWithDnd(props: DayColumnProps) {
  return render(
    <DndContext>
      <DayColumn {...props} />
    </DndContext>,
  );
}

describe("DayColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders day column with date and day number", () => {
    renderWithDnd(makeProps());
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText(/Fri/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 20/)).toBeInTheDocument();
  });

  it("renders add plan button", () => {
    renderWithDnd(makeProps());
    expect(screen.getByRole("button", { name: /add activity/i })).toBeInTheDocument();
  });

  it("renders as accordion on mobile", () => {
    renderWithDnd(makeProps({ isMobile: true }));
    const accordionButton = screen.getByRole("button", { name: /day 1/i });
    expect(accordionButton).toBeInTheDocument();
  });

  it("toggles accordion content on mobile", () => {
    renderWithDnd(makeProps({ isMobile: true }));
    const accordionButton = screen.getByRole("button", { name: /day 1/i });

    expect(screen.queryByRole("button", { name: /add activity/i })).not.toBeInTheDocument();

    fireEvent.click(accordionButton);

    expect(screen.getByRole("button", { name: /add activity/i })).toBeVisible();
  });

  it("shows loading indicator when isLoading is true and items is empty", () => {
    renderWithDnd(makeProps({ isLoading: true }));
    expect(screen.getByTestId("day-plans-loading")).toBeInTheDocument();
  });

  it("shows loadError when provided and items is empty", () => {
    renderWithDnd(makeProps({ loadError: "Could not load" }));
    expect(screen.getByTestId("day-plans-load-error")).toBeInTheDocument();
  });

  it("shows No activities yet when items is empty and not loading", () => {
    renderWithDnd(makeProps());
    expect(screen.getByText(/no activities yet/i)).toBeInTheDocument();
  });

  it("renders items when provided", () => {
    renderWithDnd(makeProps({ items: [makeItem("item-1", "Visit Museum")] }));
    expect(screen.getByText("Visit Museum")).toBeInTheDocument();
    expect(screen.queryByText(/no activities yet/i)).not.toBeInTheDocument();
  });

  describe("Adding itinerary items", () => {
    it("shows input and buttons when Add Activity is clicked", () => {
      renderWithDnd(makeProps());

      fireEvent.click(screen.getByRole("button", { name: /add activity/i }));

      expect(screen.getByPlaceholderText(/what's the plan\?/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /add activity/i })).not.toBeInTheDocument();
    });

    it("cancels adding and returns to initial state", () => {
      renderWithDnd(makeProps());

      fireEvent.click(screen.getByRole("button", { name: /add activity/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(screen.queryByPlaceholderText(/what's the plan\?/i)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add activity/i })).toBeInTheDocument();
    });

    it("calls onCreateItem when confirmed", async () => {
      const onCreateItem = vi.fn().mockResolvedValue(undefined);
      renderWithDnd(makeProps({ onCreateItem }));

      fireEvent.click(screen.getByRole("button", { name: /add activity/i }));
      fireEvent.change(screen.getByPlaceholderText(/what's the plan\?/i), {
        target: { value: "Visit Museum" },
      });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(onCreateItem).toHaveBeenCalledWith("Visit Museum", null);
      });
    });

    it("does not save an empty description", () => {
      const onCreateItem = vi.fn().mockResolvedValue(undefined);
      renderWithDnd(makeProps({ onCreateItem }));

      fireEvent.click(screen.getByRole("button", { name: /add activity/i }));
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      expect(onCreateItem).not.toHaveBeenCalled();
      expect(screen.getByPlaceholderText(/what's the plan\?/i)).toBeInTheDocument();
    });
  });

  describe("Editing itinerary items", () => {
    it("calls onUpdateItem when saved", async () => {
      const onUpdateItem = vi.fn().mockResolvedValue(undefined);
      renderWithDnd(
        makeProps({
          items: [makeItem("item-1", "Breakfast")],
          onUpdateItem,
        }),
      );

      fireEvent.click(screen.getByRole("button", { name: /edit breakfast/i }));

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "Brunch" } });
      fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(onUpdateItem).toHaveBeenCalledWith("item-1", "Brunch", null);
      });
    });

    it("calls onDeleteItem when delete is clicked", async () => {
      const onDeleteItem = vi.fn().mockResolvedValue(undefined);
      renderWithDnd(
        makeProps({
          items: [makeItem("item-1", "Breakfast")],
          onDeleteItem,
        }),
      );

      fireEvent.click(screen.getByRole("button", { name: /edit breakfast/i }));

      const deleteButton = screen.getByRole("button", { name: /delete activity/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(onDeleteItem).toHaveBeenCalledWith("item-1");
      });
    });
  });
});
