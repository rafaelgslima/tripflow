import { useState, useEffect } from "react";
import { HeaderPostLogin } from "@/components/Header/HeaderPostLogin";
import { Loading } from "@/components/Loading";
import { EditProfileForm } from "@/components/EditProfileForm";
import { DangerousZoneSection } from "@/components/DangerousZoneSection";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
import { showKlaroManager } from "@/hooks/useKlaroConsent";

export default function ProfilePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.id);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.name || user?.email || ""
  );
  const [isExporting, setIsExporting] = useState(false);
  const [restrictLogging, setRestrictLogging] = useState(false);
  const [isSavingLoggingPreference, setIsSavingLoggingPreference] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.name);
      setRestrictLogging(profile.restrict_logging ?? false);
    }
  }, [profile]);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const token = await getSupabaseAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }
      const response = await fetch("/api/auth/export-data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Export failed:", response.status, errorData);
        throw new Error(`Export failed (${response.status}): ${errorData}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tripflow-data-export.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleRestrictLogging = async () => {
    setIsSavingLoggingPreference(true);
    try {
      const token = await getSupabaseAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const response = await fetch("/api/auth/update-logging-preference", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restrict_logging: !restrictLogging }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Update logging preference response:", response.status, errorData);
        throw new Error(`Failed to update preference (${response.status}): ${errorData}`);
      }

      setRestrictLogging(!restrictLogging);
    } catch (error) {
      console.error("Error updating logging preference:", error);
      alert("Failed to update preference. Please try again.");
    } finally {
      setIsSavingLoggingPreference(false);
    }
  };

  const loading = authLoading || profileLoading;

  if (loading) return <Loading />;
  if (!user) return null;

  // Fallback to auth data if profile table doesn't have data
  const profileData = profile || {
    id: user.id,
    name: user.user_metadata?.name || user.email || "",
    email: user.email || "",
  };

  return (
    <div className="min-h-screen bg-tf-bg">
      <div className="grain" aria-hidden="true" />
      <HeaderPostLogin />

      <main className="max-w-[640px] mx-auto py-12 px-6 relative z-[1]">
        {/* Page title */}
        <div className="mb-8">
          <h1
            className="font-lora font-light tracking-[-0.02em] text-tf-text leading-[1.1] mb-2 text-[30px]"
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
            <div className="border-t border-tf-border pt-7 pb-10 mb-3">
              <EditProfileForm
                name={displayName}
                email={profileData.email}
                onNameUpdated={setDisplayName}
              />
            </div>

            {/* Your Data Section */}
            <div className="border-t border-tf-border pt-7 mb-7">
              <h3 className="text-sm font-semibold text-tf-text font-outfit mb-3">
                Your Data
              </h3>
              <p className="text-xs text-tf-muted font-outfit mb-4">
                Download a copy of all your personal data stored by TripFlow.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent text-tf-text border border-tf-border rounded-[10px] font-outfit text-[12px] font-medium cursor-pointer transition-all duration-200 hover:border-tf-amber hover:text-tf-amber hover:shadow-md hover:bg-[rgba(232,162,58,0.03)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? "Exporting…" : "Download your data"}
              </button>
            </div>

            {/* Privacy Settings Section */}
            <div className="border-t border-tf-border pt-7 mb-7">
              <h3 className="text-sm font-semibold text-tf-text font-outfit mb-3">
                Privacy Settings
              </h3>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restrictLogging}
                    onChange={handleToggleRestrictLogging}
                    disabled={isSavingLoggingPreference}
                    className="mt-1 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm text-tf-text font-medium">
                      Minimize activity logging
                    </div>
                    <p className="text-xs text-tf-muted mt-1">
                      Opt out of routine activity logging. Critical events (account deletion, data export) are always logged for security.
                    </p>
                  </div>
                </label>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showKlaroManager()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent text-tf-text border border-tf-border rounded-[10px] font-outfit text-[12px] font-medium cursor-pointer transition-all duration-200 hover:border-tf-amber hover:text-tf-amber hover:shadow-md hover:bg-[rgba(232,162,58,0.03)]"
                  >
                    Manage Consents
                  </button>
                </div>
              </div>
            </div>

            {/* Dangerous Zone Section */}
            <DangerousZoneSection />
          </div>
        </div>
      </main>
    </div>
  );
}
