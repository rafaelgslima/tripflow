export interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}
