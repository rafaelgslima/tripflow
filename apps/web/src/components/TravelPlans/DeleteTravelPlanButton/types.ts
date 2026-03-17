export interface DeleteTravelPlanButtonProps {
  travelPlanId: string;
  onDelete: (travelPlanId: string) => Promise<void>;
}
