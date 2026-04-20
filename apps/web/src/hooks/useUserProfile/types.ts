export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
}

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
