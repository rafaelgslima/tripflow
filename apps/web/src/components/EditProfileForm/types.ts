export interface EditProfileFormProps {
  name: string;
  email: string;
  onNameUpdated?: (newName: string) => void;
}
