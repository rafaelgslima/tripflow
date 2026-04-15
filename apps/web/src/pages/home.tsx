import { HeaderPostLogin } from "@/components/Header/HeaderPostLogin";
import { TravelPlans } from "@/components/TravelPlans";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-tf-bg">
      <div className="grain" aria-hidden="true" />
      <HeaderPostLogin />
      <main className="max-w-[1200px] mx-auto py-12 px-6 relative z-[1]">
        <TravelPlans />
      </main>
    </div>
  );
}
