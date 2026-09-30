import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Route as RouteIcon,
  ShieldCheck,
  Radar,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — AutoViaX Autonomous Mobility Intelligence" },
      {
        name: "description",
        content:
          "Access the AutoViaX control plane for autonomous fleet intelligence, route optimisation and safety assurance.",
      },
      { property: "og:title", content: "Sign in — AutoViaX" },
      {
        property: "og:description",
        content: "Access the AutoViaX autonomous mobility control plane.",
      },
    ],
  }),
  component: AuthPage,
});

const highlights = [
  {
    icon: Radar,
    title: "Multi-sensor perception fusion",
    copy: "LiDAR, radar, vision and GNSS reconciled into one live world model.",
  },
  {
    icon: Activity,
    title: "Decision intelligence core",
    copy: "Policy-aware reasoning across every vehicle, depot and corridor.",
  },
  {
    icon: RouteIcon,
    title: "Continuous route optimisation",
    copy: "Corridors recomputed as traffic, weather and demand shift.",
  },
  {
    icon: ShieldCheck,
    title: "Safety assurance layer",
    copy: "Auditable envelopes, interventions and compliance evidence.",
  },
];

// Helper to prevent auth promises from hanging indefinitely in production
function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Request timed out. Please check your internet connection or server status."
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

function AuthPage() {
  const { signIn, signUp, signInWithGoogle, user, ready } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (ready && user) {
      navigate({ to: "/dashboard", replace: true }).catch(() => {
        window.location.href = "/dashboard";
      });
    }
  }, [ready, user, navigate]);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Please enter your name.";
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in the required fields.");
      return;
    }

    setErrors({});
    setBusy(true);

    try {
      if (mode === "login") {
        await withTimeout(signIn(email.trim(), password));
        toast.success("Welcome back to AutoViaX");
      } else {
        await withTimeout(signUp(name.trim(), email.trim(), password));
        toast.success("Workspace created");
      }

      await navigate({ to: "/dashboard", replace: true }).catch(() => {
        window.location.href = "/dashboard";
      });

      // Extra safeguard against navigation hanging
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          (window.location.pathname === "/" || window.location.pathname === "")
        ) {
          window.location.href = "/dashboard";
        }
      }, 300);
    } catch (err) {
      console.error("[Auth Error]:", err);
      const message =
        err instanceof Error ? err.message : "Authentication failed. Please try again.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setGoogleBusy(true);
    try {
      await withTimeout(signInWithGoogle(), 20000);
      toast.success("Signed in with Google");
      await navigate({ to: "/dashboard" }).catch(() => {
        window.location.href = "/dashboard";
      });
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          (window.location.pathname === "/" || window.location.pathname === "")
        ) {
          window.location.href = "/dashboard";
        }
      }, 500);
    } catch (err) {
      console.error("[Google Auth Error]:", err);
      const message =
        err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      toast.error(message);
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background grid md:grid-cols-2 lg:grid-cols-[1.15fr_1fr]">
      {/* Left hero panel */}
      <section className="relative hidden md:flex md:flex-col md:justify-between overflow-hidden border-r border-border bg-sidebar p-8 lg:p-12 xl:p-16">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -left-32 top-1/4 h-[480px] w-[480px] rounded-full bg-primary/12 blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-chart-1/10 blur-[100px]" />

        {/* Top brand */}
        <div className="relative z-10">
          <Brand className="h-12" />
        </div>

        {/* Center narrative */}
        <div className="relative z-10 max-w-xl py-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-primary uppercase shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5" />
            Autonomous mobility intelligence
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl leading-[1.1]">
            The intelligence layer beneath every{" "}
            <span className="text-primary text-glow">autonomous</span> mile.
          </h1>
          <p className="mt-4 text-sm lg:text-base leading-relaxed text-muted-foreground">
            AutoViaX unifies telemetry, multi-sensor perception, and route optimisation to
            coordinate commercial fleets, automated corridors, and depots in real time.
          </p>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="size-4 text-primary" /> 99.98% Assurance uptime
            </span>
            <span className="size-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="size-4 text-primary" /> 120 Hz Fusion rate
            </span>
          </div>
        </div>

        {/* Highlights grid */}
        <div className="relative z-10 grid gap-3 sm:grid-cols-2">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="glass-panel p-3.5 sm:p-4 transition-all duration-200 hover:border-primary/40 hover:bg-surface-2/40"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
                <h.icon className="size-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                {h.title}
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
                {h.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Right form panel */}
      <section className="relative flex flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8 lg:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-[90px] md:hidden" />

        <div className="relative mx-auto w-full max-w-md">
          {/* Top header on mobile */}
          <div className="mb-6 flex items-center justify-between sm:mb-8">
            <Brand className="h-10 sm:h-11" />
            <span className="rounded-full border border-border bg-surface/80 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur-md">
              v2.4 Control Plane
            </span>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {mode === "login" ? "Sign in to your workspace" : "Create your account"}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                {mode === "login"
                  ? "Access your autonomous fleet intelligence dashboard."
                  : "Start monitoring autonomous corridors and vehicles."}
              </p>
            </div>

            {/* Mode switcher tabs */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setErrors({});
                  }}
                  className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    mode === m
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-foreground">
                    Full name
                  </Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Enter your name"
                      className={`h-11 bg-surface pl-10 text-sm ${
                        errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Work email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="name@company.com"
                    className={`h-11 bg-surface pl-10 text-sm ${
                      errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Min. 6 characters</span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••••••"
                    className={`h-11 bg-surface pl-10 pr-10 text-sm ${
                      errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={busy || googleBusy}
                className="h-11 w-full text-sm font-semibold cursor-pointer shadow-md transition-all active:scale-[0.99]"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Authenticating…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {mode === "login" ? "Enter control plane" : "Create workspace"}
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              <span className="h-px flex-1 bg-border/80" /> or{" "}
              <span className="h-px flex-1 bg-border/80" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={busy || googleBusy}
              onClick={google}
              className="h-11 w-full gap-3 text-xs sm:text-sm font-medium bg-surface/60 hover:bg-surface hover:text-foreground cursor-pointer border-border/80"
            >
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2H12Z"
                />
                <path
                  fill="#34A853"
                  d="M6.6 14.3 5.9 14.9 3.4 16.8A9 9 0 0 0 12 21c2.4 0 4.5-.8 6-2.2l-3.2-2.5c-.8.6-1.9 1-2.8 1a4.9 4.9 0 0 1-4.6-3.3Z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.4 7.2A9 9 0 0 0 3.4 16.8l3.2-2.5a5.4 5.4 0 0 1 0-4.6L3.4 7.2Z"
                />
                <path
                  fill="#4285F4"
                  d="M12 6.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 0 0 3.4 7.2l3.2 2.5A4.9 4.9 0 0 1 12 6.6Z"
                />
              </svg>
              {googleBusy
                ? "Opening Google…"
                : mode === "login"
                  ? "Continue with Google"
                  : "Sign up with Google"}
            </Button>
          </div>

          <div className="mt-6 md:hidden">
            <p className="text-center text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2.5">
              Core Intelligence Stack
            </p>
            <div className="grid grid-cols-2 gap-2">
              {highlights.map((h) => (
                <div
                  key={h.title}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface/50 p-2.5"
                >
                  <h.icon className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate text-[11px] font-medium text-foreground">
                    {h.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground leading-relaxed">
            Protected by AutoViaX safety assurance envelope • ISO 26262 & SOC2-aligned
          </p>
        </div>
      </section>
    </main>
  );
}

function Brand({ className = "h-11" }: { className?: string }) {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo.svg" alt="AutoViaX" className={`${className} w-auto object-contain`} />
    </div>
  );
}