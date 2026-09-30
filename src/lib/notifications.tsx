import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NotificationLevel = "warn" | "info" | "ok" | "critical";

export type NotificationLink =
  | "/dashboard"
  | "/dashboard/perception"
  | "/dashboard/decision"
  | "/dashboard/routes"
  | "/dashboard/environment"
  | "/dashboard/safety"
  | "/dashboard/architecture"
  | "/dashboard/settings";

export type Notification = {
  id: string;
  title: string;
  detail: string;
  level: NotificationLevel;
  createdAt: number;
  read: boolean;
  archived: boolean;
  vehicle?: string;
  link?: NotificationLink;
};

const now = Date.now();
const min = 60_000;

const seed: Notification[] = [
  {
    id: "n1",
    title: "Sensor drift detected",
    detail: "AVX-0871 camera calibration variance 2.4% — recalibration queued at Depot 3.",
    level: "warn",
    createdAt: now - 2 * min,
    read: false,
    archived: false,
    vehicle: "AVX-0871",
    link: "/dashboard/perception",
  },
  {
    id: "n2",
    title: "Route re-optimised",
    detail: "Corridor 14 congestion — 11 vehicles rerouted, 7 min average saving.",
    level: "info",
    createdAt: now - 9 * min,
    read: false,
    archived: false,
    link: "/dashboard/routes",
  },
  {
    id: "n3",
    title: "Teleop escalation resolved",
    detail: "AVX-2318 handed back to L4 autonomy after 46 s supervised assist.",
    level: "critical",
    createdAt: now - 18 * min,
    read: false,
    archived: false,
    vehicle: "AVX-2318",
    link: "/dashboard/safety",
  },
  {
    id: "n4",
    title: "Safety envelope held",
    detail: "Pedestrian cut-in handled at 42 km/h with 1.8 m clearance margin.",
    level: "ok",
    createdAt: now - 26 * min,
    read: true,
    archived: false,
    link: "/dashboard/safety",
  },
  {
    id: "n5",
    title: "Charge window shifted",
    detail: "Depot 3 grid pricing peak avoided — 340 kWh moved to 02:00 window.",
    level: "info",
    createdAt: now - 64 * min,
    read: true,
    archived: false,
    link: "/dashboard/environment",
  },
];

const incoming: Omit<Notification, "id" | "createdAt" | "read" | "archived">[] = [
  {
    title: "Fusion confidence recovered",
    detail: "LiDAR/radar agreement back to 99.1% on the Ring corridor.",
    level: "ok",
    link: "/dashboard/perception",
  },
  {
    title: "Depot capacity warning",
    detail: "Depot 1 charging bays at 92% utilisation for the next 40 minutes.",
    level: "warn",
    link: "/dashboard/environment",
  },
  {
    title: "New corridor published",
    detail: "Corridor 22 (Port → Hub B) approved by the decision core.",
    level: "info",
    link: "/dashboard/routes",
  },
  {
    title: "Hard-brake event logged",
    detail: "AVX-5590 decelerated 4.1 m/s² avoiding debris — evidence archived.",
    level: "critical",
    vehicle: "AVX-5590",
    link: "/dashboard/safety",
  },
];

type Value = {
  notifications: Notification[];
  all: Notification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  toggleRead: (id: string) => void;
  archive: (id: string) => void;
  clearAll: () => void;
  restoreAll: () => void;
  push: (n: Omit<Notification, "id" | "createdAt" | "read" | "archived">) => void;
};

const Ctx = createContext<Value | null>(null);

export function timeAgo(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Notification[]>(seed);

  const push = useCallback<Value["push"]>((n) => {
    setAll((prev) => [
      {
        ...n,
        id: `n-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        createdAt: Date.now(),
        read: false,
        archived: false,
      },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = incoming[Math.floor(Math.random() * incoming.length)];
      if (next) push(next);
    }, 45_000);
    return () => window.clearInterval(id);
  }, [push]);

  const value = useMemo<Value>(() => {
    const visible = all.filter((n) => !n.archived);
    return {
      all,
      notifications: visible,
      unread: visible.filter((n) => !n.read).length,
      markRead: (id) => setAll((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n))),
      toggleRead: (id) => setAll((p) => p.map((n) => (n.id === id ? { ...n, read: !n.read } : n))),
      markAllRead: () => setAll((p) => p.map((n) => ({ ...n, read: true }))),
      archive: (id) => setAll((p) => p.map((n) => (n.id === id ? { ...n, archived: true } : n))),
      clearAll: () => setAll((p) => p.map((n) => ({ ...n, archived: true, read: true }))),
      restoreAll: () => setAll((p) => p.map((n) => ({ ...n, archived: false }))),
      push,
    };
  }, [all, push]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
