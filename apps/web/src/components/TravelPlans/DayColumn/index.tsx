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
import { sortItemsByTime } from "@/utils/timeOptions";
import { formatDayHeader } from "@/utils/dateUtils";
import { AddDayPlanForm } from "./AddDayPlanForm";
import { InlineEditActivity } from "./InlineEditActivity";
import { SortableDayPlanItem } from "./SortableDayPlanItem";
import type { DayColumnProps } from "./types";

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
    updateError,
    clearUpdateError,
    updateDayPlan,
    deleteError,
    clearDeleteError,
    deleteDayPlan,
    reorderDayPlans,
    toggleDone,
  } = useDayPlans({ travelPlanId, date });
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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


  const handleAddPlan = () => {
    clearCreateError();
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleConfirm = async (description: string, time: string | null) => {
    try {
      await createDayPlan(description, time);
      setIsAdding(false);
      // Re-sort after create if a time was set
      if (time) {
        setItineraryItems((currentItems) => {
          const sorted = sortItemsByTime(currentItems);
          void reorderDayPlans(sorted.map((item) => item.id));
          return sorted;
        });
      }
    } catch (error) {
      console.error("Create day plan failed:", error);
    }
  };

  const handleEdit = (itemId: string) => {
    clearUpdateError();
    clearDeleteError();
    setEditingItemId(itemId);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    clearUpdateError();
    clearDeleteError();
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteDayPlan(itemId);
      setEditingItemId(null);
      clearUpdateError();
      clearDeleteError();
    } catch (error) {
      console.error("Delete day plan failed:", error);
    }
  };

  const handleUpdate = async (itemId: string, newDescription: string, newTime: string | null) => {
    const originalItem = itineraryItems.find((item) => item.id === itemId);
    if (
      originalItem &&
      originalItem.description === newDescription &&
      originalItem.time === newTime
    ) {
      setEditingItemId(null);
      clearUpdateError();
      return;
    }
    try {
      await updateDayPlan(itemId, newDescription, newTime);
      setEditingItemId(null);
      // Re-sort after time change and persist new order
      const sorted = sortItemsByTime(itineraryItems.map((item) =>
        item.id === itemId ? { ...item, description: newDescription, time: newTime } : item,
      ));
      setItineraryItems(() => sorted);
      void reorderDayPlans(sorted.map((item) => item.id));
    } catch (error) {
      console.error("Update day plan failed:", error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = itineraryItems.findIndex((item) => item.id === active.id);
    const newIndex = itineraryItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const draggedItem = itineraryItems[oldIndex];
    const targetItem = itineraryItems[newIndex];
    const draggedTime = draggedItem.time;
    const targetTime = targetItem.time;

    // Use arrayMove as the physical base, then swap times on top
    const moved = arrayMove(itineraryItems, oldIndex, newIndex);
    const withSwappedTimes = moved.map((item) => {
      if (item.id === draggedItem.id) return { ...item, time: targetTime };
      if (item.id === targetItem.id) return { ...item, time: draggedTime };
      return item;
    });

    // Only re-sort by time when at least one item has a time; otherwise
    // keep the arrayMove order so null-time items can be freely reordered
    const hasTimes = withSwappedTimes.some((item) => item.time !== null);
    const sorted = hasTimes ? sortItemsByTime(withSwappedTimes) : withSwappedTimes;

    // Update UI immediately (no side effects inside the updater)
    setItineraryItems(() => sorted);

    // Persist time swaps and new sort order
    if (draggedTime !== targetTime) {
      void updateDayPlan(draggedItem.id, draggedItem.description, targetTime);
      void updateDayPlan(targetItem.id, targetItem.description, draggedTime);
    }
    void reorderDayPlans(sorted.map((item) => item.id));
  };

  const renderItineraryItems = () => {
    if (isLoading && itineraryItems.length === 0 && !isAdding) {
      return (
        <div
          className="text-xs text-tf-muted text-center py-2"
          data-testid="day-plans-loading"
        >
          Loading…
        </div>
      );
    }

    if (loadError && itineraryItems.length === 0 && !isAdding) {
      return (
        <div
          className="text-xs text-red-300 text-center py-2"
          data-testid="day-plans-load-error"
        >
          {loadError}
        </div>
      );
    }

    if (itineraryItems.length === 0 && !isAdding) {
      return (
        <div className="text-xs text-tf-muted text-center py-2">
          No activities yet
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
            if (item.id === editingItemId) {
              return (
                <InlineEditActivity
                  key={item.id}
                  initialValue={item.description}
                  initialTime={item.time}
                  error={updateError || deleteError || undefined}
                  onSave={(desc, time) => { void handleUpdate(item.id, desc, time); }}
                  onCancel={handleCancelEdit}
                  onDelete={() => { void handleDelete(item.id); }}
                  onClearError={() => { clearUpdateError(); clearDeleteError(); }}
                />
              );
            }
            return (
              <SortableDayPlanItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onToggleDone={(itemId, isDone) => { void toggleDone(itemId, isDone); }}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    );
  };

  const { weekday, monthDay } = formatDayHeader(date);

  useEffect(() => {
    void loadDayPlans();
  }, [loadDayPlans]);

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div className="border border-tf-border rounded-xl overflow-hidden bg-tf-bg-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-[14px] px-4 bg-transparent border-none cursor-pointer text-left"
          aria-expanded={isExpanded}
        >
          <div>
            <div className="font-outfit font-semibold text-[13px] text-tf-amber tracking-[0.08em] uppercase">
              Day {dayNumber}
            </div>
            <div className="text-xs text-tf-muted font-outfit mt-[2px]">
              {weekday}, {monthDay}
            </div>
          </div>
          <svg
            className="text-tf-muted shrink-0 transition-transform duration-200"
            style={{
              width: "16px",
              height: "16px",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 flex flex-col gap-2 border-t border-tf-border pt-3">
            {renderItineraryItems()}
            {isAdding && (
              <AddDayPlanForm
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                error={createError ?? undefined}
                onClearError={clearCreateError}
              />
            )}

            {!isAdding && !editingItemId && (
              <button
                type="button"
                onClick={handleAddPlan}
                className="w-full flex items-center justify-center gap-1.5 p-2 border border-dashed border-tf-border-amber rounded-lg bg-transparent text-tf-amber text-xs font-outfit font-medium cursor-pointer opacity-70 transition-opacity duration-150"
              >
                <svg aria-hidden="true" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add activity
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop Column View
  return (
    <div className="shrink-0 min-w-[245px] border border-tf-border rounded-[14px] p-4 bg-tf-bg-2 flex flex-col gap-3" style={{ flex: "0 0 245px" }}>
      {/* Day Header */}
      <div className="pb-3 border-b border-tf-border">
        <div className="font-outfit font-semibold text-[11px] text-tf-amber tracking-[0.1em] uppercase mb-[2px]">
          Day {dayNumber}
        </div>
        <div className="text-[13px] text-tf-text font-outfit font-medium">
          {weekday}
        </div>
        <div className="text-xs text-tf-muted font-outfit">
          {monthDay}
        </div>
      </div>

      {/* Itinerary Items */}
      <div className="flex flex-col gap-2 min-h-[80px] flex-1">
        {renderItineraryItems()}
        {isAdding && (
          <AddDayPlanForm
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            error={createError ?? undefined}
            onClearError={clearCreateError}
          />
        )}
      </div>

      {/* Add Plan Button */}
      {!isAdding && !editingItemId && (
        <button
          type="button"
          onClick={handleAddPlan}
          className="w-full flex items-center justify-center gap-[5px] py-[7px] border border-dashed border-tf-border-amber rounded-lg bg-transparent text-tf-amber text-xs font-outfit font-medium cursor-pointer opacity-70 transition-opacity duration-150"
        >
          <svg aria-hidden="true" width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add activity
        </button>
      )}
    </div>
  );
}
