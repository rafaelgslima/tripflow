export interface ValidationResult {
  error: string | null;
}

export interface TravelPlanFormData {
  destination: string;
  startDate: string;
  endDate: string;
}

export interface TravelPlanValidationErrors {
  destination?: string;
  startDate?: string;
  endDate?: string;
}
