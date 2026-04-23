import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdCalendarToday, MdPeople, MdEdit } from "react-icons/md";
import { supabase } from "@/lib/supabase";
import { HeaderPreLogin } from "@/components/Header/HeaderPreLogin";

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

/* ── App mockup ───────────────────────────────────────────────────────── */
interface MockItemProps {
  time: string;
  text: string;
  active?: boolean;
}

function MockItem({ time, text, active }: MockItemProps) {
  return (
    <div
      className={`flex items-center gap-[10px] py-[7px] px-2.5 rounded-lg transition-colors duration-150 border ${active ? "bg-tf-amber-soft border-tf-border-amber" : "bg-transparent border-transparent"}`}
    >
      <span className="text-[11px] font-semibold text-tf-amber font-outfit tracking-[0.02em] w-[36px] shrink-0">
        {time}
      </span>
      <span
        className={`text-xs font-outfit ${active ? "text-tf-text" : "text-tf-muted"}`}
      >
        {text}
      </span>
    </div>
  );
}

function AppMockup() {
  return (
    <div className="mockup-wrap relative py-5 pb-10">
      {/* Ambient glow behind card */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none z-0"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "380px",
          maxWidth: "100vw",
          height: "380px",
          background:
            "radial-gradient(ellipse at center, rgba(232,162,58,0.18) 0%, transparent 65%)",
        }}
      />

      {/* Main itinerary card */}
      <div
        className="animate-float relative z-[1] bg-tf-card rounded-[20px] p-6 max-w-[340px] ml-auto"
        style={{
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.3)",
        }}
      >
        {/* Card header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[15px] font-semibold text-tf-text font-outfit tracking-[-0.01em]">
              Paris Trip
            </div>
            <div className="text-xs text-tf-muted mt-[2px] font-outfit">
              Mar 15 – Mar 22 · 2026
            </div>
          </div>
          {/* Collaborator avatars */}
          <div className="flex ml-2">
            {["#F59E0B", "#60A5FA", "#34D399"].map((color, i) => (
              <div
                key={i}
                className="w-[28px] h-[28px] rounded-full shrink-0"
                style={{
                  background: color,
                  marginLeft: i > 0 ? "-8px" : "0",
                  border: "2px solid var(--tf-bg-card)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Day 1 */}
        <div className="mb-4">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-tf-amber font-outfit mb-2 pl-[10px]">
            Day 1 — Mar 15
          </div>
          <MockItem time="09:00" text="Eiffel Tower visit" />
          <MockItem time="12:30" text="Lunch at Le Marais" />
          <MockItem time="15:00" text="Louvre Museum" active />
        </div>

        {/* Divider */}
        <div className="h-px bg-tf-border my-4" />

        {/* Day 2 */}
        <div className="mb-4">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-tf-amber font-outfit mb-2 pl-[10px]">
            Day 2 — Mar 16
          </div>
          <MockItem time="10:00" text="Montmartre walk" />
          <MockItem time="14:00" text="Seine River cruise" />
        </div>

        {/* Add button */}
        <button
          className="w-full py-[9px] rounded-[10px] text-tf-muted text-xs font-medium font-outfit cursor-default tracking-[0.01em]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          + Add activity
        </button>
      </div>

      {/* Floating collaboration notice */}
      <div className="animate-float-sub absolute bottom-[10px] left-0 z-[2] bg-tf-bg-3 border border-tf-border-amber rounded-xl py-2.5 px-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center gap-[10px] min-w-[220px]">
        <div
          className="w-[8px] h-[8px] rounded-full bg-green-400 shrink-0"
          style={{ boxShadow: "0 0 8px rgba(74,222,128,0.5)" }}
        />
        <div>
          <div className="text-xs text-tf-text font-outfit font-medium">
            Sofia joined the trip
          </div>
          <div className="text-[11px] text-tf-muted font-outfit">
            2 minutes ago
          </div>
        </div>
      </div>

      {/* Floating date badge */}
      <div className="absolute top-[8px] right-0 z-[2] bg-tf-amber rounded-[10px] py-2 px-3.5 shadow-[0_4px_16px_rgba(232,162,58,0.35)] flex flex-col items-center">
        <div
          className="text-[10px] font-bold tracking-[0.08em] uppercase font-outfit"
          style={{ color: "rgba(13,11,10,0.65)" }}
        >
          Mar
        </div>
        <div className="text-[24px] font-bold leading-none text-[#0E0B09] font-outfit">
          15
        </div>
      </div>
    </div>
  );
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
        className="text-sm font-outfit text-tf-muted"
        style={{ lineHeight: 1.65 }}
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
          width: "900px",
          maxWidth: "100vw",
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
                className="animate-slide-up font-cormorant font-light leading-[1.04] tracking-[-0.025em] text-tf-text mb-6"
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
                className="animate-slide-up text-[17px] text-tf-muted max-w-[440px] mb-10 font-outfit"
                style={{ lineHeight: 1.7, animationDelay: "0.18s" }}
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

              {/* Social proof */}
              <div
                className="animate-slide-up flex items-center gap-3 mt-[44px]"
                style={{ animationDelay: "0.38s" }}
              >
                <div className="flex items-center">
                  {["#F59E0B", "#60A5FA", "#34D399", "#F472B6"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="w-[28px] h-[28px] rounded-full shrink-0"
                        style={{
                          background: color,
                          marginLeft: i > 0 ? "-8px" : "0",
                          border: "2px solid var(--tf-bg)",
                        }}
                      />
                    ),
                  )}
                </div>
                <span className="text-[13px] text-tf-muted font-outfit">
                  Join{" "}
                  <strong className="text-tf-text font-semibold">2,400+</strong>{" "}
                  travelers planning their next adventure
                </span>
              </div>
            </div>

            {/* Right: App mockup */}
            <AppMockup />
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section id="features" className="border-t border-tf-border py-[80px]">
          <div className="max-w-[1200px] mx-auto px-6">
            {/* Section label */}
            <div className="text-center mb-[56px]">
              <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-tf-amber font-outfit mb-4">
                Everything you need
              </div>
              <h2
                className="font-cormorant font-light leading-[1.1] tracking-[-0.025em] text-tf-text"
                style={{ fontSize: "clamp(36px, 4vw, 54px)" }}
              >
                Built for the way
                <br />
                <em className="text-tf-amber">you actually travel.</em>
              </h2>
            </div>

            {/* Cards */}
            <div className="features-grid">
              <FeatureCard
                icon={<CalendarIcon />}
                title="Day-by-day itineraries"
                description="Organize every trip with detailed daily schedules. Add activities, meals, and sights with specific times to keep everyone on track."
              />
              <FeatureCard
                icon={<UsersIcon />}
                title="Invite your crew"
                description="Share plans with friends and family in seconds. Send an email invite and they're in — collaborating on the itinerary instantly."
                featured
              />
              <FeatureCard
                icon={<EditIcon />}
                title="Edit together, anytime"
                description="Every collaborator can add ideas, rearrange activities, and keep the itinerary in sync — whether you're in the same room or across the world."
              />
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-[80px] pb-[100px]">
          <div className="max-w-[640px] mx-auto px-6 text-center">
            {/* Decorative line */}
            <div
              className="w-px h-[64px] mx-auto mb-10"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, var(--tf-border-amber))",
              }}
            />
            <h2
              className="font-cormorant font-light leading-[1.05] tracking-[-0.025em] text-tf-text mb-[18px]"
              style={{ fontSize: "clamp(40px, 5vw, 66px)" }}
            >
              Ready for your next
              <br />
              <em className="text-tf-amber">adventure?</em>
            </h2>
            <p
              className="text-[16px] text-tf-muted mb-9 font-outfit"
              style={{ lineHeight: 1.65 }}
            >
              Create your first trip in under a minute.
              <br />
              Free, forever.
            </p>
            <Link
              href="/signup"
              className="py-[15px] px-10 text-[15px] font-semibold text-[#0E0B09] bg-tf-amber no-underline rounded-[10px] font-outfit tracking-[-0.01em] shadow-[0_4px_32px_rgba(232,162,58,0.28)] inline-block"
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
