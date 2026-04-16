export interface ItineraryItem {
  id: string;
  description: string;
  time: string | null; // HH:MM 24-hour format, e.g. "09:00"
  isDone: boolean;
  createdAt: Date;
}
