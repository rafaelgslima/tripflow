import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdCalendarToday, MdPeople, MdEdit } from "react-icons/md";
import { supabase } from "@/lib/supabase";
import { HeaderPreLogin } from "@/components/Header/HeaderPreLogin";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Image from "next/image";

/* ── Icons ────────────────────────────────────────────────────────────── */
function CalendarIcon() {
  return <MdCalendarToday size={22} />;
}

function UsersIcon() {
  return <MdPeople size={22} />;
}

function EditIcon() {
  return <MdEdit size={22} />;
}

/* ── Feature card ─────────────────────────────────────────────────────── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  featured?: boolean;
}

function FeatureCard({ icon, title, description, featured }: FeatureCardProps) {
  return (
    <div
      className={`${featured ? "bg-tf-bg-3 border-tf-border-amber" : "bg-tf-bg-2 border-tf-border"} border rounded-[16px] p-7 transition-colors duration-200`}
    >
      <div
        className={`inline-flex items-center justify-center w-[44px] h-[44px] rounded-xl mb-5 border ${featured ? "bg-tf-amber-soft text-tf-amber border-tf-border-amber" : "bg-[rgba(255,255,255,0.05)] text-tf-muted border-tf-border"}`}
      >
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold text-tf-text mb-[10px] font-outfit tracking-[-0.01em]">
        {title}
      </h3>
      <p
        className="text-sm font-outfit text-tf-muted leading-[1.65]"
      >
        {description}
      </p>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  useScrollAnimation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        void router.replace("/home");
      } else {
        setIsChecking(false);
      }
    });
  }, [router]);

  if (isChecking) {
    return <div className="min-h-screen bg-tf-bg" />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-tf-bg text-tf-text">
      {/* Film grain */}
      <div className="grain" aria-hidden="true" />

      {/* Ambient glow — top center */}
      <div
        aria-hidden="true"
        className="fixed pointer-events-none z-0"
        style={{
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(900px, 100vw)",
          height: "500px",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(232,162,58,0.07) 0%, transparent 60%)",
        }}
      />

      <HeaderPreLogin />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="relative z-[1] pt-[10px]">
        <section>
          <div className="max-w-[1200px] mx-auto hero-grid">
            {/* Left: copy */}
            <div>
              {/* Eyebrow pill */}
              <div className="animate-slide-up inline-flex items-center gap-2 py-1.5 px-[14px] rounded-full border border-tf-border-amber bg-tf-amber-soft text-xs font-semibold text-tf-amber font-outfit tracking-[0.04em] uppercase mb-7">
                <span aria-hidden="true">✦</span>
                Collaborative travel planning
              </div>

              {/* Headline */}
              <h1
                className="animate-slide-up font-outfit font-normal leading-[1.04] tracking-[-0.025em] text-tf-text mb-6"
                style={{
                  fontSize: "clamp(52px, 6.5vw, 86px)",
                  animationDelay: "0.08s",
                }}
              >
                Plan trips
                <br />
                that feel like
                <br />
                <em className="text-tf-amber italic">adventures.</em>
              </h1>

              {/* Subtext */}
              <p
                className="animate-slide-up text-[17px] text-tf-muted max-w-[440px] mb-10 font-outfit leading-[1.7]"
                style={{ animationDelay: "0.18s" }}
              >
                Create day-by-day itineraries, invite your travel crew, and
                coordinate every detail together — from anywhere.
              </p>

              {/* CTA row */}
              <div
                className="animate-slide-up flex items-center gap-[14px] flex-wrap"
                style={{ animationDelay: "0.28s" }}
              >
                <Link
                  href="/signup"
                  className="py-[13px] px-[28px] text-[15px] font-semibold text-[#0E0B09] bg-tf-amber no-underline rounded-[10px] font-outfit tracking-[-0.01em] shadow-[0_4px_24px_rgba(232,162,58,0.3)] inline-block"
                >
                  Start for free
                </Link>
                <Link
                  href="#features"
                  className="py-[13px] px-6 text-[15px] font-medium text-tf-muted no-underline rounded-[10px] border border-tf-border font-outfit inline-block"
                >
                  See how it works →
                </Link>
              </div>
            </div>

            {/* Right: Plan image */}
            <div className="hidden md:block animate-float relative rounded-[24px] overflow-hidden border border-tf-border shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
              <Image
                src="/travel-plan-desktop.png"
                alt="TripFlow travel plan interface"
                width={1200}
                height={675}
                className="w-full h-auto block"
                priority
              />
            </div>
            <div className="md:hidden animate-float relative rounded-[20px] overflow-hidden border border-tf-border shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
              <Image
                src="/travel-plan-mobile.png"
                alt="TripFlow travel plan interface on mobile"
                width={360}
                height={640}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
        </section>

        {/* ── Simplicity Promise ────────────────────────────────────────── */}
        <section
          className="py-[80px] border-t border-tf-border"
          data-scroll-section
        >
          <div className="max-w-[640px] mx-auto px-6 text-center">
            {/* Eyebrow */}
            <div
              className="text-[11px] font-bold tracking-[0.14em] uppercase text-tf-amber font-outfit mb-4"
              data-scroll-animate
            >
              Seriously simple
            </div>

            {/* Headline */}
            <h2
              className="font-outfit font-normal leading-[1.08] tracking-[-0.025em] text-tf-text mb-5"
              style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
              data-scroll-animate
            >
              Just your name
              <br />
              <em className="text-tf-amber">and email.</em>
            </h2>

            {/* Body text */}
            <p
              className="text-[16px] text-tf-muted mb-8 font-outfit leading-[1.7]"
              data-scroll-animate
            >
              No endless forms. No unnecessary data collection. In 30 seconds,
              you&apos;re planning your next adventure. That&apos;s it.
            </p>

            {/* Bullet points */}
            <div
              className="space-y-4 inline-block text-left"
              data-scroll-animate
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(232,162,58,0.15)",
                    color: "#E8A23A",
                  }}
                >
                  <span className="text-xs font-bold">✓</span>
                </div>
                <p className="text-[14px] text-tf-muted font-outfit leading-relaxed">
                  <strong className="text-tf-text">Privacy first.</strong> Your
                  data is yours.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(232,162,58,0.15)",
                    color: "#E8A23A",
                  }}
                >
                  <span className="text-xs font-bold">✓</span>
                </div>
                <p className="text-[14px] text-tf-muted font-outfit leading-relaxed">
                  <strong className="text-tf-text">Always free.</strong> No
                  credit card required. Plan unlimited trips.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section
          id="features"
          className="border-t border-tf-border py-[80px]"
          data-scroll-section
        >
          <div className="max-w-[1200px] mx-auto px-6">
            {/* Section label */}
            <div className="text-center mb-[56px]" data-scroll-animate>
              <div
                className="text-[11px] font-bold tracking-[0.14em] uppercase text-tf-amber font-outfit mb-4"
                data-scroll-animate
              >
                Everything you need
              </div>
              <h2
                className="font-outfit font-normal leading-[1.1] tracking-[-0.025em] text-tf-text"
                style={{ fontSize: "clamp(36px, 4vw, 54px)" }}
                data-scroll-animate
              >
                Built for the way
                <br />
                <em className="text-tf-amber">you actually travel.</em>
              </h2>
            </div>

            {/* Cards */}
            <div className="features-grid">
              <div data-scroll-animate>
                <FeatureCard
                  icon={<CalendarIcon />}
                  title="Day-by-day itineraries"
                  description="Organize every trip with detailed daily schedules. Add activities, meals, and sights with specific times to keep everyone on track."
                />
              </div>
              <div data-scroll-animate>
                <FeatureCard
                  icon={<UsersIcon />}
                  title="Invite your crew"
                  description="Share plans with friends and family in seconds. Send an email invite and they're in — collaborating on the itinerary instantly."
                  featured
                />
              </div>
              <div data-scroll-animate>
                <FeatureCard
                  icon={<EditIcon />}
                  title="Edit together, anytime"
                  description="Every collaborator can add ideas, rearrange activities, and keep the itinerary in sync — whether you're in the same room or across the world."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section
          className="py-[80px] border-t border-tf-border"
          data-scroll-section
        >
          <div className="max-w-[640px] mx-auto px-6 text-center">
            {/* Decorative line */}
            <div
              className="w-px  mx-auto"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--tf-border-amber))",
              }}
              data-scroll-animate
            />
            <h2
              className="font-outfit font-normal leading-[1.05] tracking-[-0.025em] text-tf-text mb-[18px]"
              style={{ fontSize: "clamp(40px, 5vw, 66px)" }}
              data-scroll-animate
            >
              Ready for your next
              <br />
              <em className="text-tf-amber">adventure?</em>
            </h2>
            <p
              className="text-[16px] text-tf-muted mb-9 font-outfit leading-[1.65]"
              data-scroll-animate
            >
              Create your first trip in under a minute.
              <br />
              Free, forever.
            </p>
            <Link
              href="/signup"
              className="py-[15px] px-10 text-[15px] font-semibold text-[#0E0B09] bg-tf-amber no-underline rounded-[10px] font-outfit tracking-[-0.01em] shadow-[0_4px_32px_rgba(232,162,58,0.28)] inline-block"
              data-scroll-animate
            >
              Create your first trip →
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-tf-border py-7 px-6 text-center">
        <p className="text-[13px] text-tf-muted font-outfit">
          © {new Date().getFullYear()} TripFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
