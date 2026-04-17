import type { ItineraryItem } from "@/types/itinerary";

export interface DayPlanItemCardProps {
  item: ItineraryItem;
  onEdit: (itemId: string) => void;
  onToggleDone: (itemId: string, isDone: boolean) => void;
  /** Listeners from useSortable — omit when rendering in a DragOverlay */
  dragListeners?: Record<string, (event: Event) => void>;
  /** When true, disables editing, done-toggle, and visual interactivity */
  readOnly?: boolean;
}
