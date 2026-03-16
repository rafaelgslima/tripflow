import type { ItineraryItem as SharedItineraryItem } from "@/types/itinerary";

export interface DayColumnProps {
  date: Date;
  dayNumber: number;
  travelPlanId: string;
  isMobile?: boolean;
}

export type ItineraryItem = SharedItineraryItem;
