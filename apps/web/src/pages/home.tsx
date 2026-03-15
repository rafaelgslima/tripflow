import { HeaderPostLogin } from "@/components/HeaderPostLogin";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <HeaderPostLogin />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to TripFlow
          </h2>
          <p className="text-gray-600">
            Your travel planning features will appear here soon...
          </p>
        </div>
      </main>
    </div>
  );
}
