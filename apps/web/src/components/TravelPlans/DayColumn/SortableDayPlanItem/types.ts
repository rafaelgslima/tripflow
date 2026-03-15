import type { ItineraryItem } from "../types";

export interface SortableDayPlanItemProps {
  item: ItineraryItem;
  onEdit: (itemId: string) => void;
}
