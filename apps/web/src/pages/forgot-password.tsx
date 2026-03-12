import { AuthPageHeader } from "@/components/AuthPageHeader";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <AuthPageHeader
          title="Reset your password"
          subtitle="We'll help you get back into your account"
        />

        {/* Forgot Password Form */}
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
