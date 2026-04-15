export interface ShareEntry {
  id: string;
  invited_email: string;
  status: "pending" | "accepted";
  invited_name: string | null;
}

export interface UseTravelPlanSharesReturn {
  shares: ShareEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
