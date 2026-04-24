export interface UserProfile {
  id: string;
  name: string;
  email: string;
  restrict_logging?: boolean;
}

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
