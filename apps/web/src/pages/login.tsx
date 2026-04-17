import { AuthPageHeader } from "@/components/AuthPageHeader";
import { LoginForm } from "@/components/Form/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-tf-bg flex flex-col items-center justify-center p-6 relative">
      <div className="grain" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="fixed pointer-events-none"
        style={{
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          maxWidth: "100vw",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(232,162,58,0.06) 0%, transparent 65%)",
        }}
      />
      <div className="w-full max-w-[440px] bg-tf-card border border-tf-border rounded-[20px] p-10 relative z-[1] shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
        <AuthPageHeader
          title="Welcome back"
          subtitle="Sign in to your account to continue"
        />
        <LoginForm />
      </div>
    </div>
  );
}
