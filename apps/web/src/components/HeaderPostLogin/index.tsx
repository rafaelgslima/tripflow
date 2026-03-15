import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import { useSessionTimeoutWarning } from "@/hooks/useSessionTimeoutWarning";
import type { HeaderPostLoginProps } from "./types";

export function HeaderPostLogin() {
  const router = useRouter();

  // Session timeout configuration from environment variables
  const timeoutDuration =
    Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_DURATION) || 1200;
  const warningDuration =
    Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_WARNING) || 120;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const {
    showWarning,
    remainingSeconds,
    handleExtendSession,
    handleLogoutNow,
  } = useSessionTimeoutWarning({
    timeoutDuration,
    warningDuration,
    onLogout: handleLogout,
  });

  return (
    <>
      {/* Session Timeout Warning */}
      {showWarning && (
        <SessionTimeoutWarning
          remainingSeconds={remainingSeconds}
          onExtendSession={handleExtendSession}
          onLogout={handleLogoutNow}
        />
      )}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to TripFlow
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/home"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/profile"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
