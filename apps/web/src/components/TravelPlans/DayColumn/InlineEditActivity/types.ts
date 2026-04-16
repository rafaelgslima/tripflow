export interface InlineEditActivityProps {
  initialValue: string;
  initialTime?: string | null;
  error?: string;
  onSave: (description: string, time: string | null) => void;
  onCancel: () => void;
  onDelete: () => void;
  onClearError?: () => void;
}
