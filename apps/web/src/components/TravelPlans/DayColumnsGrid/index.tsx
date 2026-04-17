import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { DayPlanItemCard } from "../DayColumn/DayPlanItemCard";
import { useTravelPlanItems } from "@/hooks/useTravelPlanItems";
import type { ItineraryItem } from "@/types/itinerary";
import { toDateOnlyISOString } from "@/utils/toDateOnlyISOString";
import { sortItemsByTime, shouldShowMoveIncompleteButton } from "@/utils/timeOptions";
import { DayColumn } from "../DayColumn";
import type { DayColumnsGridProps } from "./types";

export function DayColumnsGrid({ travelPlanId, days, isMobile }: DayColumnsGridProps) {
  const travelPlanItems = useTravelPlanItems({ travelPlanId });
  const dayStrings = useMemo(() => days.map((d) => toDateOnlyISOString(d)), [days]);
  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 180, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  useEffect(() => {
    dayStrings.forEach((day) => { void travelPlanItems.loadDay(day); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayStrings.join(","), travelPlanId]);

  const findItemById = (id: string): ItineraryItem | null => {
    for (const day of dayStrings) {
      const found = travelPlanItems.getDay(day).items.find((i) => i.id === id);
      if (found) return found;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(findItemById(String(event.active.id)));
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeDay = active.data.current?.sortable?.containerId as string | undefined;
    if (!activeDay || !dayStrings.includes(activeDay)) return;

    const overContainerId = over.data.current?.sortable?.containerId as string | undefined;
    const overDay = overContainerId ?? overId;

    if (!dayStrings.includes(overDay)) return;

    if (activeDay === overDay) {
      // Same-day: swap times to keep items in their visual slot, then sort
      if (!overContainerId) return;

      const items = travelPlanItems.getDay(activeDay).items;
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex = items.findIndex((i) => i.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const draggedItem = items[oldIndex];
      const targetItem = items[newIndex];
      const draggedTime = draggedItem.time;
      const targetTime = targetItem.time;

      const moved = arrayMove(items, oldIndex, newIndex);
      const withSwappedTimes = moved.map((item) => {
        if (item.id === draggedItem.id) return { ...item, time: targetTime };
        if (item.id === targetItem.id) return { ...item, time: draggedTime };
        return item;
      });

      const hasTimes = withSwappedTimes.some((item) => item.time !== null);
      const sorted = hasTimes ? sortItemsByTime(withSwappedTimes) : withSwappedTimes;

      travelPlanItems.setDayItems(activeDay, () => sorted);

      if (draggedTime !== targetTime) {
        void travelPlanItems.updateItem(activeDay, draggedItem.id, draggedItem.description, targetTime);
        void travelPlanItems.updateItem(activeDay, targetItem.id, targetItem.description, draggedTime);
      }
      void travelPlanItems.reorderDay(activeDay, sorted.map((i) => i.id));
    } else {
      // Cross-day: move item preserving its original time
      void travelPlanItems.moveItemBetweenDays(activeId, activeDay, overDay);
    }
  };

  const columns = days.map((day, index) => {
    const dayString = toDateOnlyISOString(day);
    const dayState = travelPlanItems.getDay(dayString);
    const isLastDay = index === days.length - 1;
    const nextDay = !isLastDay ? days[index + 1] : null;
    const nextDayString = nextDay ? toDateOnlyISOString(nextDay) : null;
    const shouldShowMoveButton = !isLastDay && shouldShowMoveIncompleteButton(dayState.items, day);

    const handleMoveUnfinished = async () => {
      if (!nextDayString) return;

      // Get current state at click time, not render time
      const currentDayState = travelPlanItems.getDay(dayString);
      const unfinishedItems = currentDayState.items.filter((item) => !item.isDone);
      if (unfinishedItems.length === 0) return;

      try {
        // Move items sequentially to avoid race conditions and ensure state consistency
        for (const item of unfinishedItems) {
          await travelPlanItems.moveItemBetweenDays(item.id, dayString, nextDayString);
        }
      } catch (error) {
        console.error("Failed to move incomplete activities:", error);
        throw error;
      }
    };

    return (
      <SortableContext
        key={day.toISOString()}
        id={dayString}
        items={dayState.items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <DayColumn
          date={day}
          dayNumber={index + 1}
          isMobile={isMobile}
          shouldShowMoveButton={shouldShowMoveButton}
          items={dayState.items}
          isLoading={dayState.isLoading}
          loadError={dayState.loadError}
          createError={dayState.createError}
          updateError={dayState.updateError}
          deleteError={dayState.deleteError}
          onClearCreateError={() => travelPlanItems.clearCreateError(dayString)}
          onClearUpdateError={() => travelPlanItems.clearUpdateError(dayString)}
          onClearDeleteError={() => travelPlanItems.clearDeleteError(dayString)}
          onCreateItem={(desc, time) => travelPlanItems.createItem(dayString, desc, time)}
          onUpdateItem={(itemId, desc, time) =>
            travelPlanItems.updateItem(dayString, itemId, desc, time)
          }
          onDeleteItem={(itemId) => travelPlanItems.deleteItem(dayString, itemId)}
          onToggleDone={(itemId, isDone) => travelPlanItems.toggleDone(dayString, itemId, isDone)}
          onMoveUnfinishedToNextDay={handleMoveUnfinished}
        />
      </SortableContext>
    );
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      {isMobile ? (
        <div className="flex flex-col gap-2">{columns}</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-3" style={{ minWidth: "100%" }}>
            {columns}
          </div>
        </div>
      )}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="rotate-1 opacity-95 shadow-2xl">
            <DayPlanItemCard
              item={activeItem}
              onEdit={() => {}}
              onToggleDone={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
