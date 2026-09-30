import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Battery, Car, Gauge, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/kit";
import { alerts, fleetTrend, vehicles } from "@/lib/fleet-data";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function Overview() {
  const [live, setLive] = useState({ vehicles: 1284, miles: 92.4, latency: 38 });

  useEffect(() => {
    const id = window.setInterval(() => {
      setLive((p) => ({
        vehicles: p.vehicles + Math.round((Math.random() - 0.45) * 6),
        miles: Math.min(99, Math.max(85, +(p.miles + (Math.random() - 0.5) * 0.6).toFixed(1))),
        latency: Math.max(22, Math.min(60, p.latency + Math.round((Math.random() - 0.5) * 6))),
      }));
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard overview"
        title="Autonomous mobility control plane"
        copy="Live coordination across fleets, corridors and depots — perception, decisioning and routing reconciled into a single operational picture."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-primary" /> Telemetry streaming
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active vehicles"
          value={String(live.vehicles)}
          delta="+4.2% vs last week"
          icon={Car}
        />
        <StatCard
          label="Driverless miles"
          value={`${live.miles}%`}
          delta="Autonomy ratio"
          icon={Gauge}
        />
        <StatCard
          label="Decision latency"
          value={`${live.latency} ms`}
          delta="Edge inference"
          icon={Activity}
        />
        <StatCard
          label="Energy recovered"
          value="18.6 MWh"
          delta="Regen + smart charging"
          icon={Battery}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Fleet utilisation & autonomy"
          subtitle="Rolling 24 hours across all corridors"
        >
          <div className="h-[240px] sm:h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fleetTrend}>
                <defs>
                  <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="t"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="utilisation"
                  stroke="var(--color-primary)"
                  fill="url(#gu)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="autonomy"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Operational alerts" subtitle="Auto-triaged by the decision core">
          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.title}
                className="rounded-xl border border-border bg-surface-2/40 p-3.5 sm:p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm font-medium text-foreground">{a.title}</p>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground shrink-0">
                    {a.time}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{a.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Live fleet" subtitle="Vehicles currently under AutoViaX coordination">
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="text-[11px] sm:text-xs tracking-wide text-muted-foreground uppercase border-b border-border">
                  <th className="pb-3 font-medium">Vehicle</th>
                  <th className="pb-3 font-medium">Route</th>
                  <th className="pb-3 font-medium">Mode</th>
                  <th className="pb-3 font-medium">Charge</th>
                  <th className="pb-3 font-medium">ETA</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-border/50 last:border-0 hover:bg-surface-2/30 transition-colors"
                  >
                    <td className="py-3 font-semibold text-foreground text-xs sm:text-sm">
                      {v.id}
                    </td>
                    <td className="py-3 text-xs sm:text-sm text-muted-foreground">{v.route}</td>
                    <td className="py-3 text-xs sm:text-sm text-muted-foreground">{v.mode}</td>
                    <td className="py-3 text-xs sm:text-sm text-muted-foreground">{v.battery}%</td>
                    <td className="py-3 text-xs sm:text-sm text-muted-foreground">{v.eta}</td>
                    <td className="py-3">
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Incident pressure" subtitle="Interventions per 1,000 autonomous km">
          <div className="h-[220px] sm:h-[240px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fleetTrend}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="t"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="size-4 text-primary" /> 41% fewer interventions since fusion v4
            rollout
          </p>
        </Panel>
      </div>
    </>
  );
}
