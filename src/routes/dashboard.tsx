import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Car,
  Check,
  Gauge,
  GitBranch,
  Layers,
  Leaf,
  LogOut,
  Menu,
  Radar,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { timeAgo, useNotifications } from "@/lib/notifications";
import { vehicles, alerts, sensorHealth } from "@/lib/fleet-data";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/**
 * Route-level Error Boundary to catch uncaught runtime crashes 
 * or missing production chunks in child views.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("Dashboard route render failure:", error, info);
    
    // Automatically recover from stale Vite deployment chunks
    const isChunkFailure = 
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Importing a module script failed");

    if (isChunkFailure) {
      const storageKey = "vite_chunk_reload_guard";
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();

      // Prevent continuous refresh loop
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <AlertTriangle className="size-10 text-destructive mb-3" />
          <h2 className="text-base font-semibold text-foreground">View Rendering Exception</h2>
          <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
            {this.state.error?.message || "An unexpected error occurred while loading this section."}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90 cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Control Plane — AutoViaX" },
      {
        name: "description",
        content:
          "Live autonomous fleet intelligence, perception health, routing and safety assurance.",
      },
      { property: "og:title", content: "AutoViaX Control Plane" },
      { property: "og:description", content: "Live autonomous fleet intelligence dashboard." },
    ],
  }),
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      <RefreshCw className="size-5 animate-spin mr-2 text-primary" />
      Loading control plane…
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="size-10 text-destructive mb-3" />
      <h2 className="text-lg font-semibold text-foreground">Navigation Error</h2>
      <p className="mt-2 text-xs text-muted-foreground max-w-sm">
        {error?.message || "Failed to route to requested resource."}
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-surface px-4 py-2 text-xs font-medium border border-border hover:bg-surface-2"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
        >
          Reload App
        </button>
      </div>
    </div>
  ),
  component: DashboardLayout,
});

export const navItems = [
  { to: "/dashboard", label: "Dashboard Overview", icon: Gauge, exact: true },
  { to: "/dashboard/perception", label: "Multi-sensor perception fusion", icon: Radar },
  { to: "/dashboard/decision", label: "Decision intelligence core", icon: GitBranch },
  { to: "/dashboard/routes", label: "Continuous route optimisation", icon: RouteIcon },
  { to: "/dashboard/environment", label: "Environmental accounting", icon: Leaf },
  { to: "/dashboard/safety", label: "Safety assurance layer", icon: ShieldCheck },
  { to: "/dashboard/architecture", label: "Open architecture", icon: Layers },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export type DashboardRoute = (typeof navItems)[number]["to"];

function DashboardLayout() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !user) navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading control plane…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="AutoViaX" className="h-12 w-auto object-contain" />
          </Link>

          <button
            type="button"
            className="lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? Boolean(item.exact) : false }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="leading-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute inset-x-3 bottom-4 rounded-xl border border-sidebar-border bg-surface p-4">
          <p className="text-xs font-semibold text-foreground">Fleet autonomy</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            92% of miles driverless this week
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[92%] rounded-full bg-primary" />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-[280px]">
        <TopBar
          onMenu={() => setSidebarOpen(true)}
          onSignOut={async () => {
            await signOut();
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
        />
        <main className="mx-auto max-w-[1400px] space-y-6 sm:space-y-8 px-3.5 py-6 sm:px-6 md:px-8 min-w-0">
          <DashboardErrorBoundary>
            <Outlet />
          </DashboardErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function TopBar({ onMenu, onSignOut }: { onMenu: () => void; onSignOut: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unread,
    markRead,
    markAllRead,
    toggleRead,
    archive,
    clearAll,
    restoreAll,
  } = useNotifications();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openPanel, setOpenPanel] = useState<null | "bell" | "profile">(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Modules
    const moduleMatches = (navItems ?? [])
      .filter(
        (n) =>
          (n.label?.toLowerCase() ?? "").includes(q) ||
          (n.to?.toLowerCase() ?? "").includes(q),
      )
      .map((n) => ({
        to: n.to,
        title: n.label,
        subtitle: "Control Plane Module",
        icon: n.icon,
      }));

    // Vehicles & Corridors
    const vehicleMatches = (vehicles ?? [])
      .filter(
        (v) =>
          (v.id?.toLowerCase() ?? "").includes(q) ||
          (v.route?.toLowerCase() ?? "").includes(q) ||
          (v.mode?.toLowerCase() ?? "").includes(q) ||
          (v.status?.toLowerCase() ?? "").includes(q) ||
          (q.length >= 3 && ("vehicles".includes(q) || "corridors".includes(q))),
      )
      .slice(0, 3)
      .map((v) => ({
        to: "/dashboard/routes" as const,
        title: `${v.id ?? "Unknown"} • ${v.route ?? "Unassigned"}`,
        subtitle: `${v.mode ?? "Autonomous"} — ${v.status ?? "Standby"} (${v.battery ?? 0}% battery)`,
        icon: Car,
      }));

    // Sensors
    const sensorMatches = (sensorHealth ?? [])
      .filter(
        (s) =>
          (s.name?.toLowerCase() ?? "").includes(q) ||
          (q.length >= 3 && "sensors".includes(q)),
      )
      .slice(0, 2)
      .map((s) => ({
        to: "/dashboard/perception" as const,
        title: `${s.name ?? "Sensor"} Sensor Stream`,
        subtitle: `Operational Health: ${s.value ?? 100}% calibration`,
        icon: Radar,
      }));

    // Alerts
    const alertMatches = (alerts ?? [])
      .filter(
        (a) =>
          (a.title?.toLowerCase() ?? "").includes(q) ||
          (a.detail?.toLowerCase() ?? "").includes(q) ||
          (q.length >= 3 && "alerts".includes(q)),
      )
      .slice(0, 2)
      .map((a) => ({
        to: "/dashboard/safety" as const,
        title: a.title ?? "Alert",
        subtitle: a.detail ?? "",
        icon: ShieldCheck,
      }));

    return [...moduleMatches, ...vehicleMatches, ...sensorMatches, ...alertMatches].slice(0, 8);
  }, [query]);

  const handleSelect = (to: DashboardRoute) => {
    navigate({ to });
    setQuery("");
    setSearchOpen(false);
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setSearchOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!searchOpen) {
        setSearchOpen(true);
      } else if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      if (results.length > 0 && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex].to);
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div
        className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 sm:gap-3 px-3.5 sm:px-6 md:px-8"
        ref={wrapRef}
      >
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground lg:hidden cursor-pointer shrink-0"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative flex-1 max-w-xs sm:max-w-md min-w-0" ref={searchRef}>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => {
              setOpenPanel(null);
              if (query.trim()) setSearchOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search modules, vehicles, corridors…"
            className="h-10 bg-surface pl-9 pr-8 text-xs sm:text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}

          {searchOpen && query.trim().length > 0 && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="fixed inset-x-3 top-16 z-50 max-h-[60vh] sm:max-h-[380px] overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-2xl sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:top-12"
            >
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No modules, vehicles, or corridors found matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((r, i) => (
                  <button
                    key={`${r.to}-${r.title}`}
                    type="button"
                    onClick={() => handleSelect(r.to)}
                    className={`flex w-full text-left items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                      i === selectedIndex
                        ? "bg-surface-2 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    <r.icon className="size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{r.subtitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setOpenPanel(openPanel === "bell" ? null : "bell");
              }}
              className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unread}
                </span>
              )}
            </button>

            {openPanel === "bell" && (
              <div className="fixed inset-x-3 top-16 z-50 max-h-[85vh] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[380px] sm:max-h-[520px]">
                <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-3 sm:px-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Operational alerts</p>
                    <p className="text-[11px] text-muted-foreground">
                      {unread > 0 ? `${unread} unread` : "All caught up"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        markAllRead();
                        toast.success("All alerts marked as read");
                      }}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground cursor-pointer"
                    >
                      Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearAll();
                        toast.success("Alert inbox cleared");
                      }}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(85vh-65px)] sm:max-h-[380px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No alerts right now.</p>
                      <button
                        type="button"
                        onClick={() => {
                          restoreAll();
                          toast.success("Alert history restored");
                        }}
                        className="mt-2 text-[11px] text-primary hover:underline cursor-pointer"
                      >
                        Restore history
                      </button>
                    </div>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`border-b border-border/60 px-3.5 py-3 sm:px-4 last:border-0 ${n.read ? "" : "bg-primary/5"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-1.5 size-2 shrink-0 rounded-full ${
                              n.level === "critical"
                                ? "bg-destructive"
                                : n.level === "warn"
                                  ? "bg-chart-3"
                                  : n.level === "ok"
                                    ? "bg-primary/60"
                                    : "bg-primary"
                            }`}
                          />
                          <p className="text-sm text-foreground leading-snug">{n.title}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 pl-4 text-xs text-muted-foreground leading-relaxed">
                        {n.detail}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 pl-4">
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => {
                              markRead(n.id);
                              setOpenPanel(null);
                            }}
                            className="text-[11px] font-medium text-primary hover:underline"
                          >
                            View
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleRead(n.id)}
                          className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {n.read ? "Mark unread" : "Mark read"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            archive(n.id);
                            toast.success("Alert dismissed");
                          }}
                          className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPanel(openPanel === "profile" ? null : "profile")}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-surface py-1.5 pl-1.5 pr-3 transition-colors hover:bg-surface-2 cursor-pointer"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="size-7 rounded-md object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                  {(user?.name || "A").slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-medium text-foreground">
                  {user?.name || "Admin"}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {user?.role || "Administrator"}
                </span>
              </span>
            </button>
            {openPanel === "profile" && (
              <div className="fixed right-3 top-16 z-50 w-[calc(100vw-24px)] max-w-xs sm:w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl sm:absolute sm:right-0 sm:top-12">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "ops@autoviax.net"}
                  </p>
                  <p className="mt-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                    {user?.provider === "google.com"
                      ? "Google account"
                      : user?.provider === "demo"
                        ? "Demo session"
                        : "Email account"}
                  </p>
                </div>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setOpenPanel(null)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                >
                  <Settings className="size-4" /> Workspace settings
                </Link>
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Check className="size-4 text-primary" /> Session verified
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-sm text-destructive hover:bg-surface-2 cursor-pointer"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}