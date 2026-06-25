import { useState, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  format,
  differenceInWeeks,
  parseISO,
  formatDistanceToNow,
} from "date-fns";
import {
  Baby,
  Moon,
  Droplets,
  Heart,
  Brain,
  Plus,
  Clock,
  TrendingUp,
  Send,
  Home,
  Shield,
  Star,
  Check,
  Sun,
  User,
  Calendar,
  AlertCircle,
  Activity,
  X,
  Trash2,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "login" | "signup" | "setup" | "app";
type Tab = "home" | "feeding" | "sleep" | "growth" | "health" | "ai";
type FeedingType = "breast" | "bottle" | "solid";
type SleepType = "night" | "nap";
type DiaperType = "wet" | "dirty" | "both";

interface BabyProfile {
  name: string;
  birthDate: string;
  gender: "girl" | "boy";
  birthWeight: number;
}

interface FeedingEntry {
  id: string;
  timestamp: string;
  type: FeedingType;
  side?: "left" | "right" | "both";
  duration?: number;
  amount?: number;
  notes?: string;
}

interface SleepEntry {
  id: string;
  start: string;
  end: string;
  type: SleepType;
  notes?: string;
}

interface DiaperEntry {
  id: string;
  timestamp: string;
  type: DiaperType;
}

interface GrowthEntry {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  headCirc?: number;
}

interface Vaccination {
  id: string;
  name: string;
  scheduledDate: string;
  done: boolean;
  completedDate?: string;
}

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
}

interface Milestone {
  id: string;
  title: string;
  expectedWeeks: string;
  done: boolean;
  achievedDate?: string;
}

interface MedicalNote {
  id: string;
  date: string;
  title: string;
  content: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 10);

const todayStr = () => format(new Date(), "yyyy-MM-dd");

const getBabyAge = (birthDate: string): string => {
  try {
    const weeks = differenceInWeeks(new Date(), parseISO(birthDate));
    if (weeks < 16) return `${weeks} week${weeks !== 1 ? "s" : ""} old`;
    const months = Math.floor(weeks / 4.33);
    if (months < 24) return `${months} month${months !== 1 ? "s" : ""} old`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? "s" : ""} old`;
  } catch {
    return "Newborn";
  }
};

const getBabyWeeks = (birthDate: string): number => {
  try {
    return differenceInWeeks(new Date(), parseISO(birthDate));
  } catch {
    return 0;
  }
};

const safeFormatTime = (isoStr: string) => {
  try {
    return format(parseISO(isoStr), "h:mm a");
  } catch {
    return isoStr;
  }
};

const calcDuration = (start: string, end: string): string => {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  if (diff <= 0) return "—";
  const h = Math.floor(diff / 60);
  const m = Math.round(diff % 60);
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const minsToHM = (mins: number): string => {
  if (mins <= 0) return "—";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const todayFeedings = (logs: FeedingEntry[]) =>
  logs.filter((f) => f.timestamp.startsWith(todayStr()));

const todayDiapers = (logs: DiaperEntry[]) =>
  logs.filter((d) => d.timestamp.startsWith(todayStr()));

const todaySleepMins = (logs: SleepEntry[]): number =>
  logs
    .filter(
      (s) => s.start.startsWith(todayStr()) || s.end.startsWith(todayStr()),
    )
    .reduce((acc, s) => {
      const diff =
        (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000;
      return acc + Math.max(0, diff);
    }, 0);

// ─── Default demo data ────────────────────────────────────────────────────────

const makeDefaultFeedings = (): FeedingEntry[] => {
  const t = todayStr();
  return [
    {
      id: genId(),
      timestamp: `${t}T07:12:00`,
      type: "breast",
      side: "left",
      duration: 18,
    },
    {
      id: genId(),
      timestamp: `${t}T09:45:00`,
      type: "breast",
      side: "right",
      duration: 22,
    },
    { id: genId(), timestamp: `${t}T12:30:00`, type: "bottle", amount: 120 },
    {
      id: genId(),
      timestamp: `${t}T15:15:00`,
      type: "breast",
      side: "left",
      duration: 15,
    },
    {
      id: genId(),
      timestamp: `${t}T17:50:00`,
      type: "breast",
      side: "right",
      duration: 20,
    },
    { id: genId(), timestamp: `${t}T20:20:00`, type: "bottle", amount: 90 },
  ];
};

const makeDefaultSleep = (): SleepEntry[] => {
  const t = todayStr();
  return [
    { id: genId(), start: `${t}T09:15:00`, end: `${t}T10:45:00`, type: "nap" },
    { id: genId(), start: `${t}T14:00:00`, end: `${t}T15:30:00`, type: "nap" },
  ];
};

const makeDefaultDiapers = (): DiaperEntry[] => {
  const t = todayStr();
  return [
    { id: genId(), timestamp: `${t}T07:30:00`, type: "wet" },
    { id: genId(), timestamp: `${t}T09:00:00`, type: "dirty" },
    { id: genId(), timestamp: `${t}T12:00:00`, type: "wet" },
    { id: genId(), timestamp: `${t}T14:30:00`, type: "both" },
  ];
};

const makeDefaultGrowth = (birthDate: string): GrowthEntry[] => {
  try {
    const bd = parseISO(birthDate);
    const entries: GrowthEntry[] = [];
    const weeksNow = differenceInWeeks(new Date(), bd);
    const step = Math.max(2, Math.floor(weeksNow / 7));
    for (let w = 0; w <= weeksNow; w += step) {
      const d = new Date(bd);
      d.setDate(d.getDate() + w * 7);
      if (d <= new Date()) {
        entries.push({
          id: genId(),
          date: format(d, "yyyy-MM-dd"),
          weight: parseFloat((3.2 + w * 0.19).toFixed(1)),
          height: parseFloat((50 + w * 0.75).toFixed(1)),
          headCirc: parseFloat((35 + w * 0.35).toFixed(1)),
        });
      }
    }
    return entries;
  } catch {
    return [];
  }
};

const makeDefaultVaccinations = (birthDate: string): Vaccination[] => {
  try {
    const bd = parseISO(birthDate);
    const at2m = new Date(bd);
    at2m.setMonth(at2m.getMonth() + 2);
    const at4m = new Date(bd);
    at4m.setMonth(at4m.getMonth() + 4);
    const at6m = new Date(bd);
    at6m.setMonth(at6m.getMonth() + 6);
    const at12m = new Date(bd);
    at12m.setMonth(at12m.getMonth() + 12);
    const at18m = new Date(bd);
    at18m.setMonth(at18m.getMonth() + 18);
    const w = differenceInWeeks(new Date(), bd);
    return [
      {
        id: genId(),
        name: "Hepatitis B (Birth dose)",
        scheduledDate: format(bd, "yyyy-MM-dd"),
        done: true,
        completedDate: format(bd, "yyyy-MM-dd"),
      },
      {
        id: genId(),
        name: "2-Month Vaccines (DTaP, Hib, PCV, IPV, RV)",
        scheduledDate: format(at2m, "yyyy-MM-dd"),
        done: w >= 10,
        completedDate: w >= 10 ? format(at2m, "yyyy-MM-dd") : undefined,
      },
      {
        id: genId(),
        name: "4-Month Vaccines (DTaP, Hib, PCV, IPV, RV)",
        scheduledDate: format(at4m, "yyyy-MM-dd"),
        done: w >= 18,
        completedDate: w >= 18 ? format(at4m, "yyyy-MM-dd") : undefined,
      },
      {
        id: genId(),
        name: "6-Month Vaccines (DTaP, Hib, PCV, IPV, HepB, Flu)",
        scheduledDate: format(at6m, "yyyy-MM-dd"),
        done: w >= 26,
      },
      {
        id: genId(),
        name: "12-Month Vaccines (MMR, Varicella, HepA)",
        scheduledDate: format(at12m, "yyyy-MM-dd"),
        done: w >= 52,
      },
      {
        id: genId(),
        name: "18-Month Vaccines (DTaP booster, HepA 2nd)",
        scheduledDate: format(at18m, "yyyy-MM-dd"),
        done: w >= 78,
      },
    ];
  } catch {
    return [];
  }
};

const makeDefaultMilestones = (): Milestone[] => [
  {
    id: genId(),
    title: "Social Smile",
    expectedWeeks: "6–8 wks",
    done: true,
    achievedDate: "Mar 15",
  },
  {
    id: genId(),
    title: "Tracks Moving Objects",
    expectedWeeks: "8–10 wks",
    done: true,
    achievedDate: "Mar 28",
  },
  {
    id: genId(),
    title: "Holds Head Steady",
    expectedWeeks: "12 wks",
    done: true,
    achievedDate: "Apr 5",
  },
  {
    id: genId(),
    title: "Laughs Out Loud",
    expectedWeeks: "~16–17 wks",
    done: false,
  },
  {
    id: genId(),
    title: "Rolls Front to Back",
    expectedWeeks: "~18–20 wks",
    done: false,
  },
  {
    id: genId(),
    title: "Reaches for Objects",
    expectedWeeks: "~20 wks",
    done: false,
  },
  {
    id: genId(),
    title: "Sits with Support",
    expectedWeeks: "~24 wks",
    done: false,
  },
  {
    id: genId(),
    title: "First Solid Foods",
    expectedWeeks: "~24–26 wks",
    done: false,
  },
];

const makeDefaultAppointments = (birthDate: string): Appointment[] => {
  try {
    const bd = parseISO(birthDate);
    const at4m = new Date(bd);
    at4m.setMonth(at4m.getMonth() + 4);
    const at6m = new Date(bd);
    at6m.setMonth(at6m.getMonth() + 6);
    return [
      {
        id: genId(),
        doctor: "Dr. Sarah Miller",
        specialty: "Pediatrician",
        date: format(at4m, "yyyy-MM-dd"),
        time: "10:30",
        type: "4-Month Checkup",
      },
      {
        id: genId(),
        doctor: "Dr. Sarah Miller",
        specialty: "Pediatrician",
        date: format(at6m, "yyyy-MM-dd"),
        time: "09:00",
        type: "6-Month Checkup",
      },
    ];
  } catch {
    return [];
  }
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-display text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FL({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5">
      {children}
    </label>
  );
}

function TI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
    />
  );
}

function PBtn({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button
      {...props}
      className={`w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
        {icon}
      </div>
      <p className="font-bold text-foreground text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function ConfirmDeleteModal({
  message,
  onConfirm,
  onClose,
}: {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground font-display mb-1">
              Delete this entry?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  iconClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  iconClass?: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground font-display leading-none">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-colors ${value === o.value ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Auth: Login ──────────────────────────────────────────────────────────────

function LoginScreen({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  const [email, setEmail] = useState("sarah@example.com");
  const [password, setPassword] = useState("••••••••");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    onLogin();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Baby size={30} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to continue tracking
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <FL>Email</FL>
            <TI
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <FL>Password</FL>
            <div className="relative">
              <TI
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <PBtn type="submit">Sign In</PBtn>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New to Bebio?{" "}
          <button
            onClick={onSignup}
            className="text-primary font-bold hover:underline"
          >
            Create account
          </button>
        </p>

        <div className="mt-8 bg-secondary/60 border border-border rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Demo mode — any credentials work
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Auth: Signup ─────────────────────────────────────────────────────────────

function SignupScreen({
  onSignup,
  onLogin,
}: {
  onSignup: () => void;
  onLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    onSignup();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Baby size={30} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Start tracking your baby's journey
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <FL>Your Name</FL>
            <TI
              placeholder="Sarah Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <FL>Email</FL>
            <TI
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <FL>Password</FL>
            <div className="relative">
              <TI
                type={showPw ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <PBtn type="submit">Create Account</PBtn>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            onClick={onLogin}
            className="text-primary font-bold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Auth: Baby Setup ─────────────────────────────────────────────────────────

function BabySetupScreen({
  onComplete,
}: {
  onComplete: (b: BabyProfile) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<BabyProfile["gender"]>("girl");
  const [birthDate, setBirthDate] = useState("");
  const [birthWeight, setBirthWeight] = useState("3.3");
  const [error, setError] = useState("");

  const goStep2 = () => {
    if (!name.trim()) {
      setError("Please enter your baby's name.");
      return;
    }
    setError("");
    setStep(2);
  };

  const finish = () => {
    if (!birthDate) {
      setError("Please enter the birth date.");
      return;
    }
    const w = Number(birthWeight);
    if (!w || w < 0.5 || w > 6) {
      setError("Please enter a valid birth weight (0.5–6 kg).");
      return;
    }
    onComplete({ name: name.trim(), gender, birthDate, birthWeight: w });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-foreground mb-1">
                Tell us about your baby
              </h2>
              <p className="text-sm text-muted-foreground">
                We'll personalize Bebio just for you.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <FL>Baby's Name</FL>
                <TI
                  placeholder="e.g. Emma, Noah, Lily…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goStep2()}
                />
              </div>
              <div>
                <FL>Gender</FL>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["girl", "👧 Girl"],
                      ["boy", "👦 Boy"],
                    ] as const
                  ).map(([g, label]) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl border text-sm font-bold transition-colors ${gender === g ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
            <PBtn onClick={goStep2}>Continue →</PBtn>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <h2 className="text-2xl font-bold font-display text-foreground mb-1">
                When was {name} born?
              </h2>
              <p className="text-sm text-muted-foreground">
                This helps us calculate age, milestones, and vaccines.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <FL>Date of Birth</FL>
                <TI
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div>
                <FL>Birth Weight (kg)</FL>
                <TI
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="6"
                  placeholder="e.g. 3.3"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
            <PBtn onClick={finish}>Start tracking {name} 🎉</PBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────

function HomeTab({
  baby,
  feedings,
  sleepEntries,
  diapers,
  setDiapers,
  growth,
  vaccinations,
  setTab,
}: {
  baby: BabyProfile;
  feedings: FeedingEntry[];
  sleepEntries: SleepEntry[];
  diapers: DiaperEntry[];
  setDiapers: React.Dispatch<React.SetStateAction<DiaperEntry[]>>;
  growth: GrowthEntry[];
  vaccinations: Vaccination[];
  setTab: (t: Tab) => void;
}) {
  const [showDiaper, setShowDiaper] = useState(false);
  const [diaperType, setDiaperType] = useState<DiaperType>("wet");
  const [diaperTime, setDiaperTime] = useState(format(new Date(), "HH:mm"));

  const todayFeed = todayFeedings(feedings);
  const todayDiap = todayDiapers(diapers);
  const sleepMins = todaySleepMins(sleepEntries);
  const lastFeed = [...feedings].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  )[0];
  const latestGrowth = [...growth].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];
  const nextVax = vaccinations.find((v) => !v.done);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const allToday = (
    [
      ...todayFeed,
      ...sleepEntries.filter((s) => s.start.startsWith(todayStr())),
      ...todayDiap,
    ] as any[]
  )
    .sort((a, b) => {
      const ts = (x: any) => x.timestamp || x.start;
      return ts(b).localeCompare(ts(a));
    })
    .slice(0, 6);

  const logDiaper = () => {
    const [h, m] = diaperTime.split(":").map(Number);
    const ts = new Date();
    ts.setHours(h, m, 0, 0);
    setDiapers((p) => [
      { id: genId(), timestamp: ts.toISOString(), type: diaperType },
      ...p,
    ]);
    setShowDiaper(false);
  };

  const activityIcon = (item: any): string => {
    if (item.start) return "😴";
    if (item.type === "wet") return "💧";
    if (item.type === "dirty") return "💩";
    if (item.type === "both") return "🔄";
    if (item.type === "breast") return "🤱";
    if (item.type === "bottle") return "🍼";
    if (item.type === "solid") return "🥣";
    return "📋";
  };

  const activityLabel = (item: any): string => {
    if (item.start) return item.type === "night" ? "Night sleep" : "Nap";
    if (item.type === "wet" || item.type === "dirty" || item.type === "both")
      return "Diaper change";
    if (item.type === "breast") return "Breastfeed";
    if (item.type === "bottle") return "Bottle";
    if (item.type === "solid") return "Solid food";
    return "Entry";
  };

  const activityDetail = (item: any): string => {
    if (item.start) return calcDuration(item.start, item.end);
    if (item.type === "wet") return "Wet";
    if (item.type === "dirty") return "Dirty";
    if (item.type === "both") return "Wet & dirty";
    if (item.type === "breast")
      return `${item.side || ""} · ${item.duration ?? "?"}m`.trim();
    if (item.type === "bottle") return `${item.amount ?? "?"}ml`;
    return "";
  };

  const activityTime = (item: any): string =>
    safeFormatTime(item.timestamp || item.start);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-primary">
        <img
          src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=260&fit=crop&auto=format"
          alt="Baby sleeping peacefully"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative p-6 pb-7">
          <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-2">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="text-[1.6rem] font-bold text-white font-display leading-tight mb-1">
            {greeting} 👋
          </h1>
          <p className="text-white/80 text-sm mb-4">
            {baby.name} is {getBabyAge(baby.birthDate)} — you're doing great!
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
              {lastFeed
                ? `Fed ${formatDistanceToNow(parseISO(lastFeed.timestamp), { addSuffix: true })}`
                : "No feedings logged"}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
              {todayDiap.length} diapers today
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Moon size={16} />}
          label="Sleep"
          value={minsToHM(sleepMins)}
          sub="Today's total"
          iconClass="bg-violet-100 text-violet-500"
        />
        <StatCard
          icon={<Droplets size={16} />}
          label="Feedings"
          value={`${todayFeed.length}×`}
          sub={
            lastFeed
              ? `Last ${formatDistanceToNow(parseISO(lastFeed.timestamp), { addSuffix: true })}`
              : "None today"
          }
          iconClass="bg-rose-100 text-rose-500"
        />
        <StatCard
          icon={<Baby size={16} />}
          label="Diapers"
          value={String(todayDiap.length)}
          sub="Today"
          iconClass="bg-amber-100 text-amber-500"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Weight"
          value={latestGrowth?.weight ? `${latestGrowth.weight} kg` : "—"}
          sub="Latest measurement"
          iconClass="bg-teal-100 text-teal-500"
        />
      </div>

      {/* Quick log */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Quick Log
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Feed",
              icon: <Droplets size={18} />,
              action: () => setTab("feeding"),
              cls: "bg-rose-100 text-rose-600",
            },
            {
              label: "Sleep",
              icon: <Moon size={18} />,
              action: () => setTab("sleep"),
              cls: "bg-violet-100 text-violet-600",
            },
            {
              label: "Diaper",
              icon: <Baby size={18} />,
              action: () => {
                setDiaperTime(format(new Date(), "HH:mm"));
                setShowDiaper(true);
              },
              cls: "bg-amber-100 text-amber-600",
            },
            {
              label: "Ask AI",
              icon: <Brain size={18} />,
              action: () => setTab("ai"),
              cls: "bg-blue-100 text-blue-600",
            },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl py-4 px-2 hover:border-primary/30 hover:bg-secondary/60 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.cls}`}
              >
                {a.icon}
              </div>
              <span className="text-[11px] font-bold text-foreground">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Vaccination alert */}
      {nextVax && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-900 truncate">
              {nextVax.name}
            </p>
            <p className="text-xs text-rose-700">
              {format(parseISO(nextVax.scheduledDate), "MMM d, yyyy")}
            </p>
          </div>
          <button
            onClick={() => setTab("health")}
            className="text-xs text-rose-600 font-bold hover:underline flex-shrink-0"
          >
            View →
          </button>
        </div>
      )}

      {/* Activity feed */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Today's Activity
        </p>
        {allToday.length === 0 ? (
          <EmptyState
            icon={<Activity size={22} />}
            title="No activity yet"
            desc="Tap Quick Log above to start tracking today."
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {allToday.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-lg leading-none">
                  {activityIcon(item)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {activityLabel(item)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activityDetail(item)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {activityTime(item)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDiaper && (
        <Modal title="Log Diaper Change" onClose={() => setShowDiaper(false)}>
          <div className="space-y-4">
            <div>
              <FL>Type</FL>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["wet", "💧 Wet"],
                    ["dirty", "💩 Dirty"],
                    ["both", "🔄 Both"],
                  ] as const
                ).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setDiaperType(t)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-colors ${diaperType === t ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FL>Time</FL>
              <TI
                type="time"
                value={diaperTime}
                onChange={(e) => setDiaperTime(e.target.value)}
              />
            </div>
            <PBtn onClick={logDiaper}>Log Diaper Change</PBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Feeding Tab ──────────────────────────────────────────────────────────────

function FeedingTab({
  feedings,
  setFeedings,
}: {
  feedings: FeedingEntry[];
  setFeedings: React.Dispatch<React.SetStateAction<FeedingEntry[]>>;
}) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState<FeedingType>("breast");
  const [side, setSide] = useState<"left" | "right" | "both">("left");
  const [duration, setDuration] = useState("15");
  const [amount, setAmount] = useState("120");
  const [notes, setNotes] = useState("");
  const [timeStr, setTimeStr] = useState(format(new Date(), "HH:mm"));
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const todayF = todayFeedings(feedings).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
  const breastMins = todayF
    .filter((f) => f.type === "breast")
    .reduce((a, f) => a + (f.duration || 0), 0);
  const bottleMl = todayF
    .filter((f) => f.type === "bottle")
    .reduce((a, f) => a + (f.amount || 0), 0);

  const save = () => {
    const [h, m] = timeStr.split(":").map(Number);
    const ts = new Date();
    ts.setHours(h, m, 0, 0);
    setFeedings((p) => [
      {
        id: genId(),
        timestamp: ts.toISOString(),
        type,
        side: type === "breast" ? side : undefined,
        duration: type === "breast" ? Number(duration) || undefined : undefined,
        amount: type === "bottle" ? Number(amount) || undefined : undefined,
        notes: notes || undefined,
      },
      ...p,
    ]);
    setNotes("");
    setTimeStr(format(new Date(), "HH:mm"));
    setShow(false);
  };

  const del = (id: string) => setFeedings((p) => p.filter((f) => f.id !== id));

  const feedIcon = (t: FeedingType) =>
    t === "breast" ? "🤱" : t === "bottle" ? "🍼" : "🥣";
  const feedDetail = (f: FeedingEntry) => {
    if (f.type === "breast")
      return `${f.side ? f.side.charAt(0).toUpperCase() + f.side.slice(1) : ""} · ${f.duration ?? "?"}m`;
    if (f.type === "bottle") return `${f.amount ?? "?"}ml`;
    return "Solid food";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Feeding
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <button
          onClick={() => {
            setTimeStr(format(new Date(), "HH:mm"));
            setShow(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> Log
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold font-display text-foreground">
            {todayF.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Sessions</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-bold font-display text-foreground">
            {bottleMl > 0 ? `${bottleMl}ml` : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Bottle</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-bold font-display text-foreground">
            {breastMins > 0 ? minsToHM(breastMins) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Breast</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Today's Log
        </p>
        {todayF.length === 0 ? (
          <EmptyState
            icon={<Droplets size={22} />}
            title="No feedings yet"
            desc="Tap 'Log' to record today's first feeding."
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {todayF.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 px-4 py-3.5 group"
              >
                <span className="text-xl leading-none">{feedIcon(f.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground capitalize">
                    {f.type === "breast"
                      ? "Breastfeed"
                      : f.type === "bottle"
                        ? "Bottle"
                        : "Solid Food"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {feedDetail(f)}
                    {f.notes ? ` · ${f.notes}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {safeFormatTime(f.timestamp)}
                </span>
                <button
                  onClick={() => setConfirmId(f.id)}
                  className="ml-2 text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmId && (
        <ConfirmDeleteModal
          message="This feeding entry will be permanently removed from today's log."
          onConfirm={() => del(confirmId)}
          onClose={() => setConfirmId(null)}
        />
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Sun size={17} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-bold text-amber-900">Tip: </span>Newborns feed
          8–12 times/day. By 3–4 months, 5–7 times is typical.
        </p>
      </div>

      {show && (
        <Modal title="Log Feeding" onClose={() => setShow(false)}>
          <div className="space-y-4">
            <div>
              <FL>Type</FL>
              <ToggleGroup
                options={[
                  { value: "breast" as FeedingType, label: "🤱 Breast" },
                  { value: "bottle" as FeedingType, label: "🍼 Bottle" },
                  { value: "solid" as FeedingType, label: "🥣 Solid" },
                ]}
                value={type}
                onChange={setType}
              />
            </div>
            <div>
              <FL>Time</FL>
              <TI
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
              />
            </div>
            {type === "breast" && (
              <>
                <div>
                  <FL>Side</FL>
                  <ToggleGroup
                    options={[
                      { value: "left" as const, label: "Left" },
                      { value: "right" as const, label: "Right" },
                      { value: "both" as const, label: "Both" },
                    ]}
                    value={side}
                    onChange={setSide}
                  />
                </div>
                <div>
                  <FL>Duration (minutes)</FL>
                  <TI
                    type="number"
                    min="1"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </>
            )}
            {type === "bottle" && (
              <div>
                <FL>Amount (ml)</FL>
                <TI
                  type="number"
                  min="10"
                  max="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            )}
            <div>
              <FL>Notes (optional)</FL>
              <TI
                placeholder="e.g. seemed very hungry, fussy after…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <PBtn onClick={save}>Save Feeding</PBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Sleep Tab ────────────────────────────────────────────────────────────────

function SleepTab({
  sleepEntries,
  setSleepEntries,
}: {
  sleepEntries: SleepEntry[];
  setSleepEntries: React.Dispatch<React.SetStateAction<SleepEntry[]>>;
}) {
  const [show, setShow] = useState(false);
  const [sleepType, setSleepType] = useState<SleepType>("nap");
  const [startStr, setStartStr] = useState(
    format(new Date(Date.now() - 3600000), "HH:mm"),
  );
  const [endStr, setEndStr] = useState(format(new Date(), "HH:mm"));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const todaySleep = sleepEntries
    .filter(
      (s) => s.start.startsWith(todayStr()) || s.end.startsWith(todayStr()),
    )
    .sort((a, b) => b.start.localeCompare(a.start));

  const nightMins = todaySleep
    .filter((s) => s.type === "night")
    .reduce((acc, s) => {
      return (
        acc +
        Math.max(
          0,
          (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000,
        )
      );
    }, 0);
  const napMins = todaySleep
    .filter((s) => s.type === "nap")
    .reduce((acc, s) => {
      return (
        acc +
        Math.max(
          0,
          (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000,
        )
      );
    }, 0);

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = format(d, "yyyy-MM-dd");
    const mins = sleepEntries
      .filter((s) => s.start.startsWith(day))
      .reduce((acc, s) => {
        return (
          acc +
          Math.max(
            0,
            (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000,
          )
        );
      }, 0);
    return { day: format(d, "EEE"), hours: parseFloat((mins / 60).toFixed(1)) };
  });

  const save = () => {
    setError("");
    const [sh, sm] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);
    const start = new Date();
    start.setHours(sh, sm, 0, 0);
    const end = new Date();
    end.setHours(eh, em, 0, 0);
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }
    setSleepEntries((p) => [
      {
        id: genId(),
        start: start.toISOString(),
        end: end.toISOString(),
        type: sleepType,
        notes: notes || undefined,
      },
      ...p,
    ]);
    setNotes("");
    setShow(false);
  };

  const del = (id: string) =>
    setSleepEntries((p) => p.filter((s) => s.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Sleep
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <button
          onClick={() => {
            setError("");
            setStartStr(format(new Date(Date.now() - 3600000), "HH:mm"));
            setEndStr(format(new Date(), "HH:mm"));
            setShow(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> Log
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-bold font-display text-foreground">
            {minsToHM(nightMins)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Night</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-bold font-display text-foreground">
            {minsToHM(napMins)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Naps</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xl font-bold font-display text-foreground">
            {minsToHM(nightMins + napMins)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Total</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-foreground mb-4">This Week</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={weekData}
            barSize={20}
            margin={{ left: -20, right: 0 }}
          >
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#9B7B72", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 18]}
              tick={{ fontSize: 10, fill: "#9B7B72" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid rgba(44,24,16,0.09)",
                borderRadius: 12,
                fontSize: 12,
                padding: "8px 12px",
              }}
              formatter={(v: number) => [`${v}h`, "Sleep"]}
            />
            <Bar dataKey="hours" fill="#D95C74" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Today's Sessions
        </p>
        {todaySleep.length === 0 ? (
          <EmptyState
            icon={<Moon size={22} />}
            title="No sleep logged"
            desc="Tap 'Log' to record a sleep session."
          />
        ) : (
          <div className="space-y-2">
            {todaySleep.map((s) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.type === "night" ? "bg-violet-100 text-violet-600" : "bg-blue-100 text-blue-600"}`}
                >
                  <Moon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground capitalize">
                    {s.type === "night" ? "Night sleep" : "Nap"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {safeFormatTime(s.start)} → {safeFormatTime(s.end)}
                    {s.notes ? ` · ${s.notes}` : ""}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground font-mono">
                  {calcDuration(s.start, s.end)}
                </p>
                <button
                  onClick={() => setConfirmId(s.id)}
                  className="text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmId && (
        <ConfirmDeleteModal
          message="This sleep session will be permanently removed."
          onConfirm={() => del(confirmId)}
          onClose={() => setConfirmId(null)}
        />
      )}

      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex gap-3">
        <Brain size={17} className="text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-violet-800 leading-relaxed">
          <span className="font-bold text-violet-900">Tip: </span>Newborns need
          14–17h, 3–6 month olds need 12–16h total. An early bedtime (7–7:30 PM)
          helps.
        </p>
      </div>

      {show && (
        <Modal title="Log Sleep Session" onClose={() => setShow(false)}>
          <div className="space-y-4">
            <div>
              <FL>Type</FL>
              <ToggleGroup
                options={[
                  { value: "night" as SleepType, label: "🌙 Night" },
                  { value: "nap" as SleepType, label: "😴 Nap" },
                ]}
                value={sleepType}
                onChange={setSleepType}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FL>Start time</FL>
                <TI
                  type="time"
                  value={startStr}
                  onChange={(e) => setStartStr(e.target.value)}
                />
              </div>
              <div>
                <FL>End time</FL>
                <TI
                  type="time"
                  value={endStr}
                  onChange={(e) => setEndStr(e.target.value)}
                />
              </div>
            </div>
            <div>
              <FL>Notes (optional)</FL>
              <TI
                placeholder="e.g. restless, woke once…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
            <PBtn onClick={save}>Save Session</PBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Growth Tab ───────────────────────────────────────────────────────────────

function GrowthTab({
  growth,
  setGrowth,
  milestones,
  setMilestones,
  baby,
}: {
  growth: GrowthEntry[];
  setGrowth: React.Dispatch<React.SetStateAction<GrowthEntry[]>>;
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  baby: BabyProfile;
}) {
  const [showMeas, setShowMeas] = useState(false);
  const [showMs, setShowMs] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [msTitle, setMsTitle] = useState("");
  const [msExp, setMsExp] = useState("");
  const [confirmGrowth, setConfirmGrowth] = useState<string | null>(null);
  const [confirmMs, setConfirmMs] = useState<string | null>(null);

  const sorted = [...growth].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];

  const chartData = sorted
    .filter((g) => g.weight)
    .map((g) => ({
      label: (() => {
        try {
          return format(parseISO(g.date), "MMM d");
        } catch {
          return g.date;
        }
      })(),
      kg: g.weight,
    }));

  const saveMeas = () => {
    if (!date) return;
    setGrowth((p) => [
      ...p,
      {
        id: genId(),
        date,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        headCirc: head ? Number(head) : undefined,
      },
    ]);
    setWeight("");
    setHeight("");
    setHead("");
    setDate(todayStr());
    setShowMeas(false);
  };

  const saveMs = () => {
    if (!msTitle.trim()) return;
    setMilestones((p) => [
      ...p,
      {
        id: genId(),
        title: msTitle.trim(),
        expectedWeeks: msExp || "—",
        done: false,
      },
    ]);
    setMsTitle("");
    setMsExp("");
    setShowMs(false);
  };

  const toggleMs = (id: string) => {
    setMilestones((p) =>
      p.map((m) =>
        m.id === id
          ? m.done
            ? { ...m, done: false, achievedDate: undefined }
            : {
                ...m,
                done: true,
                achievedDate: format(new Date(), "MMM d, yyyy"),
              }
          : m,
      ),
    );
  };

  const delGrowth = (id: string) =>
    setGrowth((p) => p.filter((g) => g.id !== id));
  const delMs = (id: string) =>
    setMilestones((p) => p.filter((m) => m.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Growth
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {baby.name} · {getBabyAge(baby.birthDate)}
          </p>
        </div>
        <button
          onClick={() => {
            setDate(todayStr());
            setShowMeas(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> Measure
        </button>
      </div>

      {latest && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Weight",
              value: latest.weight ? `${latest.weight} kg` : "—",
              cls: "bg-rose-50 border-rose-200 text-rose-600",
            },
            {
              label: "Height",
              value: latest.height ? `${latest.height} cm` : "—",
              cls: "bg-teal-50 border-teal-200 text-teal-600",
            },
            {
              label: "Head",
              value: latest.headCirc ? `${latest.headCirc} cm` : "—",
              cls: "bg-amber-50 border-amber-200 text-amber-600",
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`${m.cls} border rounded-2xl p-4 text-center`}
            >
              <p className="text-xs text-muted-foreground mb-1.5">{m.label}</p>
              <p className="text-lg font-bold font-display text-foreground">
                {m.value}
              </p>
              <p className="text-[10px] font-bold mt-1 opacity-60">Latest</p>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-bold text-foreground mb-4">Weight Trend</p>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={chartData} margin={{ left: -20, right: 0 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D95C74" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#D95C74" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9B7B72" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9B7B72" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid rgba(44,24,16,0.09)",
                  borderRadius: 12,
                  fontSize: 12,
                  padding: "8px 12px",
                }}
                formatter={(v: number) => [`${v} kg`, "Weight"]}
              />
              <Area
                type="monotone"
                dataKey="kg"
                stroke="#D95C74"
                strokeWidth={2.5}
                fill="url(#wg)"
                dot={{ fill: "#D95C74", r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Measurement History
        </p>
        {sorted.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={22} />}
            title="No measurements yet"
            desc="Tap 'Measure' to log the first entry."
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {[...sorted].reverse().map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 px-4 py-3.5 group"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {(() => {
                      try {
                        return format(parseISO(g.date), "MMM d, yyyy");
                      } catch {
                        return g.date;
                      }
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      g.weight && `${g.weight} kg`,
                      g.height && `${g.height} cm`,
                      g.headCirc && `HC ${g.headCirc} cm`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmGrowth(g.id)}
                  className="text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Milestones
          </p>
          <button
            onClick={() => setShowMs(true)}
            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {milestones.length === 0 ? (
          <EmptyState
            icon={<Star size={22} />}
            title="No milestones"
            desc="Add milestones to track development."
          />
        ) : (
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3.5 group"
              >
                <button
                  onClick={() => toggleMs(m.id)}
                  title={m.done ? "Mark as not achieved" : "Mark as achieved"}
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${m.done ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground hover:bg-green-50 hover:text-green-500"}`}
                >
                  {m.done ? <Check size={14} /> : <Clock size={13} />}
                </button>
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${m.done ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {m.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.done
                      ? `Achieved ${m.achievedDate}`
                      : `Expected ${m.expectedWeeks}`}
                  </p>
                </div>
                {m.done && (
                  <Star
                    size={13}
                    className="text-amber-400 flex-shrink-0"
                    fill="currentColor"
                  />
                )}
                <button
                  onClick={() => setConfirmMs(m.id)}
                  className="text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmGrowth && (
        <ConfirmDeleteModal
          message="This measurement record will be permanently deleted."
          onConfirm={() => delGrowth(confirmGrowth)}
          onClose={() => setConfirmGrowth(null)}
        />
      )}
      {confirmMs && (
        <ConfirmDeleteModal
          message="This milestone will be permanently removed."
          onConfirm={() => delMs(confirmMs)}
          onClose={() => setConfirmMs(null)}
        />
      )}
      {showMeas && (
        <Modal title="Add Measurement" onClose={() => setShowMeas(false)}>
          <div className="space-y-4">
            <div>
              <FL>Date</FL>
              <TI
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayStr()}
              />
            </div>
            <div>
              <FL>Weight (kg)</FL>
              <TI
                type="number"
                step="0.01"
                min="0.5"
                max="30"
                placeholder="e.g. 6.2"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <FL>Height (cm)</FL>
              <TI
                type="number"
                step="0.1"
                min="30"
                max="130"
                placeholder="e.g. 62.0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div>
              <FL>Head Circumference (cm)</FL>
              <TI
                type="number"
                step="0.1"
                min="25"
                max="65"
                placeholder="e.g. 40.5"
                value={head}
                onChange={(e) => setHead(e.target.value)}
              />
            </div>
            <PBtn onClick={saveMeas}>Save Measurement</PBtn>
          </div>
        </Modal>
      )}

      {showMs && (
        <Modal title="Add Milestone" onClose={() => setShowMs(false)}>
          <div className="space-y-4">
            <div>
              <FL>Milestone</FL>
              <TI
                placeholder="e.g. First steps, First word…"
                value={msTitle}
                onChange={(e) => setMsTitle(e.target.value)}
              />
            </div>
            <div>
              <FL>Expected Age (optional)</FL>
              <TI
                placeholder="e.g. ~9–12 months"
                value={msExp}
                onChange={(e) => setMsExp(e.target.value)}
              />
            </div>
            <PBtn onClick={saveMs}>Add Milestone</PBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Health Tab ───────────────────────────────────────────────────────────────

function HealthTab({
  vaccinations,
  setVaccinations,
  appointments,
  setAppointments,
  notes,
  setNotes,
}: {
  vaccinations: Vaccination[];
  setVaccinations: React.Dispatch<React.SetStateAction<Vaccination[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  notes: MedicalNote[];
  setNotes: React.Dispatch<React.SetStateAction<MedicalNote[]>>;
}) {
  const [showVax, setShowVax] = useState(false);
  const [showApt, setShowApt] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [confirmVax, setConfirmVax] = useState<string | null>(null);
  const [confirmApt, setConfirmApt] = useState<string | null>(null);
  const [confirmNote, setConfirmNote] = useState<string | null>(null);

  const [vaxName, setVaxName] = useState("");
  const [vaxDate, setVaxDate] = useState(todayStr());
  const [aptDoctor, setAptDoctor] = useState("");
  const [aptSpec, setAptSpec] = useState("Pediatrician");
  const [aptDate, setAptDate] = useState(todayStr());
  const [aptTime, setAptTime] = useState("10:00");
  const [aptType, setAptType] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDate, setNoteDate] = useState(todayStr());
  const [noteContent, setNoteContent] = useState("");

  const nextVax = vaccinations.find((v) => !v.done);

  const markDone = (id: string) =>
    setVaccinations((p) =>
      p.map((v) =>
        v.id === id
          ? {
              ...v,
              done: true,
              completedDate: format(new Date(), "yyyy-MM-dd"),
            }
          : v,
      ),
    );
  const unmarkDone = (id: string) =>
    setVaccinations((p) =>
      p.map((v) =>
        v.id === id ? { ...v, done: false, completedDate: undefined } : v,
      ),
    );
  const delVax = (id: string) =>
    setVaccinations((p) => p.filter((v) => v.id !== id));
  const delApt = (id: string) =>
    setAppointments((p) => p.filter((a) => a.id !== id));
  const delNote = (id: string) => setNotes((p) => p.filter((n) => n.id !== id));

  const saveVax = () => {
    if (!vaxName.trim()) return;
    setVaccinations((p) => [
      ...p,
      {
        id: genId(),
        name: vaxName.trim(),
        scheduledDate: vaxDate,
        done: false,
      },
    ]);
    setVaxName("");
    setVaxDate(todayStr());
    setShowVax(false);
  };

  const saveApt = () => {
    if (!aptDoctor.trim() || !aptType.trim()) return;
    setAppointments((p) => [
      ...p,
      {
        id: genId(),
        doctor: aptDoctor.trim(),
        specialty: aptSpec,
        date: aptDate,
        time: aptTime,
        type: aptType.trim(),
      },
    ]);
    setAptDoctor("");
    setAptType("");
    setShowApt(false);
  };

  const saveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setNotes((p) => [
      {
        id: genId(),
        date: noteDate,
        title: noteTitle.trim(),
        content: noteContent.trim(),
      },
      ...p,
    ]);
    setNoteTitle("");
    setNoteContent("");
    setNoteDate(todayStr());
    setShowNote(false);
  };

  const safeDate = (d: string) => {
    try {
      return format(parseISO(d), "MMM d, yyyy");
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Health
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Vaccinations, appointments & notes
        </p>
      </div>

      {nextVax && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle
            size={16}
            className="text-rose-500 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-900">
              Upcoming Vaccination
            </p>
            <p className="text-sm text-rose-700 mt-0.5 leading-snug">
              {nextVax.name}
            </p>
            <p className="text-xs text-rose-600 mt-1">
              Scheduled: {safeDate(nextVax.scheduledDate)}
            </p>
          </div>
          <button
            onClick={() => markDone(nextVax.id)}
            className="text-xs bg-rose-500 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-rose-600 transition-colors flex-shrink-0"
          >
            Mark Done
          </button>
        </div>
      )}

      {/* Vaccinations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Vaccinations
          </p>
          <button
            onClick={() => {
              setVaxName("");
              setVaxDate(todayStr());
              setShowVax(true);
            }}
            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {vaccinations.length === 0 ? (
          <EmptyState
            icon={<Shield size={22} />}
            title="No vaccinations"
            desc="Add your baby's vaccination schedule."
          />
        ) : (
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {vaccinations.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 px-4 py-4 group"
              >
                <button
                  onClick={() => (v.done ? unmarkDone(v.id) : markDone(v.id))}
                  title={v.done ? "Mark as not done" : "Mark as done"}
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${v.done ? "bg-green-100 text-green-600" : "bg-rose-100 text-rose-500 hover:bg-green-50 hover:text-green-500"}`}
                >
                  {v.done ? <Check size={14} /> : <Shield size={13} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {v.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.done
                      ? `Done ${v.completedDate ? safeDate(v.completedDate) : ""}`
                      : `Scheduled ${safeDate(v.scheduledDate)}`}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-bold flex-shrink-0 ${v.done ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-600"}`}
                >
                  {v.done ? "Done" : "Pending"}
                </span>
                <button
                  onClick={() => setConfirmVax(v.id)}
                  className="text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Appointments
          </p>
          <button
            onClick={() => {
              setAptDoctor("");
              setAptType("");
              setShowApt(true);
            }}
            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {appointments.length === 0 ? (
          <EmptyState
            icon={<Calendar size={22} />}
            title="No appointments"
            desc="Schedule doctor visits and checkups."
          />
        ) : (
          <div className="space-y-2">
            {[...appointments]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((apt) => (
                <div
                  key={apt.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <User size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {apt.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {apt.doctor} · {apt.specialty}
                    </p>
                    <p className="text-xs font-semibold text-primary mt-1">
                      {safeDate(apt.date)} · {apt.time}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmApt(apt.id)}
                    className="text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Medical Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Medical Notes
          </p>
          <button
            onClick={() => {
              setNoteTitle("");
              setNoteContent("");
              setNoteDate(todayStr());
              setShowNote(true);
            }}
            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {notes.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={22} />}
            title="No notes"
            desc="Record medical observations and doctor feedback."
          />
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className="bg-card border border-border rounded-2xl p-4 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-foreground">
                        {n.title}
                      </p>
                      <span className="text-xs text-muted-foreground font-mono">
                        {safeDate(n.date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmNote(n.id)}
                    className="text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modals */}
      {confirmVax && (
        <ConfirmDeleteModal
          message="This vaccination record will be permanently removed from the schedule."
          onConfirm={() => delVax(confirmVax)}
          onClose={() => setConfirmVax(null)}
        />
      )}
      {confirmApt && (
        <ConfirmDeleteModal
          message="This appointment will be permanently deleted."
          onConfirm={() => delApt(confirmApt)}
          onClose={() => setConfirmApt(null)}
        />
      )}
      {confirmNote && (
        <ConfirmDeleteModal
          message="This medical note will be permanently deleted."
          onConfirm={() => delNote(confirmNote)}
          onClose={() => setConfirmNote(null)}
        />
      )}

      {/* Add / edit modals */}
      {showVax && (
        <Modal title="Add Vaccination" onClose={() => setShowVax(false)}>
          <div className="space-y-4">
            <div>
              <FL>Vaccine Name</FL>
              <TI
                placeholder="e.g. MMR, DTaP, Flu Shot…"
                value={vaxName}
                onChange={(e) => setVaxName(e.target.value)}
              />
            </div>
            <div>
              <FL>Scheduled Date</FL>
              <TI
                type="date"
                value={vaxDate}
                onChange={(e) => setVaxDate(e.target.value)}
              />
            </div>
            <PBtn onClick={saveVax}>Add Vaccination</PBtn>
          </div>
        </Modal>
      )}

      {showApt && (
        <Modal title="Add Appointment" onClose={() => setShowApt(false)}>
          <div className="space-y-4">
            <div>
              <FL>Appointment Type</FL>
              <TI
                placeholder="e.g. 4-Month Checkup, Eye Exam…"
                value={aptType}
                onChange={(e) => setAptType(e.target.value)}
              />
            </div>
            <div>
              <FL>Doctor's Name</FL>
              <TI
                placeholder="e.g. Dr. Sarah Miller"
                value={aptDoctor}
                onChange={(e) => setAptDoctor(e.target.value)}
              />
            </div>
            <div>
              <FL>Specialty</FL>
              <TI
                placeholder="e.g. Pediatrician"
                value={aptSpec}
                onChange={(e) => setAptSpec(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FL>Date</FL>
                <TI
                  type="date"
                  value={aptDate}
                  onChange={(e) => setAptDate(e.target.value)}
                />
              </div>
              <div>
                <FL>Time</FL>
                <TI
                  type="time"
                  value={aptTime}
                  onChange={(e) => setAptTime(e.target.value)}
                />
              </div>
            </div>
            <PBtn onClick={saveApt}>Add Appointment</PBtn>
          </div>
        </Modal>
      )}

      {showNote && (
        <Modal title="Add Medical Note" onClose={() => setShowNote(false)}>
          <div className="space-y-4">
            <div>
              <FL>Title</FL>
              <TI
                placeholder="e.g. 2-Month Checkup, Prescription…"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div>
              <FL>Date</FL>
              <TI
                type="date"
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
              />
            </div>
            <div>
              <FL>Notes</FL>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Doctor's observations, medications, concerns…"
                rows={4}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
            <PBtn onClick={saveNote}>Save Note</PBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── AI Tab ───────────────────────────────────────────────────────────────────

const AI_KB: [string[], string][] = [
  [
    ["sleep", "sleeping", "nap", "tired"],
    "Sleep is crucial at this age! Newborns need 14–17h, and 3–6 month olds need 12–16h total. A consistent routine helps: bath → feeding → gentle rocking → dark, quiet room. White noise can work wonders for some babies. If your baby is waking every 1–2h at night past 3 months, try a slightly earlier bedtime — overtiredness makes it harder to sleep through.",
  ],
  [
    [
      "feed",
      "feeding",
      "hungry",
      "milk",
      "breast",
      "bottle",
      "formula",
      "solid",
    ],
    "Feeding is the cornerstone! Newborns typically feed every 2–3h (8–12×/day). By 3–4 months this often settles to every 3–4h. Watch for hunger cues: rooting, sucking fists, or turning their head side-to-side. Cluster feeding in the evenings is totally normal and doesn't mean you have insufficient milk.",
  ],
  [
    ["cry", "crying", "fussy", "fussing", "colic", "witching"],
    "Crying is their main language right now. The most common causes are hunger, tiredness, gas, overstimulation, or needing comfort. Try the '5 Ss': Swaddle, Side/stomach position, Shush, Swing, and Suck. If crying is inconsolable for more than 3 hours/day, 3+ days a week, mention it at the next checkup — it could be colic, which peaks around 6 weeks and usually resolves by 3–4 months.",
  ],
  [
    ["weight", "grow", "growth", "gain", "heavy", "light", "size"],
    "Weight gain in the first year is rapid! Babies typically double their birth weight by 5 months and triple it by 12 months. In the first few months, expect roughly 150–200g gain per week. What matters most is consistent growth along a percentile curve — not hitting a specific number. Your pediatrician will plot this at every checkup.",
  ],
  [
    ["vaccine", "vaccination", "shot", "immuniz", "jab"],
    "Vaccinations protect against serious diseases and are given at birth, 2, 4, 6, 12, and 15–18 months (among others). Mild fussiness, a sore leg, or low-grade fever (under 38.5°C) after shots is normal and usually resolves within 24–48h. You can give age-appropriate acetaminophen for comfort. Contact your doctor if fever exceeds 39°C or baby seems very unwell.",
  ],
  [
    ["solid", "food", "eat", "cereal", "puree", "spoon"],
    "Most babies are ready for solids around 4–6 months. Signs of readiness: can sit with minimal support, good head control, shows interest in food, and the tongue-thrust reflex has faded. Start with single-ingredient purees (sweet potato, avocado, banana, peas). Introduce one new food every 3–4 days so you can spot any allergies. Breast milk or formula remains the primary nutrition source until 12 months.",
  ],
  [
    ["diaper", "poop", "stool", "wet", "constipat", "diarrhea"],
    "Diaper patterns vary widely by baby and feeding method. Breastfed newborns may have 8–12 wet diapers and 3–4 dirty ones per day. By 6 weeks, some breastfed babies go several days between poops — this is often normal as long as the stool is still soft when it comes. Fewer than 6 wet diapers per day could signal dehydration; call your doctor right away.",
  ],
  [
    [
      "develop",
      "milestone",
      "crawl",
      "walk",
      "talk",
      "word",
      "roll",
      "sit",
      "stand",
    ],
    "Every baby develops at their own pace! Typical milestones: social smile (6–8 wks), cooing (2–3 mo), rolling (4–6 mo), sitting with support (4–5 mo), unassisted sitting (6–8 mo), crawling (7–10 mo), first words (9–12 mo), walking (9–15 mo). A range is always normal. If you're worried about a skill not appearing, bring it up at the next checkup — early intervention is always better than waiting.",
  ],
];

function getAIReply(input: string, babyName: string): string {
  const lower = input.toLowerCase();
  for (const [keywords, response] of AI_KB) {
    if (keywords.some((k) => lower.includes(k))) {
      return response;
    }
  }
  return `That's a great question about ${babyName}! Every baby is unique, and the best person to give specific advice is your pediatrician who knows ${babyName}'s full history. In general, trust your instincts as a parent — you know your baby best. Keep tracking consistently in Bebio and I can help you spot patterns. What else would you like to know?`;
}

function AITab({ baby }: { baby: BabyProfile }) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >(() => [
    {
      role: "assistant",
      text: `Hi! 👋 I'm your Bebio AI assistant. ${baby.name} is ${getBabyAge(baby.birthDate)} — a wonderful stage! I can answer questions about feeding, sleep, vaccinations, milestones, and development. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setTyping(true);
    setTimeout(
      () => {
        setTyping(false);
        setMessages((m) => [
          ...m,
          { role: "assistant", text: getAIReply(msg, baby.name) },
        ]);
      },
      900 + Math.random() * 600,
    );
  };

  const suggestions = [
    `Is ${baby.name} sleeping enough?`,
    "When can we start solid foods?",
    "How do I handle colic?",
    "What milestones should I expect?",
    "When are vaccinations due?",
  ];

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 10rem)" }}>
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold font-display text-foreground">
          AI Assistant
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Personalized guidance for {baby.name}
        </p>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-3 mb-2 flex-shrink-0"
        style={{ scrollbarWidth: "none" }}
      >
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="flex-shrink-0 text-xs bg-card border border-border text-foreground px-3 py-2 rounded-full hover:border-primary/40 hover:bg-secondary/60 transition-colors font-medium whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain size={14} className="text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Brain size={14} className="text-primary-foreground" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1 h-11">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !typing && send()}
          placeholder={`Ask about ${baby.name}'s health, sleep, feeding…`}
          className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
        <button
          onClick={() => send()}
          disabled={typing}
          className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV: { tab: Tab; label: string; icon: React.ReactNode }[] = [
  { tab: "home", label: "Home", icon: <Home size={18} /> },
  { tab: "feeding", label: "Feeding", icon: <Droplets size={18} /> },
  { tab: "sleep", label: "Sleep", icon: <Moon size={18} /> },
  { tab: "growth", label: "Growth", icon: <TrendingUp size={18} /> },
  { tab: "health", label: "Health", icon: <Heart size={18} /> },
  { tab: "ai", label: "AI", icon: <Brain size={18} /> },
];

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [tab, setTab] = useState<Tab>("home");

  const [feedings, setFeedings] = useState<FeedingEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [diapers, setDiapers] = useState<DiaperEntry[]>([]);
  const [growth, setGrowth] = useState<GrowthEntry[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medNotes, setMedNotes] = useState<MedicalNote[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onBabySetup = (profile: BabyProfile) => {
    setBaby(profile);
    setFeedings(makeDefaultFeedings());
    setSleepEntries(makeDefaultSleep());
    setDiapers(makeDefaultDiapers());
    setGrowth(makeDefaultGrowth(profile.birthDate));
    setVaccinations(makeDefaultVaccinations(profile.birthDate));
    setAppointments(makeDefaultAppointments(profile.birthDate));
    setMilestones(makeDefaultMilestones());
    setMedNotes([]);
    setScreen("app");
  };

  const logout = () => {
    setBaby(null);
    setScreen("login");
    setTab("home");
  };

  const genderEmoji = baby?.gender === "girl" ? "👧" : "👦";
  const navLabel = (t: Tab) =>
    t === "ai" ? "AI Assistant" : t.charAt(0).toUpperCase() + t.slice(1);
  const handleTab = (t: Tab) => {
    setTab(t);
    setMobileMenuOpen(false);
  };

  // ── True single return — zero early exits so hook count is always 12 ────────
  return (
    <>
      {screen === "login" && (
        <LoginScreen
          onLogin={() => setScreen("setup")}
          onSignup={() => setScreen("signup")}
        />
      )}
      {screen === "signup" && (
        <SignupScreen
          onSignup={() => setScreen("setup")}
          onLogin={() => setScreen("login")}
        />
      )}
      {(screen === "setup" ||
        (screen !== "login" && screen !== "signup" && !baby)) && (
        <BabySetupScreen onComplete={onBabySetup} />
      )}
      {screen === "app" && baby && (
        <div className="min-h-screen bg-background font-sans">
          {/* ── Top navigation bar ─────────────────────────────────────── */}
          <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                    <Baby size={16} className="text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground font-display text-lg leading-none">
                    Bebio
                  </span>
                </div>

                {/* Right: baby chip + sign out */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-1.5">
                    <span className="text-base leading-none">
                      {genderEmoji}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-none">
                        {baby.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {getBabyAge(baby.birthDate)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>

                {/* Mobile: emoji + hamburger */}
                <div className="flex md:hidden items-center gap-2">
                  <span className="text-xl leading-none">{genderEmoji}</span>
                  <button
                    onClick={() => setMobileMenuOpen((o) => !o)}
                    className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? (
                      <X size={18} />
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <rect
                          y="3"
                          width="18"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        />
                        <rect
                          y="8"
                          width="18"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        />
                        <rect
                          y="13"
                          width="18"
                          height="2"
                          rx="1"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-border bg-card shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-secondary rounded-xl">
                    <span className="text-lg leading-none">{genderEmoji}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {baby.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getBabyAge(baby.birthDate)}
                      </p>
                    </div>
                  </div>
                  {NAV.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => handleTab(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${tab === item.tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      {item.icon}
                      {navLabel(item.tab)}
                    </button>
                  ))}
                  <div className="pt-2 mt-2 border-t border-border">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* ── Page content ───────────────────────────────────────────── */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Left sidebar — lg+ */}
              <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
                <div className="sticky top-24 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                    Navigation
                  </p>
                  {NAV.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => handleTab(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === item.tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      {item.icon}
                      {navLabel(item.tab)}
                    </button>
                  ))}
                </div>
              </aside>

              {/* Main content */}
              <div className="flex-1 min-w-0 max-w-2xl">
                {tab === "home" && (
                  <HomeTab
                    baby={baby}
                    feedings={feedings}
                    sleepEntries={sleepEntries}
                    diapers={diapers}
                    setDiapers={setDiapers}
                    growth={growth}
                    vaccinations={vaccinations}
                    setTab={setTab}
                  />
                )}
                {tab === "feeding" && (
                  <FeedingTab feedings={feedings} setFeedings={setFeedings} />
                )}
                {tab === "sleep" && (
                  <SleepTab
                    sleepEntries={sleepEntries}
                    setSleepEntries={setSleepEntries}
                  />
                )}
                {tab === "growth" && (
                  <GrowthTab
                    growth={growth}
                    setGrowth={setGrowth}
                    milestones={milestones}
                    setMilestones={setMilestones}
                    baby={baby}
                  />
                )}
                {tab === "health" && (
                  <HealthTab
                    vaccinations={vaccinations}
                    setVaccinations={setVaccinations}
                    appointments={appointments}
                    setAppointments={setAppointments}
                    notes={medNotes}
                    setNotes={setMedNotes}
                  />
                )}
                {tab === "ai" && <AITab baby={baby} />}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
