import { useMemo } from "react";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { useAcceptShareInvite } from "@/hooks/useAcceptShareInvite";

export default function AcceptShareInvitePage() {
  const router = useRouter();

  const token = useMemo(() => {
    const raw = router.query.token;
    return typeof raw === "string" ? raw : null;
  }, [router.query.token]);

  const { status, errorMessage } = useAcceptShareInvite(token);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold text-gray-900">
            Invite link is invalid
          </h1>
          <p className="text-sm text-gray-600">
            This invite link is missing a token.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-xl font-bold text-gray-900">Accept invitation</h1>

        {status === "loading" && (
          <div className="flex items-center gap-3 text-gray-700">
            <LoadingSpinner size="md" className="text-primary-600" />
            <span className="text-sm">Confirming invitation…</span>
          </div>
        )}

        {status === "success" && (
          <p className="text-sm text-green-700">
            Invitation accepted. Redirecting to your travel plans…
          </p>
        )}

        {status === "error" && (
          <p className="text-sm text-red-700">
            {errorMessage ??
              "Unable to accept invitation. Please try again later."}
          </p>
        )}

        {status === "idle" && (
          <p className="text-sm text-gray-600">Preparing to accept invite…</p>
        )}
      </div>
    </div>
  );
}
