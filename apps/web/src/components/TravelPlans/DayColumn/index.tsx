import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useDayPlans } from "@/hooks/useDayPlans";
import { AddDayPlanForm } from "./AddDayPlanForm";
import { SortableDayPlanItem } from "./SortableDayPlanItem";
import type { DayColumnProps, ItineraryItem } from "./types";

export function DayColumn({
  date,
  dayNumber,
  travelPlanId,
  isMobile = false,
}: DayColumnProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    itineraryItems,
    setItineraryItems,
    isLoading,
    loadError,
    loadDayPlans,
    createError,
    clearCreateError,
    createDayPlan,
  } = useDayPlans({ travelPlanId, date });
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  const formatDate = (date: Date): { weekday: string; monthDay: string } => {
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return { weekday, monthDay };
  };

  const handleAddPlan = () => {
    clearCreateError();
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setValidationError("");
  };

  const handleConfirm = async (description: string) => {
    try {
      await createDayPlan(description);
      setIsAdding(false);
    } catch {
      // Error message is surfaced via createError
    }
  };

  const handleEdit = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setValidationError("");
  };

  const handleUpdate = (itemId: string, newDescription: string) => {
    const trimmedDescription = newDescription.trim();

    if (!trimmedDescription) {
      setValidationError("This field is required");
      return; // Don't save empty updates
    }

    // Find the original item to compare
    const originalItem = itineraryItems.find((item) => item.id === itemId);
    if (originalItem && originalItem.description === trimmedDescription) {
      // No changes made, just exit edit mode
      setEditingItemId(null);
      setValidationError("");
      return;
    }

    // TODO: Replace with API call to backend
    // PUT /api/travel-plans/:travelPlanId/days/:date/items/:itemId
    // {
    //   description: string
    // }
    // Backend should update the item in database and return the updated item

    // For now, simulate item update locally
    setItineraryItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, description: trimmedDescription }
          : item,
      ),
    );
    setEditingItemId(null);
    setValidationError("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setItineraryItems((previousItems) => {
      const oldIndex = previousItems.findIndex((item) => item.id === active.id);
      const newIndex = previousItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return previousItems;
      }

      // TODO: Persist new order in backend when API is integrated
      // PATCH /api/travel-plans/:travelPlanId/days/:date/items/reorder
      // {
      //   itemIdsInOrder: string[]
      // }
      return arrayMove(previousItems, oldIndex, newIndex);
    });
  };

  const renderItineraryItems = () => {
    if (isLoading && itineraryItems.length === 0 && !isAdding) {
      return (
        <div
          className="text-xs text-gray-400 text-center py-2"
          data-testid="day-plans-loading"
        >
          Loading plans...
        </div>
      );
    }

    if (loadError && itineraryItems.length === 0 && !isAdding) {
      return (
        <div
          className="text-xs text-gray-400 text-center py-2"
          data-testid="day-plans-load-error"
        >
          {loadError}
        </div>
      );
    }

    if (itineraryItems.length === 0 && !isAdding) {
      return (
        <div className="text-xs text-gray-400 text-center py-2">
          No plans yet
        </div>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itineraryItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {itineraryItems.map((item) => {
            if (editingItemId === item.id) {
              return (
                <AddDayPlanForm
                  key={item.id}
                  initialValue={item.description}
                  onCancel={handleCancelEdit}
                  onConfirm={(description: string) =>
                    handleUpdate(item.id, description)
                  }
                  confirmLabel="Update"
                  error={validationError}
                />
              );
            }

            return (
              <SortableDayPlanItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    );
  };

  const { weekday, monthDay } = formatDate(date);

  useEffect(() => {
    void loadDayPlans();
  }, [loadDayPlans]);

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="text-left">
            <div className="font-semibold text-gray-900">Day {dayNumber}</div>
            <div className="text-sm text-gray-600">
              {weekday}, {monthDay}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-3">
            {renderItineraryItems()}
            {isAdding && (
              <AddDayPlanForm
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                error={createError ?? undefined}
              />
            )}

            {!isAdding && (
              <button
                onClick={handleAddPlan}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Plan
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop Table Column View
  return (
    <div className="flex-1 min-w-[200px] border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      {/* Day Header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className="font-semibold text-lg text-gray-900">
          Day {dayNumber}
        </div>
        <div className="text-sm text-gray-600">{weekday}</div>
        <div className="text-sm text-gray-600">{monthDay}</div>
      </div>

      {/* Itinerary Items Container */}
      <div className="space-y-2 mb-4 min-h-[100px]">
        {renderItineraryItems()}
        {isAdding && (
          <AddDayPlanForm
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            error={createError ?? undefined}
          />
        )}
      </div>

      {/* Add Plan Button */}
      {!isAdding && (
        <button
          onClick={handleAddPlan}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Plan
        </button>
      )}
    </div>
  );
}
