import { useState, useEffect } from "react";
import { HeaderPostLogin } from "@/components/Header/HeaderPostLogin";
import { Loading } from "@/components/Loading";
import { EditProfileForm } from "@/components/EditProfileForm";
import { DangerousZoneSection } from "@/components/DangerousZoneSection";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfilePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.id);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.name || user?.email || ""
  );

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.name);
    }
  }, [profile]);

  const loading = authLoading || profileLoading;

  if (loading) return <Loading />;
  if (!user) return null;

  // Fallback to auth data if profile table doesn't have data
  const profileData = profile || {
    id: user.id,
    name: user.user_metadata?.name || user.email || "",
    email: user.email || "",
    avatar_url: null,
    country: null,
    city: null,
  };

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
          </div>

          {/* Account details */}
          <div className="p-7">
            <dl className="flex flex-col gap-5 mb-7">
              <div>
                <dt className="text-xs text-tf-muted font-outfit mb-1">
                  Email address
                </dt>
                <dd className="text-sm text-tf-text font-outfit font-medium">
                  {profileData.email}
                </dd>
              </div>
            </dl>

            {/* Edit profile form */}
            <div className="border-t border-tf-border pt-7">
              <EditProfileForm
                name={displayName}
                email={profileData.email}
                onNameUpdated={setDisplayName}
              />
            </div>

            {/* Dangerous Zone Section */}
            <DangerousZoneSection />
          </div>
        </div>
      </main>
    </div>
  );
}
