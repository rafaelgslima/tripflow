export interface TravelPlan {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface TravelPlansProps {
  statusFilter?: "active" | "past";
}
