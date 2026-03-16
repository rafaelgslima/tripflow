import type { TravelPlan } from "@/components/TravelPlans/types";

export interface UseTravelPlansReturn {
  travelPlans: TravelPlan[];
  isLoading: boolean;
  loadError: string | null;
  loadTravelPlans: () => Promise<void>;
  isCreating: boolean;
  createError: string | null;
  createPlan: (
    destination: string,
    startDate: Date,
    endDate: Date,
  ) => Promise<void>;
}
