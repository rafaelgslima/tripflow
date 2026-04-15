import { HeaderPostLogin } from "@/components/Header/HeaderPostLogin";
import { Loading } from "@/components/Loading";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <Loading />;
  if (!user) return null;

  const displayName = user.user_metadata?.name || user.email;

  return (
    <div className="min-h-screen bg-tf-bg">
      <div className="grain" aria-hidden="true" />
      <HeaderPostLogin />

      <main className="max-w-[640px] mx-auto py-12 px-6 relative z-[1]">
        {/* Page title */}
        <div className="mb-8">
          <h1
            className="font-cormorant font-light tracking-[-0.02em] text-tf-text leading-[1.1] mb-2"
            style={{ fontSize: "clamp(36px, 4vw, 48px)" }}
          >
            Your profile
          </h1>
          <p className="text-sm text-tf-muted font-outfit">
            Account details and settings
          </p>
        </div>

        {/* Profile card */}
        <div className="bg-tf-card border border-tf-border rounded-[20px] overflow-hidden">
          {/* Card header */}
          <div className="p-7 border-b border-tf-border flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-full bg-tf-amber flex items-center justify-center text-[20px] font-bold text-[#0E0B09] font-outfit shrink-0">
              {(displayName ?? "?")[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-[17px] font-semibold text-tf-text font-outfit mb-[2px]">
                {displayName}
              </div>
              <div className="text-[13px] text-tf-muted font-outfit">
                {user.email}
              </div>
            </div>
            {/* Active badge */}
            <div className="ml-auto inline-flex items-center gap-1.5 py-1 px-[10px] rounded-full bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.18)]">
              <div className="w-[6px] h-[6px] rounded-full bg-green-400" />
              <span className="text-xs font-semibold text-green-300 font-outfit">
                Active
              </span>
            </div>
          </div>

          {/* Account details */}
          <div className="p-7">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-tf-muted font-outfit mb-5">
              Account information
            </div>

            <dl className="flex flex-col gap-5">
              <div>
                <dt className="text-xs text-tf-muted font-outfit mb-1">
                  Email address
                </dt>
                <dd className="text-sm text-tf-text font-outfit font-medium">
                  {user.email}
                </dd>
              </div>

              {user.user_metadata?.name && (
                <div>
                  <dt className="text-xs text-tf-muted font-outfit mb-1">
                    Display name
                  </dt>
                  <dd className="text-sm text-tf-text font-outfit font-medium">
                    {user.user_metadata.name}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-7 pt-6 border-t border-tf-border text-[13px] text-tf-muted font-outfit text-center">
              Profile editing coming soon
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
