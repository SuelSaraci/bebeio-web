import { Link } from "react-router-dom";
import {
  Baby,
  Brain,
  Heart,
  Moon,
  Sparkles,
  TrendingUp,
  Apple,
  Smartphone,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    icon: Heart,
    title: "Feeding & diapers",
    text: "Log breast, bottle, solids, and diaper changes in seconds.",
  },
  {
    icon: Moon,
    title: "Sleep tracking",
    text: "Spot nap and night patterns with simple session logging.",
  },
  {
    icon: TrendingUp,
    title: "Growth & milestones",
    text: "Track measurements and celebrate developmental wins.",
  },
  {
    icon: Brain,
    title: "AI parenting assistant",
    text: "Get guidance tailored to your baby's age and daily logs.",
  },
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFF8F4] text-[#2C1810]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D95C74] text-white">
            <Baby size={18} />
          </div>
          Bebio
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/upgrade"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-[#9B7B72] hover:text-[#2C1810] sm:inline"
          >
            Pricing
          </Link>
          {user ? (
            <Link
              to="/upgrade"
              className="rounded-full bg-[#D95C74] px-4 py-2 text-sm font-semibold text-white"
            >
              Manage Plus
            </Link>
          ) : (
            <Link
              to="/upgrade"
              className="rounded-full bg-[#D95C74] px-4 py-2 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF0EC] px-3 py-1 text-sm font-medium text-[#D95C74]">
              <Sparkles size={14} />
              Mobile-first baby care
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Calmer days with smarter baby tracking
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#9B7B72]">
              Bebio helps you track feeding, sleep, growth, and health — with an
              AI assistant that understands your baby's real data. Download the
              app on iOS or Android, then upgrade to Plus on the web.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#download"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#D95C74] px-5 py-3 text-sm font-semibold text-white"
              >
                <Smartphone size={16} />
                Get the mobile app
              </a>
              <Link
                to="/upgrade"
                className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(44,24,16,0.09)] bg-white px-5 py-3 text-sm font-semibold"
              >
                View Bebio Plus
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-[#D95C74] to-[#E11D48] p-8 text-white shadow-xl">
            <p className="text-sm uppercase tracking-wide text-white/80">
              Bebio Plus
            </p>
            <h2 className="mt-2 text-3xl font-bold">Unlimited care tools</h2>
            <ul className="mt-6 space-y-3 text-sm text-white/95">
              <li>Unlimited AI parenting assistant</li>
              <li>Unlimited logs across every feature</li>
              <li>Health reports and smart reminders</li>
              <li>Same account on iPhone and Android</li>
            </ul>
            <p className="mt-8 text-sm text-white/80">
              Subscribe on the web. Premium unlocks automatically in the app
              when you sign in with the same account.
            </p>
          </div>
        </section>

        <section className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-[rgba(44,24,16,0.09)] bg-white p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0EC] text-[#D95C74]">
                <feature.icon size={20} />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#9B7B72]">
                {feature.text}
              </p>
            </div>
          ))}
        </section>

        <section
          id="download"
          className="mt-20 rounded-[32px] border border-[rgba(44,24,16,0.09)] bg-white p-8 text-center"
        >
          <h2 className="text-2xl font-bold">Download Bebio</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#9B7B72]">
            Bebio is a native mobile app. Install it on your phone, create an
            account, and start tracking for free. Upgrade to Plus anytime on this
            website with the same login.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#2C1810] px-5 py-3 text-sm font-semibold text-white">
              <Apple size={16} />
              App Store — coming soon
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#2C1810] px-5 py-3 text-sm font-semibold text-white">
              <Smartphone size={16} />
              Google Play — coming soon
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(44,24,16,0.09)] py-8 text-center text-sm text-[#9B7B72]">
        <div className="flex justify-center gap-4">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/upgrade">Pricing</Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} Bebio</p>
      </footer>
    </div>
  );
}
