import type { TravelPlan } from "@/components/TravelPlans/types";

export interface TravelPlansListProps {
  plans: TravelPlan[];
  onDeletePlan: (travelPlanId: string) => Promise<void>;
  /** When true, hides share and delete buttons, enables read-only mode for day columns */
  readOnly?: boolean;
}
