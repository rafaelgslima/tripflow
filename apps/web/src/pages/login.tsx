import Link from "next/link";
import { AuthPageHeader } from "@/components/AuthPageHeader";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <AuthPageHeader
          title="Welcome back"
          subtitle="Sign in to your account to continue"
        />

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
