import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
import type { UseDeleteAccountReturn } from "./types";

export function useDeleteAccount(): UseDeleteAccountReturn {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = useCallback(async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const token = await getSupabaseAccessToken();
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      // Redirect to home page after successful deletion
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete account";
      setError(errorMsg);
      console.error("Delete account error:", errorMsg);
    } finally {
      setIsDeleting(false);
    }
  }, [router]);

  return { deleteAccount, isDeleting, error };
}
