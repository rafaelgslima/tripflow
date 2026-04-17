export interface DayColumnsGridProps {
  travelPlanId: string;
  days: Date[];
  isMobile: boolean;
  /** When true, disables drag-and-drop and all mutations */
  readOnly?: boolean;
}
