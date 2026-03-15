export interface CreateTravelPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (destination: string, startDate: Date, endDate: Date) => void;
}
