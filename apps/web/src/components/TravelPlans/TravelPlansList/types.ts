import type { TravelPlan } from "@/components/TravelPlans/types";

export interface TravelPlansListProps {
  plans: TravelPlan[];
  onDeletePlan: (travelPlanId: string) => Promise<void>;
}
