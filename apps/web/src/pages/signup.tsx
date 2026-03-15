import Link from "next/link";
import { AuthPageHeader } from "@/components/AuthPageHeader";
import { SignupForm } from "@/components/Form/SignupForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <AuthPageHeader
          title="Create your account"
          subtitle="Start planning your perfect trip today"
        />

        {/* Sign Up Form */}
        <SignupForm />
      </div>
    </div>
  );
}
