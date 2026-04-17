import type { ItineraryItem } from "@/types/itinerary";

export interface DayState {
  items: ItineraryItem[];
  isLoading: boolean;
  loadError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  toggleDoneError: string | null;
}

export interface UseTravelPlanItemsParams {
  travelPlanId: string;
}

export interface UseTravelPlanItemsReturn {
  getDay: (day: string) => DayState;
  setDayItems: (day: string, updater: (prev: ItineraryItem[]) => ItineraryItem[]) => void;
  loadDay: (day: string) => Promise<void>;
  createItem: (day: string, description: string, time: string | null) => Promise<void>;
  updateItem: (day: string, itemId: string, description: string, time: string | null) => Promise<void>;
  deleteItem: (day: string, itemId: string) => Promise<void>;
  toggleDone: (day: string, itemId: string, isDone: boolean) => Promise<void>;
  reorderDay: (day: string, itemIds: string[]) => Promise<void>;
  moveItemBetweenDays: (
    itemId: string,
    fromDay: string,
    toDay: string,
  ) => Promise<void>;
  clearCreateError: (day: string) => void;
  clearUpdateError: (day: string) => void;
  clearDeleteError: (day: string) => void;
  clearToggleDoneError: (day: string) => void;
}
