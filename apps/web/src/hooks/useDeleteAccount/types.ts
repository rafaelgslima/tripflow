export interface UseDeleteAccountReturn {
  deleteAccount: () => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}
