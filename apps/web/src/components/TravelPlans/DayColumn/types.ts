export interface DayColumnProps {
  date: Date;
  dayNumber: number;
  travelPlanId: string;
  isMobile?: boolean;
}

export interface ItineraryItem {
  id: string;
  description: string;
  createdAt: Date;
}
