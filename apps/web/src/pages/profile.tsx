import { HeaderPostLogin } from "@/components/HeaderPostLogin";
import { Loading } from "@/components/Loading";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <HeaderPostLogin />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Hello, {user.user_metadata?.name || user.email}!
            </h2>
            <p className="text-gray-600">
              You are successfully logged in to your TripFlow account.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              {user.user_metadata?.name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.user_metadata.name}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Account Status
                </dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500 text-center">
              Profile editing features coming soon...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
