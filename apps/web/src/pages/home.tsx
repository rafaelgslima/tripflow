import { HeaderPostLogin } from "@/components/Header/HeaderPostLogin";
import { TravelPlans } from "@/components/TravelPlans";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <HeaderPostLogin />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TravelPlans />
      </main>
    </div>
  );
}
