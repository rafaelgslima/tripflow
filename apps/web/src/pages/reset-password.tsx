import { AuthPageHeader } from "@/components/AuthPageHeader";
import { ResetPasswordForm } from "@/components/Form/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <AuthPageHeader
          title="Reset your password"
          subtitle="Create a new secure password for your account"
        />

        {/* Reset Password Form */}
        <ResetPasswordForm />
      </div>
    </div>
  );
}
