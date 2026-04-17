import { HeaderPostLogin } from "@/components/Header/HeaderPostLogin";
import { Loading } from "@/components/Loading";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { PastTrips } from "@/components/PastTrips";

export default function PastTripsPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <Loading />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-tf-bg">
      <div className="grain" aria-hidden="true" />
      <HeaderPostLogin />
      <main className="max-w-[1200px] mx-auto py-12 px-6 relative z-[1]">
        <PastTrips />
      </main>
    </div>
  );
}
