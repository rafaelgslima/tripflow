export interface InlineEditActivityProps {
  initialValue: string;
  error?: string;
  onSave: (description: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onClearError?: () => void;
}
