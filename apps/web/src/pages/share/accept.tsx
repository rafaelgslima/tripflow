import { useMemo } from "react";
import { useRouter } from "next/router";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { Logo } from "@/components/Logo";
import { useAcceptShareInvite } from "@/hooks/useAcceptShareInvite";

export default function AcceptShareInvitePage() {
  const router = useRouter();

  const token = useMemo(() => {
    const raw = router.query.token;
    return typeof raw === "string" ? raw : null;
  }, [router.query.token]);

  const { status, errorMessage } = useAcceptShareInvite(token);

  const pageWrapper = (children: React.ReactNode) => (
    <div className="min-h-screen bg-tf-bg flex flex-col items-center justify-center p-6 relative">
      <div className="grain" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="fixed pointer-events-none"
        style={{
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(600px, 100vw)",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(232,162,58,0.06) 0%, transparent 65%)",
        }}
      />
      <div className="w-full max-w-[440px] bg-tf-card border border-tf-border rounded-[20px] p-10 relative z-[1] shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
        <div className="text-center mb-8">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );

  if (!token) {
    return pageWrapper(
      <>
        <h1 className="font-cormorant text-[28px] font-light text-tf-text mb-[10px] text-center">
          Invalid invite link
        </h1>
        <p className="text-sm text-tf-muted font-outfit text-center">
          This invite link is missing a token. Please check your email and try the link again.
        </p>
      </>
    );
  }

  return pageWrapper(
    <>
      <h1 className="font-cormorant text-[28px] font-light text-tf-text mb-5 text-center">
        Accept invitation
      </h1>

      {status === "loading" && (
        <div className="flex items-center justify-center gap-3">
          <LoadingSpinner size="md" className="text-amber-400" />
          <span className="text-sm text-tf-muted font-outfit">
            Confirming your invitation…
          </span>
        </div>
      )}

      {status === "idle" && (
        <p className="text-sm text-tf-muted font-outfit text-center">
          Preparing to accept invite…
        </p>
      )}

      {status === "success" && (
        <div className="tf-alert-success text-center">
          Invitation accepted! Redirecting to your travel plans…
        </div>
      )}

      {status === "error" && (
        <div className="tf-alert-error text-center">
          {errorMessage ?? "Unable to accept invitation. The link may be expired or already used."}
        </div>
      )}
    </>
  );
}
