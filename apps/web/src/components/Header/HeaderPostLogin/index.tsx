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
      {showWarning && (
        <SessionTimeoutWarning
          remainingSeconds={remainingSeconds}
          onExtendSession={handleExtendSession}
          onLogout={handleLogoutNow}
        />
      )}

      <header className="border-b border-tf-border backdrop-blur-[16px] bg-[rgba(14,11,9,0.85)] sticky top-0 z-40">
        <nav className="max-w-[1200px] mx-auto px-6 h-[62px] flex items-center justify-between">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/home" className="tf-nav-link">My trips</Link>
            <Link href="/past-trips" className="tf-nav-link">Past trips</Link>
            <Link href="/profile" className="tf-nav-link">Profile</Link>
            <button type="button" onClick={handleLogout} className="tf-btn-logout">
              Log out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-tf-muted bg-transparent border-none cursor-pointer"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            onClick={handleMobileMenuToggle}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="md:hidden flex flex-col fixed inset-0 z-50 bg-tf-bg"
        >
          {/* Mobile header */}
          <div className="h-[62px] flex items-center justify-between border-b border-tf-border px-6">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={handleMobileMenuClose}
              className="p-2 rounded-lg text-tf-muted bg-transparent border-none cursor-pointer"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-between p-8 px-6">
            <div className="flex flex-col gap-1">
              <Link
                href="/home"
                onClick={handleMobileMenuClose}
                className="block py-[14px] px-4 text-[18px] font-medium text-tf-text no-underline font-outfit rounded-xl"
              >
                My trips
              </Link>
              <Link
                href="/past-trips"
                onClick={handleMobileMenuClose}
                className="block py-[14px] px-4 text-[18px] font-medium text-tf-text no-underline font-outfit rounded-xl"
              >
                Past trips
              </Link>
              <Link
                href="/profile"
                onClick={handleMobileMenuClose}
                className="block py-[14px] px-4 text-[18px] font-medium text-tf-text no-underline font-outfit rounded-xl"
              >
                Profile
              </Link>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="tf-btn-ghost w-full"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
