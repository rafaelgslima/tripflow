import type { User } from "@supabase/supabase-js";

export interface UseRequireAuthReturn {
  user: User | null;
  loading: boolean;
}
