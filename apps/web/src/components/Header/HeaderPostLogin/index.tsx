import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import { useSessionTimeoutWarning } from "@/hooks/useSessionTimeoutWarning";

export function HeaderPostLogin() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Session timeout configuration from environment variables
  const timeoutDuration =
    Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_DURATION) || 1200;
  const warningDuration =
    Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_WARNING) || 120;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((previous) => !previous);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
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

      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo
              textClassName="text-2xl font-bold text-primary-600"
              iconClassName="w-6 h-6 text-primary-600"
            />

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/home"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                Log out
              </button>
            </div>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              onClick={handleMobileMenuToggle}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="md:hidden fixed inset-0 z-50 bg-white"
        >
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <Logo
              textClassName="text-2xl font-bold text-primary-600"
              iconClassName="w-6 h-6 text-primary-600"
            />
            <button
              type="button"
              aria-label="Close menu"
              onClick={handleMobileMenuClose}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex h-[calc(100vh-4rem)] flex-col justify-between px-6 py-6">
            <div className="space-y-3">
              <Link
                href="/home"
                className="block rounded-md px-3 py-3 text-lg font-semibold text-gray-800 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                onClick={handleMobileMenuClose}
              >
                Home
              </Link>
              <Link
                href="/profile"
                className="block rounded-md px-3 py-3 text-lg font-semibold text-gray-800 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                onClick={handleMobileMenuClose}
              >
                Profile
              </Link>
            </div>

            <div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
