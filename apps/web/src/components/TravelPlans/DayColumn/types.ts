import type { ItineraryItem as SharedItineraryItem } from "@/types/itinerary";

export type ItineraryItem = SharedItineraryItem;

export interface DayColumnProps {
  date: Date;
  dayNumber: number;
  isMobile?: boolean;

  // Controlled items state (managed by DayColumnsGrid via useTravelPlanItems)
  items: ItineraryItem[];
  isLoading: boolean;
  loadError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  onClearCreateError: () => void;
  onClearUpdateError: () => void;
  onClearDeleteError: () => void;

  onCreateItem: (description: string, time: string | null) => Promise<void>;
  onUpdateItem: (itemId: string, description: string, time: string | null) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onToggleDone: (itemId: string, isDone: boolean) => void;
}
