import type { ItineraryItem } from "@/types/itinerary";

export type SetItineraryItems = (
  updater: (previous: ItineraryItem[]) => ItineraryItem[],
) => void;

export interface UseDayPlansParams {
  travelPlanId: string;
  date: Date;
}

export interface UseDayPlansReturn {
  itineraryItems: ItineraryItem[];
  setItineraryItems: SetItineraryItems;
  isLoading: boolean;
  loadError: string | null;
  loadDayPlans: () => Promise<void>;
  isCreating: boolean;
  createError: string | null;
  clearCreateError: () => void;
  createDayPlan: (description: string, time?: string | null) => Promise<void>;

  isUpdating: boolean;
  updateError: string | null;
  clearUpdateError: () => void;
  updateDayPlan: (itemId: string, description: string, time?: string | null) => Promise<void>;

  isDeleting: boolean;
  deleteError: string | null;
  clearDeleteError: () => void;
  deleteDayPlan: (itemId: string) => Promise<void>;

  reorderDayPlans: (itemIdsInOrder: string[]) => Promise<void>;
}
