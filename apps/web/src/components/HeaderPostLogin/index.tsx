import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import type { HeaderPostLoginProps } from "./types";

export function HeaderPostLogin({ userName, userEmail }: HeaderPostLoginProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to TripFlow
          </h1>
          <div className="flex items-center space-x-4">
            {userName && (
              <span className="text-sm text-gray-600">Hi, {userName}!</span>
            )}
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
  );
}
