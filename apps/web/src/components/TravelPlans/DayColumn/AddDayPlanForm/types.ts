export interface AddDayPlanFormProps {
  initialValue?: string;
  onCancel: () => void;
  onConfirm: (description: string, time: string | null) => void;
  confirmLabel?: string;
  error?: string;
  onClearError?: () => void;

  onDelete?: () => void;
  deleteLabel?: string;
}
