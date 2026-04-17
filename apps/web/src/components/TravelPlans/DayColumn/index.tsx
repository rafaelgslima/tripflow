import { useDroppable } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { MdAdd, MdExpandMore, MdArrowRightAlt } from "react-icons/md";
import { formatDayHeader } from "@/utils/dateUtils";
import { toDateOnlyISOString } from "@/utils/toDateOnlyISOString";
import { AddDayPlanForm } from "./AddDayPlanForm";
import { InlineEditActivity } from "./InlineEditActivity";
import { SortableDayPlanItem } from "./SortableDayPlanItem";
import { DayPlanItemCard } from "./DayPlanItemCard";
import type { DayColumnProps } from "./types";

export function DayColumn({
  date,
  dayNumber,
  isMobile = false,
  shouldShowMoveButton = false,
  readOnly = false,
  items,
  isLoading,
  loadError,
  createError,
  updateError,
  deleteError,
  onClearCreateError,
  onClearUpdateError,
  onClearDeleteError,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onToggleDone,
  onMoveUnfinishedToNextDay,
}: DayColumnProps) {
  const dayString = toDateOnlyISOString(date);
  // Register as a droppable zone so cross-day drags can land on empty columns
  const { setNodeRef, isOver } = useDroppable({ id: dayString });

  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMoveLoading, setIsMoveLoading] = useState(false);

  // On mobile, auto-expand accordion when dragging over it (to allow dropping)
  useEffect(() => {
    if (isMobile && isOver && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isMobile, isOver, isExpanded]);

  const handleAddPlan = () => {
    onClearCreateError();
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleConfirm = async (description: string, time: string | null) => {
    try {
      await onCreateItem(description, time);
      setIsAdding(false);
    } catch (error) {
      console.error("Create day plan failed:", error);
    }
  };

  const handleEdit = (itemId: string) => {
    onClearUpdateError();
    onClearDeleteError();
    setEditingItemId(itemId);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    onClearUpdateError();
    onClearDeleteError();
  };

  const handleDelete = async (itemId: string) => {
    try {
      await onDeleteItem(itemId);
      setEditingItemId(null);
      onClearUpdateError();
      onClearDeleteError();
    } catch (error) {
      console.error("Delete day plan failed:", error);
    }
  };

  const handleUpdate = async (itemId: string, newDescription: string, newTime: string | null) => {
    const originalItem = items.find((item) => item.id === itemId);
    if (
      originalItem &&
      originalItem.description === newDescription &&
      originalItem.time === newTime
    ) {
      setEditingItemId(null);
      onClearUpdateError();
      return;
    }
    try {
      await onUpdateItem(itemId, newDescription, newTime);
      setEditingItemId(null);
    } catch (error) {
      console.error("Update day plan failed:", error);
    }
  };

  const handleMoveUnfinished = async () => {
    setIsMoveLoading(true);
    try {
      await onMoveUnfinishedToNextDay();
    } catch (error) {
      console.error("Move unfinished activities failed:", error);
    } finally {
      setIsMoveLoading(false);
    }
  };

  const renderItineraryItems = () => {
    if (isLoading && items.length === 0 && !isAdding) {
      return (
        <div
          className="text-xs text-tf-muted text-center py-2"
          data-testid="day-plans-loading"
        >
          Loading…
        </div>
      );
    }

    if (loadError && items.length === 0 && !isAdding) {
      return (
        <div
          className="text-xs text-red-300 text-center py-2"
          data-testid="day-plans-load-error"
        >
          {loadError}
        </div>
      );
    }

    if (items.length === 0 && !isAdding) {
      return (
        <div className="text-xs text-tf-muted text-center py-2">
          No activities yet
        </div>
      );
    }

    return items.map((item) => {
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
            onClearError={() => { onClearUpdateError(); onClearDeleteError(); }}
          />
        );
      }
      if (readOnly) {
        return (
          <DayPlanItemCard
            key={item.id}
            item={item}
            onEdit={() => {}}
            onToggleDone={() => {}}
            readOnly
          />
        );
      }
      return (
        <SortableDayPlanItem
          key={item.id}
          item={item}
          onEdit={handleEdit}
          onToggleDone={(itemId, isDone) => { onToggleDone(itemId, isDone); }}
        />
      );
    });
  };

  const { weekday, monthDay } = formatDayHeader(date);

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div ref={setNodeRef} className="border border-tf-border rounded-xl overflow-hidden bg-tf-bg-2">
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
          <MdExpandMore
            className="text-tf-muted shrink-0 transition-transform duration-200"
            style={{
              width: "16px",
              height: "16px",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
            aria-hidden="true"
          />
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 flex flex-col gap-2 border-t border-tf-border pt-3">
            {renderItineraryItems()}
            {isAdding && (
              <AddDayPlanForm
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                error={createError ?? undefined}
                onClearError={onClearCreateError}
              />
            )}
            {!isAdding && !editingItemId && !readOnly && (
              <>
                <button
                  type="button"
                  onClick={handleAddPlan}
                  className="w-full flex items-center justify-center gap-1.5 p-2 border border-dashed border-tf-border-amber rounded-lg bg-transparent text-tf-amber text-xs font-outfit font-medium cursor-pointer opacity-70 transition-opacity duration-150"
                >
                  <MdAdd size={13} aria-hidden="true" />
                  Add activity
                </button>
                {shouldShowMoveButton && (
                  <button
                    type="button"
                    onClick={() => { void handleMoveUnfinished(); }}
                    disabled={isMoveLoading}
                    className="w-full flex items-center justify-center gap-1.5 p-2 border border-dashed border-tf-border-amber rounded-lg bg-transparent text-tf-amber text-xs font-outfit font-medium cursor-pointer opacity-70 transition-opacity duration-150 enabled:hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MdArrowRightAlt size={13} aria-hidden="true" className="flex-shrink-0" />
                    Move incomplete to next day
                  </button>
                )}
              </>
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

      {/* Itinerary Items — droppable zone */}
      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[80px] flex-1">
        {renderItineraryItems()}
        {isAdding && (
          <AddDayPlanForm
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            error={createError ?? undefined}
            onClearError={onClearCreateError}
          />
        )}
      </div>

      {/* Add Plan Button & Move Unfinished Button */}
      {!isAdding && !editingItemId && !readOnly && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleAddPlan}
            className="w-full flex items-center justify-center gap-[5px] py-[7px] border border-dashed border-tf-border-amber rounded-lg bg-transparent text-tf-amber text-xs font-outfit font-medium cursor-pointer opacity-70 transition-opacity duration-150"
          >
            <MdAdd size={12} aria-hidden="true" />
            Add activity
          </button>
          {shouldShowMoveButton && (
            <button
              type="button"
              onClick={() => { void handleMoveUnfinished(); }}
              disabled={isMoveLoading}
              className="w-full flex items-center justify-center gap-[5px] py-[7px] border border-dashed border-tf-border-amber rounded-lg bg-transparent text-tf-amber text-xs font-outfit font-medium cursor-pointer opacity-70 transition-opacity duration-150 enabled:hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MdArrowRightAlt size={12} aria-hidden="true" className="flex-shrink-0" />
              Move incomplete to next day
            </button>
          )}
        </div>
      )}
    </div>
  );
}
